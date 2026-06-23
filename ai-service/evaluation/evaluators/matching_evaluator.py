from __future__ import annotations

import json
from pathlib import Path

from app.services.cv_analysis_v3 import analyze_cv_v3
from app.services.hybrid_matching_engine_v3 import HybridMatchingEngineV3
from app.services.offer_analysis_v3 import analyze_offer_v3
from evaluation.evaluators.quality_metrics import (
    assert_contains_expected_items,
    assert_score_in_range,
    calculate_pass_fail,
    check_result,
    warning_result,
)


ROOT = Path(__file__).resolve().parents[2]


def evaluate_matching_cases(cases_path: Path | None = None) -> dict:
    cases_path = cases_path or ROOT / "evaluation" / "cases" / "matching_cases.json"
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    engine = HybridMatchingEngineV3()
    results = []
    scores = []

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
            case.get("cvText"),
            offer_data.get("description"),
            True,
        )
        expected = case.get("expected", {})
        scores.append(result.get("score", 0))
        checks = [
            assert_score_in_range(result.get("score"), expected.get("scoreMin", 0), expected.get("scoreMax", 100)),
            check_result(
                "decision_label",
                result.get("decisionLabel") in expected.get("decisionLabels", [result.get("decisionLabel")]),
                f"decision={result.get('decisionLabel')} expected={expected.get('decisionLabels')}",
            ),
            assert_contains_expected_items(result.get("matchedSkills", []), expected.get("matchedSkills", []), "matched_skills"),
            assert_contains_expected_items(result.get("v3", {}).get("missingRequiredSkills", []), expected.get("missingRequiredSkills", []), "missing_required_skills"),
            assert_contains_expected_items(result.get("v3", {}).get("criticalMissingSkills", []), expected.get("criticalMissingSkills", []), "critical_missing_skills"),
            check_result(
                "coverage_matrix_present",
                not offer.get("requiredSkills") or bool(result.get("v3", {}).get("coverageMatrix")),
                "coverageMatrix expected when required skills exist",
            ),
            check_result("score_bounds", 0 <= int(result.get("score", 0)) <= 100, "score must be 0..100"),
        ]
        if expected.get("confidence"):
            checks.append(check_result("confidence", result.get("confidence") == expected["confidence"], f"confidence={result.get('confidence')} expected={expected['confidence']}"))
        if not expected.get("matchedSkills") and offer.get("requiredSkills") and result.get("score", 0) > 60:
            checks.append(warning_result("no_required_high_score", "score is high while no expected required skill is matched", {"score": result.get("score")}))
        summary = calculate_pass_fail(checks)
        results.append(
            {
                "id": case["id"],
                "description": case.get("description", ""),
                "severity": summary["severity"],
                "passed": summary["passed"],
                "score": result.get("score"),
                "decisionLabel": result.get("decisionLabel"),
                "confidence": result.get("confidence"),
                "matchedSkills": result.get("matchedSkills", []),
                "missingRequiredSkills": result.get("v3", {}).get("missingRequiredSkills", []),
                "checks": checks,
            }
        )

    return {
        "suite": "Matching V3",
        "total": len(results),
        "pass": sum(1 for item in results if item["severity"] == "PASS"),
        "warning": sum(1 for item in results if item["severity"] == "WARNING"),
        "fail": sum(1 for item in results if item["severity"] == "FAIL"),
        "averageScore": round(sum(scores) / len(scores), 2) if scores else 0,
        "results": results,
    }


def print_matching_summary(summary: dict) -> None:
    for item in summary["results"]:
        print(f"[{item['severity']}] {item['id']} score={item['score']} label={item['decisionLabel']}")
    print(f"Matching V3: {summary['pass']}/{summary['total']} PASS, {summary['warning']} WARNING, {summary['fail']} FAIL")
