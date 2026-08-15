from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.services.cv_analysis_v3 import analyze_cv_v3
from app.services.hybrid_matching_engine_v3 import HybridMatchingEngineV3
from app.services.offer_analysis_v3 import analyze_offer_v3
from app.services.skill_gap_simulator_service import simulate_skill_gap_impact
from app.utils.text_normalization import normalize_text
from evaluation.evaluators.quality_metrics import calculate_pass_fail, check_result


ROOT = Path(__file__).resolve().parents[2]


def _as_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def _key(value: Any) -> str:
    return normalize_text(str(value or ""))


def _find_gap(result: dict, skill: str) -> dict:
    return next((item for item in result.get("highImpactGaps", []) if _key(item.get("skill")) == _key(skill)), {})


def _find_single(result: dict, skill: str) -> dict:
    return next((item for item in result.get("singleSkillSimulations", []) if _key(item.get("skill")) == _key(skill)), {})


def _project_text(result: dict) -> str:
    return normalize_text(json.dumps(result.get("recommendedProjects", []), ensure_ascii=False))


def evaluate_skill_gap_simulator_cases(cases_path: Path | None = None) -> dict:
    cases_path = cases_path or ROOT / "evaluation" / "cases" / "skill_gap_simulator_cases.json"
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    engine = HybridMatchingEngineV3()
    results = []

    for case in cases:
        offer_input = case["offer"]
        cv = analyze_cv_v3(case["cvText"])
        offer = analyze_offer_v3(
            offer_input.get("title", "Offre"),
            offer_input.get("description", ""),
            offer_input.get("requiredSkills", []),
            offer_input.get("optionalSkills", []),
        )
        matching = engine.match(
            cv.get("skills", []),
            offer.get("requiredSkills", []),
            offer.get("optionalSkills", []),
            cv,
            offer,
            case["cvText"],
            offer_input.get("description", ""),
            True,
        )
        result = simulate_skill_gap_impact(
            matching,
            options={
                "simulationMode": "REALISTIC",
                "maxCombinations": 3,
                "includeProjects": True,
                "includeDecisionTrace": True,
            },
        )
        expected = case.get("expected", {})
        checks = [
            check_result("current_score_bounds", 0 <= result.get("currentScore", -1) <= 100, "current score should stay in bounds"),
            check_result("potential_score_bounds", 0 <= result.get("potentialBestScore", -1) <= 100, "potential score should stay in bounds"),
            check_result("non_negative_gain", result.get("potentialBestScore", 0) >= result.get("currentScore", 0) and result.get("scoreGain", -1) >= 0, "potential score and gain should not decrease"),
            check_result(
                "potential_not_inflated",
                result.get("potentialBestScore", 101) <= max(95, result.get("currentScore", 0)),
                "potential score should stay at or below 95 unless the current verified score is already higher",
            ),
            check_result("recommended_path_coherent", not result.get("highImpactGaps") or bool(result.get("recommendedPath")), "identified gaps need a recommended path"),
            check_result("decision_trace", len(result.get("decisionTrace", [])) >= 3, "simulation decision trace should explain the estimate"),
        ]

        target_skill = expected.get("topSkill")
        if target_skill:
            gap = _find_gap(result, target_skill)
            single = _find_single(result, target_skill)
            checks.extend(
                [
                    check_result("top_skill_present", bool(gap), f"{target_skill} should be identified as a gap"),
                    check_result("top_skill_priority", not expected.get("priority") or gap.get("priority") == expected["priority"], f"priority={gap.get('priority')} expected={expected.get('priority')}"),
                    check_result("top_skill_type", not expected.get("gapType") or gap.get("gapType") == expected["gapType"], f"gapType={gap.get('gapType')} expected={expected.get('gapType')}"),
                    check_result("top_skill_is_first", bool(result.get("highImpactGaps")) and _key(result["highImpactGaps"][0].get("skill")) == _key(target_skill), f"first gap should be {target_skill}"),
                    check_result("single_simulation_present", bool(single), f"single simulation expected for {target_skill}"),
                ]
            )
            if expected.get("singleGainMin") is not None:
                checks.append(check_result("single_gain_min", single.get("gain", 0) >= expected["singleGainMin"], f"gain={single.get('gain')} expected >= {expected['singleGainMin']}"))
            if expected.get("singleGainMax") is not None:
                checks.append(check_result("single_gain_max", single.get("gain", 999) <= expected["singleGainMax"], f"gain={single.get('gain')} expected <= {expected['singleGainMax']}"))

        for skill in expected.get("topSkillsInclude", []):
            checks.append(check_result(f"gap_{skill}", bool(_find_gap(result, skill)), f"{skill} should be present in high impact gaps"))
        if expected.get("allowedGapTypes") and expected.get("topSkillsInclude"):
            item = _find_gap(result, expected["topSkillsInclude"][0])
            checks.append(check_result("allowed_gap_type", item.get("gapType") in expected["allowedGapTypes"], f"gapType={item.get('gapType')} expected={expected['allowedGapTypes']}"))
            single = _find_single(result, expected["topSkillsInclude"][0])
            if expected.get("singleGainMin") is not None:
                checks.append(check_result("single_gain_min", single.get("gain", 0) >= expected["singleGainMin"], f"gain={single.get('gain')} expected >= {expected['singleGainMin']}"))

        if expected.get("projectContains"):
            checks.append(check_result("project_coherence", _key(expected["projectContains"]) in _project_text(result), f"project should cover {expected['projectContains']}"))
        if expected.get("potentialMax") is not None:
            checks.append(check_result("expected_potential_cap", result.get("potentialBestScore", 101) <= expected["potentialMax"], f"potential={result.get('potentialBestScore')} expected <= {expected['potentialMax']}"))
        if expected.get("requiresCap") is not None:
            checks.append(check_result("required_cap_explained", any(item.get("cap") == expected["requiresCap"] for item in result.get("scoreCapsApplied", [])), f"cap {expected['requiresCap']} should be explained"))
        if expected.get("simulationMode"):
            checks.append(check_result("simulation_mode", result.get("simulationMode") == expected["simulationMode"], f"mode={result.get('simulationMode')} expected={expected['simulationMode']}"))
        if expected.get("combinationGainPositive"):
            checks.append(check_result("combination_positive", any(item.get("gain", 0) > 0 for item in result.get("combinationSimulations", [])), "at least one combination should improve the score"))
        if expected.get("combinationBeatsSingle"):
            max_single = max((item.get("gain", 0) for item in result.get("singleSkillSimulations", [])), default=0)
            max_combo = max((item.get("gain", 0) for item in result.get("combinationSimulations", [])), default=0)
            checks.append(check_result("combination_beats_single", max_combo > max_single, f"combination gain={max_combo} should exceed single gain={max_single}"))
        for skill in expected.get("notPrioritySkills", []):
            checks.append(check_result(f"not_priority_{skill}", not _find_gap(result, skill), f"strong skill {skill} should not be proposed as a gap"))
        if expected.get("scoreGainMax") is not None:
            checks.append(check_result("score_gain_max", result.get("scoreGain", 999) <= expected["scoreGainMax"], f"scoreGain={result.get('scoreGain')} expected <= {expected['scoreGainMax']}"))
        if expected.get("notEquivalentSkill"):
            target = expected.get("topSkill", "React")
            target_gap = _find_gap(result, target)
            checks.append(check_result("related_not_exact", bool(target_gap), f"{expected['notEquivalentSkill']} should not remove the {target} gap"))

        summary = calculate_pass_fail(checks)
        results.append(
            {
                "id": case["id"],
                "description": case.get("description", ""),
                "severity": summary["severity"],
                "passed": summary["passed"],
                "currentScore": result.get("currentScore"),
                "potentialBestScore": result.get("potentialBestScore"),
                "scoreGain": result.get("scoreGain"),
                "simulationMode": result.get("simulationMode"),
                "warnings": result.get("warnings", []),
                "checks": checks,
            }
        )

    return {
        "suite": "Skill Gap Simulator",
        "total": len(results),
        "pass": sum(1 for item in results if item["severity"] == "PASS"),
        "warning": sum(1 for item in results if item["severity"] == "WARNING"),
        "fail": sum(1 for item in results if item["severity"] == "FAIL"),
        "averagePotentialGain": round(sum(item["scoreGain"] for item in results) / len(results), 2) if results else 0,
        "results": results,
    }


def print_skill_gap_simulator_summary(summary: dict) -> None:
    for item in summary["results"]:
        print(
            f"[{item['severity']}] {item['id']} current={item['currentScore']} "
            f"potential={item['potentialBestScore']} gain={item['scoreGain']} mode={item['simulationMode']}"
        )
    print(f"Skill Gap Simulator: {summary['pass']}/{summary['total']} PASS, {summary['warning']} WARNING, {summary['fail']} FAIL")
