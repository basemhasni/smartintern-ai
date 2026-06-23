from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

from app.services.motivation_letter_v2_service import generate_motivation_letter_v2
from evaluation.evaluators.quality_metrics import (
    assert_does_not_contain_forbidden_items,
    assert_no_missing_skill_claimed,
    assert_quality_checks_passed,
    calculate_pass_fail,
    check_result,
)


ROOT = Path(__file__).resolve().parents[2]


def _load_cases(path: Path) -> list[dict]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    by_id = {case["id"]: case for case in raw}
    resolved = []
    for case in raw:
        item = deepcopy(case)
        if item.get("copyFrom"):
            base = deepcopy(by_id[item["copyFrom"]])
            base.update({key: value for key, value in item.items() if key not in {"copyFrom"}})
            item = base
        resolved.append(item)
    return resolved


def evaluate_letter_cases(cases_path: Path | None = None) -> dict:
    cases_path = cases_path or ROOT / "evaluation" / "cases" / "motivation_letter_cases.json"
    results = []
    all_no_missing_claimed = True
    quality_passes = 0

    for case in _load_cases(cases_path):
        payload = {
            "student": case["student"],
            "candidateSkills": case.get("cvAnalysis", {}).get("detectedSkills", []),
            "offer": case["offer"],
            "company": case.get("company", {}),
            "matching": case["matching"],
            "matchingResult": case["matching"],
            "cvAnalysis": case.get("cvAnalysis", {}),
            "tone": case.get("tone", "PROFESSIONAL"),
        }
        result = generate_motivation_letter_v2(payload)
        v2 = result["v2"]
        quality = v2.get("qualityChecks", {})
        missing = case.get("expected", {}).get("missingSkills") or case.get("matching", {}).get("v3", {}).get("missingRequiredSkills", []) or case.get("matching", {}).get("missingSkills", [])
        checks = [
            check_result("tone", result.get("tone") == case.get("tone", "PROFESSIONAL"), f"tone={result.get('tone')} expected={case.get('tone')}"),
            assert_does_not_contain_forbidden_items(result.get("content", ""), ["undefined", "none"], "no_undefined"),
            assert_no_missing_skill_claimed(result.get("content", ""), missing),
            assert_quality_checks_passed(quality),
            check_result("mentions_offer", bool(quality.get("mentionsOffer")), "letter should mention offer"),
            check_result("structure", bool(quality.get("hasClearStructure")), "letter should have clear structure"),
            check_result("personalization_score", 0 <= float(v2.get("personalizationScore", 0)) <= 1, "personalizationScore must be 0..1"),
        ]
        if case.get("expected", {}).get("mentionCompany"):
            checks.append(check_result("mentions_company", bool(quality.get("mentionsCompany")), "letter should mention company when provided"))
        if case.get("expected", {}).get("avoidedClaims"):
            checks.append(check_result("avoided_claims", bool(v2.get("avoidedClaims")), "missing/critical skills should produce avoidedClaims"))
        if case.get("expected", {}).get("needsWarning"):
            checks.append(check_result("warnings", bool(v2.get("warnings")), "insufficient data should add warnings"))

        no_claim = checks[2]["passed"]
        all_no_missing_claimed = all_no_missing_claimed and no_claim
        if checks[3]["passed"]:
            quality_passes += 1
        summary = calculate_pass_fail(checks)
        results.append({"id": case["id"], "severity": summary["severity"], "passed": summary["passed"], "tone": result.get("tone"), "personalizationScore": v2.get("personalizationScore"), "qualityChecks": quality, "checks": checks})

    return {
        "suite": "Motivation Letter V2",
        "total": len(results),
        "pass": sum(1 for item in results if item["severity"] == "PASS"),
        "warning": sum(1 for item in results if item["severity"] == "WARNING"),
        "fail": sum(1 for item in results if item["severity"] == "FAIL"),
        "qualityChecksRate": round(quality_passes / len(results), 2) if results else 0,
        "noMissingSkillClaimed": all_no_missing_claimed,
        "results": results,
    }


def print_letter_summary(summary: dict) -> None:
    for item in summary["results"]:
        print(f"[{item['severity']}] {item['id']} tone={item['tone']} personalization={item['personalizationScore']}")
    print(f"Motivation Letter V2: {summary['pass']}/{summary['total']} PASS, {summary['warning']} WARNING, {summary['fail']} FAIL")
