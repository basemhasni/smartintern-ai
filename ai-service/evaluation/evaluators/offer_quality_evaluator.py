from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.services.offer_quality_analyzer_service import analyze_offer_quality
from app.services.skill_extraction_service import canonicalize_skill_list, extract_skills_from_text
from app.utils.text_normalization import normalize_text
from evaluation.evaluators.quality_metrics import assert_score_in_range, calculate_pass_fail, check_result


ROOT = Path(__file__).resolve().parents[2]


def _as_dict(value: Any) -> dict:
    return value if isinstance(value, dict) else {}


def _as_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def _keys(values: list[Any]) -> set[str]:
    return {normalize_text(str(item)) for item in values if isinstance(item, str)}


def evaluate_offer_quality_cases(cases_path: Path | None = None) -> dict:
    cases_path = cases_path or ROOT / "evaluation" / "cases" / "offer_quality_cases.json"
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    results = []

    for case in cases:
        offer = case["offer"]
        expected = case.get("expected", {})
        result = analyze_offer_quality(offer)
        issues = _as_list(result.get("issues"))
        issue_types = {str(_as_dict(item).get("type")) for item in issues}
        draft = _as_dict(result.get("improvedOfferDraft"))
        draft_required = _as_list(draft.get("requiredSkills"))
        draft_optional = _as_list(draft.get("optionalSkills"))
        source_skills = canonicalize_skill_list(
            _as_list(offer.get("requiredSkills"))
            + _as_list(offer.get("optionalSkills"))
            + extract_skills_from_text(f"{offer.get('title', '')} {offer.get('description', '')}")
        )
        draft_skills = canonicalize_skill_list(draft_required + draft_optional)
        raw_result = json.dumps(result, ensure_ascii=False).lower()
        checks = [
            assert_score_in_range(result.get("qualityScore"), expected.get("scoreMin", 0), expected.get("scoreMax", 100), "quality_score"),
            check_result("quality_level", not expected.get("levels") or result.get("qualityLevel") in expected["levels"], f"level={result.get('qualityLevel')} expected={expected.get('levels')}"),
            check_result("matching_readiness", result.get("matchingReadiness") in expected.get("matchingReadiness", ["HIGH", "MEDIUM", "LOW", "INSUFFICIENT"]), f"readiness={result.get('matchingReadiness')} expected={expected.get('matchingReadiness')}"),
            check_result("expected_issues", set(expected.get("issues", [])).issubset(issue_types), f"issues={sorted(issue_types)} expected={expected.get('issues', [])}"),
            check_result("improved_draft", bool(draft) and bool(draft.get("title")) and bool(draft.get("description")), "improved offer draft should be present"),
            check_result("decision_trace", len(_as_list(result.get("decisionTrace"))) >= 4, "decision trace should explain the quality score"),
            check_result("no_undefined", "undefined" not in raw_result and '"null"' not in raw_result, "response should not expose undefined or string null"),
            check_result("draft_no_overlap", not (_keys(draft_required) & _keys(draft_optional)), "draft required and optional skills should not overlap"),
            check_result("no_invented_technology", _keys(draft_skills).issubset(_keys(source_skills)), f"draft skills={draft_skills} source skills={source_skills}"),
        ]
        if expected.get("draftRequiredMax") is not None:
            checks.append(check_result("draft_required_limit", len(draft_required) <= expected["draftRequiredMax"], f"draft required count={len(draft_required)}"))
        if expected.get("improvedTitleDifferent"):
            checks.append(check_result("improved_title", normalize_text(draft.get("title", "")) != normalize_text(offer.get("title", "")), "generic title should be improved"))
        summary = calculate_pass_fail(checks)
        results.append(
            {
                "id": case["id"],
                "severity": summary["severity"],
                "passed": summary["passed"],
                "qualityScore": result.get("qualityScore"),
                "qualityLevel": result.get("qualityLevel"),
                "matchingReadiness": result.get("matchingReadiness"),
                "issues": sorted(issue_types),
                "checks": checks,
            }
        )

    return {
        "suite": "Offer Quality Analyzer",
        "total": len(results),
        "pass": sum(1 for item in results if item["severity"] == "PASS"),
        "warning": sum(1 for item in results if item["severity"] == "WARNING"),
        "fail": sum(1 for item in results if item["severity"] == "FAIL"),
        "averageQualityScore": round(sum(item["qualityScore"] for item in results) / len(results), 2) if results else 0,
        "results": results,
    }


def print_offer_quality_summary(summary: dict) -> None:
    for item in summary["results"]:
        print(
            f"[{item['severity']}] {item['id']} score={item['qualityScore']} "
            f"level={item['qualityLevel']} readiness={item['matchingReadiness']} issues={item['issues']}"
        )
    print(f"Offer Quality Analyzer: {summary['pass']}/{summary['total']} PASS, {summary['warning']} WARNING, {summary['fail']} FAIL")
