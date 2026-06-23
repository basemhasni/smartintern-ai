from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.services.cv_analysis_v3 import analyze_cv_v3
from app.services.hybrid_matching_engine_v3 import HybridMatchingEngineV3
from app.services.offer_analysis_v3 import analyze_offer_v3
from app.utils.text_normalization import normalize_text
from evaluation.evaluators.quality_metrics import calculate_pass_fail, check_result, warning_result


ROOT = Path(__file__).resolve().parents[2]


def _as_dict(value: Any) -> dict:
    return value if isinstance(value, dict) else {}


def _as_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def _skill_item(skill_map: dict, skill: str) -> dict:
    target = normalize_text(skill)
    for key, value in skill_map.items():
        if normalize_text(str(key)) == target:
            return _as_dict(value)
    return {}


def _contains_any(actual: list[str], expected: list[str]) -> bool:
    actual_set = {normalize_text(item) for item in actual or []}
    expected_set = {normalize_text(item) for item in expected or []}
    return bool(actual_set & expected_set)


def _sensitive_text_found(explainability: dict) -> bool:
    text = json.dumps(explainability, ensure_ascii=False).lower()
    return any(token in text for token in ["passwordhash", "authorization", "bearer ", "embeddingjson"])


def evaluate_explainability_cases(cases_path: Path | None = None) -> dict:
    cases_path = cases_path or ROOT / "evaluation" / "cases" / "explainability_cases.json"
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    engine = HybridMatchingEngineV3()
    results = []

    for case in cases:
        offer_data = case["offer"]
        cv = analyze_cv_v3(case["cvText"])
        offer = analyze_offer_v3(
            offer_data.get("title", "Offre"),
            offer_data.get("description", ""),
            offer_data.get("requiredSkills", []),
            offer_data.get("optionalSkills", []),
        )
        result = engine.match(
            cv.get("skills", []),
            offer.get("requiredSkills", []),
            offer.get("optionalSkills", []),
            cv,
            offer,
            case["cvText"],
            offer_data.get("description", ""),
            True,
        )
        explainability = _as_dict(result.get("explainability"))
        skill_map = _as_dict(explainability.get("skillEvidenceMap"))
        signal_map = _as_dict(explainability.get("careerSignalMap"))
        categories = _as_list(signal_map.get("categories"))
        global_signals = _as_dict(signal_map.get("globalSignals"))
        trace = _as_list(explainability.get("decisionTrace"))
        expected = case.get("expected", {})
        checks = [
            check_result("explainability_present", bool(explainability), "explainability should be present"),
            check_result("skill_evidence_map_present", bool(skill_map), "skillEvidenceMap should be present"),
            check_result("career_signal_map_present", bool(categories), "careerSignalMap categories should be present"),
            check_result("decision_trace_present", len(trace) >= 3, "decisionTrace should have at least three steps"),
            check_result("no_sensitive_data", not _sensitive_text_found(explainability), "explainability should not expose sensitive data"),
        ]
        for skill, allowed_levels in _as_dict(expected.get("evidenceLevels")).items():
            item = _skill_item(skill_map, skill)
            checks.append(
                check_result(
                    f"evidence_level_{skill}",
                    item.get("evidenceLevel") in allowed_levels,
                    f"{skill} evidence={item.get('evidenceLevel')} expected={allowed_levels}",
                    details={"item": item},
                )
            )
            long_snippets = [snippet for snippet in _as_list(item.get("evidenceSnippets")) if len(str(snippet)) > 240]
            checks.append(check_result(f"short_snippets_{skill}", not long_snippets, f"{skill} snippets should stay short"))
        if expected.get("dominantDomains"):
            checks.append(
                check_result(
                    "dominant_domains",
                    _contains_any(_as_list(global_signals.get("dominantDomains")), expected["dominantDomains"]),
                    f"dominant={global_signals.get('dominantDomains')} expected one of {expected['dominantDomains']}",
                )
            )
        if expected.get("weakDomains"):
            checks.append(
                warning_result(
                    "weak_domains",
                    f"weak domains observed: {global_signals.get('weakDomains')}",
                    {"expected": expected["weakDomains"], "actual": global_signals.get("weakDomains")},
                )
                if not _contains_any(_as_list(global_signals.get("weakDomains")), expected["weakDomains"])
                else check_result("weak_domains", True, "weak domains coherent")
            )
        summary = calculate_pass_fail(checks)
        results.append(
            {
                "id": case["id"],
                "description": case.get("description", ""),
                "severity": summary["severity"],
                "passed": summary["passed"],
                "score": result.get("score"),
                "dominantDomains": global_signals.get("dominantDomains", []),
                "weakDomains": global_signals.get("weakDomains", []),
                "checks": checks,
            }
        )

    return {
        "suite": "Explainability",
        "total": len(results),
        "pass": sum(1 for item in results if item["severity"] == "PASS"),
        "warning": sum(1 for item in results if item["severity"] == "WARNING"),
        "fail": sum(1 for item in results if item["severity"] == "FAIL"),
        "results": results,
    }


def print_explainability_summary(summary: dict) -> None:
    for item in summary["results"]:
        print(f"[{item['severity']}] {item['id']} score={item['score']} dominant={item['dominantDomains']} weak={item['weakDomains']}")
    print(f"Explainability: {summary['pass']}/{summary['total']} PASS, {summary['warning']} WARNING, {summary['fail']} FAIL")
