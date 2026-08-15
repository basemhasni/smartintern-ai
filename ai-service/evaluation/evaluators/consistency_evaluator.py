from __future__ import annotations

import json
from pathlib import Path
from statistics import mean
from time import perf_counter
from typing import Any

from app.services.cv_analysis_v3 import analyze_cv_v3
from app.services.hybrid_matching_engine_v3 import HybridMatchingEngineV3
from app.services.offer_analysis_v3 import analyze_offer_v3
from app.utils.text_normalization import normalize_text
from evaluation.evaluators.quality_metrics import calculate_pass_fail, check_result


ROOT = Path(__file__).resolve().parents[2]


def _key(value: Any) -> str:
    return normalize_text(str(value or ""))


def _match(profile: dict, offer_input: dict, debug: bool = True) -> dict:
    cv = analyze_cv_v3(profile.get("text", ""))
    offer = analyze_offer_v3(
        offer_input.get("title", "Offre"),
        offer_input.get("description", ""),
        offer_input.get("requiredSkills", []),
        offer_input.get("optionalSkills", []),
    )
    return HybridMatchingEngineV3().match(
        profile.get("skills") or cv.get("skills", []),
        offer.get("requiredSkills", []),
        offer.get("optionalSkills", []),
        cv,
        offer,
        profile.get("text", ""),
        offer_input.get("description", ""),
        debug,
    )


def _row(result: dict, requirement: str) -> dict:
    target = _key(requirement)
    return next(
        (row for row in result.get("v3", {}).get("coverageMatrix", []) if _key(row.get("requirement")) == target),
        {},
    )


def _evidence_level(result: dict, requirement: str) -> str:
    target = _key(requirement)
    evidence_map = result.get("explainability", {}).get("skillEvidenceMap", {})
    for skill, evidence in evidence_map.items():
        if _key(skill) == target:
            return str(evidence.get("evidenceLevel") or "")
    return ""


def _scenario_result(case: dict, profiles: dict, offers: dict) -> dict:
    result = _match(profiles[case["profileId"]], offers[case["offerId"]])
    row = _row(result, case["requirement"])
    matched = {_key(skill) for skill in result.get("matchedSkills", [])}
    checks = [
        check_result("score_bounds", 0 <= result.get("score", -1) <= 100, f"score={result.get('score')}"),
        check_result("coverage_row", bool(row), f"requirement={case['requirement']}"),
    ]
    if case.get("expectedMatchType"):
        checks.append(check_result("match_type", row.get("matchType") == case["expectedMatchType"], f"matchType={row.get('matchType')} expected={case['expectedMatchType']}"))
    if case.get("expectedEvidenceLevel"):
        level = _evidence_level(result, case["requirement"])
        checks.append(check_result("evidence_level", level == case["expectedEvidenceLevel"], f"evidenceLevel={level} expected={case['expectedEvidenceLevel']}"))
    if case.get("confidence"):
        checks.append(check_result("confidence", result.get("confidence") == case["confidence"], f"confidence={result.get('confidence')} expected={case['confidence']}"))
    if case.get("scoreMin") is not None:
        checks.append(check_result("score_min", result.get("score", 0) >= case["scoreMin"], f"score={result.get('score')} expected>={case['scoreMin']}"))
    if case.get("scoreMax") is not None:
        checks.append(check_result("score_max", result.get("score", 101) <= case["scoreMax"], f"score={result.get('score')} expected<={case['scoreMax']}"))
    forbidden = {_key(skill) for skill in case.get("forbiddenMatched", [])}
    checks.append(check_result("no_false_positive", not (forbidden & matched), f"forbidden matched={sorted(forbidden & matched)}"))
    expected = {_key(skill) for skill in case.get("expectedMatched", [])}
    checks.append(check_result("expected_matches", expected.issubset(matched), f"missing matches={sorted(expected - matched)}"))
    summary = calculate_pass_fail(checks)
    return {
        "id": case["id"],
        "category": case["category"],
        "severity": summary["severity"],
        "passed": summary["passed"],
        "score": result.get("score"),
        "confidence": result.get("confidence"),
        "decisionLabel": result.get("decisionLabel"),
        "checks": checks,
    }


def _metamorphic_results(profiles: dict, offers: dict) -> list[dict]:
    base = _match(profiles["PROFILE-06"], offers["OFFER-01"])
    proved = _match(
        {
            "text": "Projet frontend realise avec React et TypeScript. J ai construit les composants, les formulaires et les tests.",
            "skills": ["React", "TypeScript"],
        },
        offers["OFFER-01"],
    )
    relevant_check = check_result("relevant_evidence_non_decreasing", proved["score"] >= base["score"], f"base={base['score']} proved={proved['score']}")

    reference = _match(profiles["PROFILE-01"], offers["OFFER-01"])
    unrelated_profile = {**profiles["PROFILE-01"], "skills": profiles["PROFILE-01"]["skills"] + ["Jira"]}
    unrelated = _match(unrelated_profile, offers["OFFER-01"])
    unrelated_check = check_result("unrelated_skill_stability", abs(unrelated["score"] - reference["score"]) <= 2, f"reference={reference['score']} unrelated={unrelated['score']}")

    alias = _match(
        {"text": "Projet backend realise avec Postgres. J ai cree les migrations et optimise les requetes.", "skills": ["Postgres"]},
        offers["OFFER-04"],
    )
    canonical = _match(
        {"text": "Projet backend realise avec PostgreSQL. J ai cree les migrations et optimise les requetes.", "skills": ["PostgreSQL"]},
        offers["OFFER-04"],
    )
    alias_check = check_result("alias_equivalence", abs(alias["score"] - canonical["score"]) <= 2, f"alias={alias['score']} canonical={canonical['score']}")

    repeated = [_match(profiles["PROFILE-01"], offers["OFFER-01"], False) for _ in range(3)]
    signatures = {(item["score"], item["confidence"], item["decisionLabel"], tuple(item["matchedSkills"])) for item in repeated}
    stability_check = check_result("deterministic_stability", len(signatures) == 1, f"signatures={len(signatures)}")

    return [
        {"id": "QC-M01", "category": "metamorphic", "severity": "PASS" if relevant_check["passed"] else "FAIL", "passed": relevant_check["passed"], "checks": [relevant_check]},
        {"id": "QC-M02", "category": "metamorphic", "severity": "PASS" if unrelated_check["passed"] else "FAIL", "passed": unrelated_check["passed"], "checks": [unrelated_check]},
        {"id": "QC-M03", "category": "alias_stability", "severity": "PASS" if alias_check["passed"] else "FAIL", "passed": alias_check["passed"], "checks": [alias_check]},
        {"id": "QC-M04", "category": "repeatability", "severity": "PASS" if stability_check["passed"] else "FAIL", "passed": stability_check["passed"], "checks": [stability_check]},
    ]


def evaluate_consistency_cases(cases_path: Path | None = None) -> dict:
    cases_path = cases_path or ROOT / "evaluation" / "cases" / "ai_quality_consistency_cases.json"
    dataset = json.loads(cases_path.read_text(encoding="utf-8"))
    profiles = {item["id"]: item for item in dataset["profiles"]}
    offers = {item["id"]: item for item in dataset["offers"]}
    results = [_scenario_result(case, profiles, offers) for case in dataset["scenarios"]]
    results.extend(_metamorphic_results(profiles, offers))

    timings = []
    for _ in range(5):
        start = perf_counter()
        _match(profiles["PROFILE-01"], offers["OFFER-01"], False)
        timings.append((perf_counter() - start) * 1000)

    categories = sorted({item["category"] for item in results})
    category_metrics = {
        category: {
            "total": sum(1 for item in results if item["category"] == category),
            "pass": sum(1 for item in results if item["category"] == category and item["passed"]),
        }
        for category in categories
    }
    false_positive_cases = [item for item in results if item["category"] == "false_positive"]
    false_negative_cases = [item for item in results if item["category"] == "true_positive"]
    passed = sum(1 for item in results if item["passed"])
    return {
        "suite": "AI Quality Consistency",
        "total": len(results),
        "pass": passed,
        "warning": 0,
        "fail": len(results) - passed,
        "consistencyScore": round(passed / len(results), 3) if results else 0,
        "criticalFalsePositiveRate": round(sum(not item["passed"] for item in false_positive_cases) / len(false_positive_cases), 3) if false_positive_cases else 0,
        "criticalFalseNegativeRate": round(sum(not item["passed"] for item in false_negative_cases) / len(false_negative_cases), 3) if false_negative_cases else 0,
        "categoryMetrics": category_metrics,
        "performanceMs": {"min": round(min(timings), 2), "average": round(mean(timings), 2), "max": round(max(timings), 2)},
        "results": results,
    }

