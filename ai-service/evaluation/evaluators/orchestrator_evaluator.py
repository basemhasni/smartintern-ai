from __future__ import annotations

import json
from pathlib import Path

from app.orchestration.intent_router import build_execution_plan, resolve_intent
from app.orchestration.orchestrator_v2 import orchestrate_v2
from evaluation.evaluators.quality_metrics import assert_status_success_or_partial, calculate_pass_fail, check_result


ROOT = Path(__file__).resolve().parents[2]


def evaluate_orchestrator_cases(cases_path: Path | None = None) -> dict:
    cases_path = cases_path or ROOT / "evaluation" / "cases" / "orchestrator_cases.json"
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    results = []

    for case in cases:
        payload = case["payload"]
        result = orchestrate_v2(payload)
        expected = case.get("expected", {})
        steps = [item.get("name") for item in result.get("steps", [])]
        plan = build_execution_plan(resolve_intent(payload.get("intent"), payload.get("question")), payload.get("options") or {})
        checks = [
            check_result("intent", not expected.get("intent") or result.get("intent") == expected["intent"], f"intent={result.get('intent')} expected={expected.get('intent')}"),
            check_result("quality_control", bool(result.get("qualityControl")), "qualityControl should be present"),
            check_result("steps_present", result.get("intent") == "UNKNOWN" or bool(result.get("steps")), "steps should be present for known intents"),
            check_result("execution_plan", bool(plan) or result.get("intent") == "UNKNOWN", "execution plan should be buildable"),
        ]
        if expected.get("status"):
            checks.append(check_result("status", result.get("status") == expected["status"], f"status={result.get('status')} expected={expected['status']}"))
        else:
            checks.append(assert_status_success_or_partial(result))
        if expected.get("allowsPartialSuccess"):
            checks.append(check_result("allows_partial", result.get("status") in {"SUCCESS", "PARTIAL_SUCCESS"}, f"status={result.get('status')}"))
        if expected.get("needsMatching"):
            checks.append(check_result("matching_present", bool(result.get("results", {}).get("matching")), "matching result expected"))
        if expected.get("needsCareerAdvice"):
            checks.append(check_result("career_present", bool(result.get("results", {}).get("careerAdvice")), "career advice expected"))
        if expected.get("needsSkillGapSimulation"):
            checks.append(check_result("skill_gap_simulation_present", bool(result.get("results", {}).get("skillGapSimulation")), "skill gap simulation expected"))
        if expected.get("needsOfferQualityAnalysis"):
            checks.append(check_result("offer_quality_present", bool(result.get("results", {}).get("offerQualityAnalysis")), "offer quality analysis expected"))
        if expected.get("needsLetter"):
            checks.append(check_result("letter_present", bool(result.get("results", {}).get("motivationLetter")), "motivation letter expected"))
        if expected.get("lowConfidence"):
            checks.append(check_result("low_confidence", (result.get("results", {}).get("matching") or {}).get("confidence") in {"LOW", "MEDIUM"}, "poor CV should not be high confidence"))
        if expected.get("needsQualityControl"):
            checks.append(check_result("qc_checks", bool(result.get("qualityControl", {}).get("checks")), "quality checks expected"))
        summary = calculate_pass_fail(checks)
        results.append({"id": case["id"], "severity": summary["severity"], "passed": summary["passed"], "status": result.get("status"), "intent": result.get("intent"), "steps": steps, "checks": checks})

    return {
        "suite": "Orchestrator V2",
        "total": len(results),
        "pass": sum(1 for item in results if item["severity"] == "PASS"),
        "warning": sum(1 for item in results if item["severity"] == "WARNING"),
        "fail": sum(1 for item in results if item["severity"] == "FAIL"),
        "successRate": round(sum(1 for item in results if item["status"] in {"SUCCESS", "PARTIAL_SUCCESS"}) / len(results), 2) if results else 0,
        "results": results,
    }


def print_orchestrator_summary(summary: dict) -> None:
    for item in summary["results"]:
        print(f"[{item['severity']}] {item['id']} status={item['status']} intent={item['intent']}")
    print(f"Orchestrator V2: {summary['pass']}/{summary['total']} PASS, {summary['warning']} WARNING, {summary['fail']} FAIL")
