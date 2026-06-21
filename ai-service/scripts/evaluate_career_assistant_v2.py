"""Functional calibration scenarios for Career Assistant V2."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.career_assistant_v2_service import generate_career_advice_v2


def row(skill, importance="REQUIRED", coverage=0.0, evidence=None, evidence_type="UNKNOWN"):
    return {"requirement": skill, "importance": importance, "coverage": coverage, "confidence": 0.95 if coverage else 0.0, "evidence": evidence or [], "evidenceType": evidence_type, "matchType": "EXACT" if coverage >= 0.75 else "MISSING"}


def case(name, score, confidence, rows, critical=None, required=None, optional=None, question="", expected=None, expected_intent="FULL_ANALYSIS"):
    return {
        "name": name,
        "expected": expected,
        "expectedIntent": expected_intent,
        "payload": {
            "student": {"firstName": "Etudiant", "lastName": "Test"},
            "offer": {"title": "Stage cible", "requiredSkills": [], "optionalSkills": []},
            "question": question,
            "matching": {
                "score": score,
                "confidence": confidence,
                "decisionLabel": "STRONG_MATCH" if score >= 85 else "GOOD_MATCH" if score >= 70 else "PARTIAL_MATCH" if score >= 50 else "LOW_MATCH",
                "matchedSkills": [item["requirement"] for item in rows if item["coverage"] >= 0.75],
                "missingSkills": required or [],
                "v3": {
                    "coverageMatrix": rows,
                    "criticalMissingSkills": critical or [],
                    "missingRequiredSkills": required or [],
                    "missingOptionalSkills": optional or [],
                    "partialMatchedSkills": [],
                    "domainAlignment": {"offerDomain": "FULLSTACK"},
                    "evidenceSummary": {"strongEvidenceCount": sum(1 for item in rows if item["evidence"]), "weakEvidenceCount": 0, "missingEvidenceCount": sum(1 for item in rows if not item["evidence"])},
                },
            },
        },
    }


CASES = [
    case("almost_ready_for_interview", 86, "HIGH", [row("React", "CRITICAL", 1, ["Projet React"], "PROJECT"), row("Node.js", "REQUIRED", 1, ["API Node"], "PROJECT")], expected="READY"),
    case("docker_required_missing", 74, "MEDIUM", [row("React", "CRITICAL", 1, ["Projet React"], "PROJECT"), row("Docker")], required=["Docker"], expected="ALMOST_READY"),
    case("react_critical_missing", 45, "MEDIUM", [row("React", "CRITICAL"), row("Node.js")], critical=["React"], required=["React", "Node.js"], expected="NEEDS_MAJOR_WORK"),
    case("poor_cv", 38, "LOW", [row("React")], required=["React"], expected="INSUFFICIENT_DATA"),
    case("project_question", 64, "MEDIUM", [row("Docker")], required=["Docker"], question="Quel projet faire pour progresser ?", expected="NEEDS_TARGETED_WORK", expected_intent="PROJECT_IDEAS"),
    case("cv_question", 64, "MEDIUM", [row("PostgreSQL", "REQUIRED", 0.82, [], "SKILL_LIST")], question="Comment ameliorer mon CV ?", expected="NEEDS_TARGETED_WORK", expected_intent="CV_IMPROVEMENT"),
    case("interview_question", 88, "HIGH", [row("React", "CRITICAL", 1, ["Application React"], "PROJECT")], question="Comment preparer mon entretien ?", expected="READY", expected_intent="INTERVIEW_PREP"),
    case("strengths_question", 88, "HIGH", [row("React", "CRITICAL", 1, ["Application React"], "PROJECT")], question="Quels sont mes points forts ?", expected="READY", expected_intent="STRENGTHS"),
    case("readiness_question", 74, "MEDIUM", [row("React", "CRITICAL", 1, ["Application React"], "PROJECT"), row("Docker")], required=["Docker"], question="Suis-je pret a postuler ?", expected="ALMOST_READY", expected_intent="READINESS"),
    case("specific_skill_question", 64, "MEDIUM", [row("React", "CRITICAL", 1, ["Application React"], "PROJECT"), row("Docker")], required=["Docker"], question="Dois-je apprendre Docker ?", expected="NEEDS_TARGETED_WORK", expected_intent="SPECIFIC_SKILL"),
]


def main() -> int:
    passed = 0
    for item in CASES:
        result = generate_career_advice_v2(item["payload"])
        v2 = result["v2"]
        project_ok = item["expectedIntent"] != "PROJECT_IDEAS" or bool(v2["recommendedProjects"])
        cv_ok = item["expectedIntent"] != "CV_IMPROVEMENT" or bool(v2["cvImprovementTips"])
        interview_ok = item["expectedIntent"] != "INTERVIEW_PREP" or bool(v2["interviewPreparationTips"])
        ok = v2["readinessLevel"] == item["expected"] and v2["questionIntent"] == item["expectedIntent"] and project_ok and cv_ok and interview_ok
        passed += int(ok)
        print(f"Case: {item['name']}")
        print(f"Readiness: {v2['readinessLevel']} | Expected: {item['expected']}")
        print(f"Intent: {v2['questionIntent']} | Priority: {[gap['skill'] for gap in v2['priorityFocus']]}")
        print(f"Critical gaps: {[gap['skill'] for gap in v2['criticalGaps']]}")
        print(f"Projects: {[project['title'] for project in v2['recommendedProjects']]}")
        print(f"Roadmap: {[step['period'] for step in v2['learningRoadmap']]}")
        print(f"Final advice: {result['finalAdvice']}")
        print("PASS\n" if ok else "FAIL\n")
    print(f"Summary: {passed}/{len(CASES)} cases passed")
    return 0 if passed == len(CASES) else 1


if __name__ == "__main__":
    raise SystemExit(main())
