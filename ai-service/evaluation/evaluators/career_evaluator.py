from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

from app.services.career_assistant_v2_service import generate_career_advice_v2
from evaluation.evaluators.quality_metrics import assert_non_generic_text, calculate_pass_fail, check_result


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_STUDENT = {"firstName": "Nabil", "lastName": "Haddad", "educationLevel": "Licence Informatique"}
DEFAULT_OFFER = {
    "id": "offer",
    "title": "Stage cible",
    "description": "Offre de stage cible",
    "requiredSkills": ["React"],
    "optionalSkills": ["Docker"],
    "companyName": "SmartTech",
}


def _load_cases(path: Path) -> list[dict]:
    cases = json.loads(path.read_text(encoding="utf-8"))
    by_id = {case["id"]: case for case in cases}
    resolved = []
    for case in cases:
        item = deepcopy(case)
        if item.get("matchingRef"):
            item["matching"] = deepcopy(by_id[item["matchingRef"]]["matching"])
        resolved.append(item)
    return resolved


def evaluate_career_cases(cases_path: Path | None = None) -> dict:
    cases_path = cases_path or ROOT / "evaluation" / "cases" / "career_assistant_cases.json"
    results = []
    for case in _load_cases(cases_path):
        payload = {
            "student": DEFAULT_STUDENT,
            "offer": DEFAULT_OFFER,
            "matching": case["matching"],
            "question": case.get("question"),
            "ragContextDocuments": case.get("ragContextDocuments", []),
        }
        result = generate_career_advice_v2(payload)
        v2 = result["v2"]
        expected = case.get("expected", {})
        priority_skills = [item.get("skill") for item in v2.get("priorityFocus", [])]
        project_skills = [skill for project in v2.get("recommendedProjects", []) for skill in project.get("skillsCovered", [])]
        critical_skills = [item.get("skill") for item in v2.get("criticalGaps", [])]
        checks = [
            check_result("readiness_level", not expected.get("readinessLevel") or v2.get("readinessLevel") == expected.get("readinessLevel"), f"readiness={v2.get('readinessLevel')} expected={expected.get('readinessLevel')}"),
            check_result("question_intent", not expected.get("questionIntent") or v2.get("questionIntent") == expected.get("questionIntent"), f"intent={v2.get('questionIntent')} expected={expected.get('questionIntent')}"),
            assert_non_generic_text(result.get("finalAdvice", ""), "final_advice_non_generic"),
            check_result("learning_roadmap", bool(v2.get("learningRoadmap")), "learningRoadmap should not be empty"),
            check_result("cv_tips", bool(v2.get("cvImprovementTips")), "cvImprovementTips should not be empty"),
        ]
        if expected.get("prioritySkills"):
            checks.append(check_result("priority_focus", set(expected["prioritySkills"]).issubset(set(priority_skills)), f"priority={priority_skills} expected={expected['prioritySkills']}"))
        if expected.get("criticalSkills"):
            checks.append(check_result("critical_gaps", set(expected["criticalSkills"]).issubset(set(critical_skills)), f"critical={critical_skills} expected={expected['criticalSkills']}"))
        if expected.get("projectSkills"):
            checks.append(check_result("recommended_projects", set(expected["projectSkills"]).issubset(set(project_skills)), f"projectSkills={project_skills} expected={expected['projectSkills']}"))
        if expected.get("needsProjects"):
            checks.append(check_result("needs_projects", bool(v2.get("recommendedProjects")), "project-oriented question should return projects"))
        if expected.get("needsCvTips"):
            checks.append(check_result("needs_cv_tips", bool(v2.get("cvImprovementTips")), "CV question should return CV tips"))
        if expected.get("needsInterviewTips"):
            checks.append(check_result("needs_interview_tips", bool(v2.get("interviewPreparationTips")), "interview question should return interview tips"))
        summary = calculate_pass_fail(checks)
        results.append({"id": case["id"], "severity": summary["severity"], "passed": summary["passed"], "readinessLevel": v2.get("readinessLevel"), "questionIntent": v2.get("questionIntent"), "priorityFocus": priority_skills, "checks": checks})

    return {
        "suite": "Career Assistant V2",
        "total": len(results),
        "pass": sum(1 for item in results if item["severity"] == "PASS"),
        "warning": sum(1 for item in results if item["severity"] == "WARNING"),
        "fail": sum(1 for item in results if item["severity"] == "FAIL"),
        "readinessCoherenceRate": round(sum(1 for item in results if item["passed"]) / len(results), 2) if results else 0,
        "results": results,
    }


def print_career_summary(summary: dict) -> None:
    for item in summary["results"]:
        print(f"[{item['severity']}] {item['id']} readiness={item['readinessLevel']} intent={item['questionIntent']}")
    print(f"Career Assistant V2: {summary['pass']}/{summary['total']} PASS, {summary['warning']} WARNING, {summary['fail']} FAIL")
