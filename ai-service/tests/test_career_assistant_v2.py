import unittest

from app.agents.matching_agent_v3 import MatchingAgentV3
from app.services.career_assistant_v2_service import (
    build_learning_roadmap,
    detect_question_intent,
    determine_readiness_level,
    generate_career_advice_v2,
    generate_cv_improvement_tips,
    generate_recommended_projects,
    prioritize_skill_gaps,
)


def matching(score=74, confidence="MEDIUM", critical=None, required=None, optional=None, rows=None):
    return {
        "score": score,
        "confidence": confidence,
        "decisionLabel": "GOOD_MATCH" if score >= 70 else "PARTIAL_MATCH",
        "matchedSkills": ["React"],
        "missingSkills": required or [],
        "v3": {
            "coverageMatrix": rows or [{"requirement": "React", "importance": "CRITICAL", "coverage": 1.0, "confidence": 0.95, "evidence": ["Projet React"], "evidenceType": "PROJECT", "matchType": "EXACT"}],
            "criticalMissingSkills": critical or [],
            "missingRequiredSkills": required or [],
            "missingOptionalSkills": optional or [],
            "partialMatchedSkills": [],
            "domainAlignment": {"offerDomain": "FULLSTACK"},
            "evidenceSummary": {"strongEvidenceCount": 1, "weakEvidenceCount": 0},
        },
    }


class CareerAssistantV2Tests(unittest.TestCase):
    def test_question_intents(self):
        self.assertEqual(detect_question_intent("Quel projet puis-je faire ?"), "PROJECT_IDEAS")
        self.assertEqual(detect_question_intent("Comment ameliorer mon CV ?"), "CV_IMPROVEMENT")
        self.assertEqual(detect_question_intent("Preparer mon entretien"), "INTERVIEW_PREP")
        self.assertEqual(detect_question_intent("Quels sont mes points forts ?"), "STRENGTHS")
        self.assertEqual(detect_question_intent("Propose un plan sur deux semaines"), "LEARNING_PLAN")
        self.assertEqual(detect_question_intent("Suis-je pret a postuler ?"), "READINESS")
        self.assertEqual(detect_question_intent("Quelles competences ameliorer ?"), "SKILL_GAPS")
        self.assertEqual(detect_question_intent(""), "FULL_ANALYSIS")

    def test_specific_skill_question_uses_coverage_row(self):
        result = generate_career_advice_v2({
            "student": {"firstName": "A"},
            "offer": {"title": "Stage"},
            "question": "Est-ce que je dois apprendre Docker ?",
            "matching": matching(required=["Docker"], rows=[
                {"requirement": "Docker", "importance": "REQUIRED", "coverage": 0, "confidence": 0, "evidence": [], "matchType": "MISSING", "reason": "Docker absent"}
            ]),
        })
        self.assertEqual(result["v2"]["questionIntent"], "SPECIFIC_SKILL")
        self.assertIn("Docker", result["v2"]["directAnswer"])
        self.assertIn("Aucune preuve fiable", result["v2"]["directAnswer"])

    def test_ready_requires_no_critical_gap(self):
        self.assertEqual(determine_readiness_level(matching(score=88, confidence="HIGH")), "READY")
        self.assertNotEqual(determine_readiness_level(matching(score=88, confidence="HIGH", critical=["React"])), "READY")

    def test_low_confidence_is_insufficient(self):
        self.assertEqual(determine_readiness_level(matching(score=80, confidence="LOW")), "INSUFFICIENT_DATA")

    def test_critical_gap_is_first_and_high(self):
        result = matching(score=45, critical=["React"], required=["React", "Node.js"], rows=[
            {"requirement": "React", "importance": "CRITICAL", "coverage": 0, "evidence": [], "matchType": "MISSING"},
            {"requirement": "Node.js", "importance": "REQUIRED", "coverage": 0, "evidence": [], "matchType": "MISSING"},
        ])
        gaps = prioritize_skill_gaps(result)
        self.assertEqual(gaps[0]["skill"], "React")
        self.assertEqual(gaps[0]["priority"], "HIGH")
        self.assertEqual(gaps[0]["gapType"], "CRITICAL")

    def test_optional_gap_is_not_critical(self):
        gaps = prioritize_skill_gaps(matching(optional=["AWS"]))
        aws = next(item for item in gaps if item["skill"] == "AWS")
        self.assertEqual(aws["priority"], "LOW")
        self.assertEqual(aws["gapType"], "OPTIONAL")

    def test_projects_only_cover_detected_gaps(self):
        gaps = prioritize_skill_gaps(matching(required=["Docker"], rows=[
            {"requirement": "Docker", "importance": "REQUIRED", "coverage": 0, "evidence": [], "matchType": "MISSING"}
        ]))
        projects = generate_recommended_projects(gaps, "DEVOPS")
        self.assertTrue(projects)
        self.assertEqual(projects[0]["skillsCovered"], ["Docker"])

    def test_roadmap_changes_with_readiness(self):
        gaps = prioritize_skill_gaps(matching(required=["Docker"], rows=[
            {"requirement": "Docker", "importance": "REQUIRED", "coverage": 0, "evidence": [], "matchType": "MISSING"}
        ]))
        self.assertEqual(build_learning_roadmap(gaps, "READY")[0]["period"], "1-2 jours")
        self.assertEqual(build_learning_roadmap(gaps, "INSUFFICIENT_DATA")[0]["period"], "Prochaine etape")

    def test_cv_tips_forbid_invention(self):
        tips = generate_cv_improvement_tips(matching(required=["Docker"], rows=[
            {"requirement": "Docker", "importance": "REQUIRED", "coverage": 0, "evidence": [], "matchType": "MISSING"}
        ]))
        self.assertTrue(any("qu'apres une utilisation reelle" in tip for tip in tips))

    def test_response_keeps_legacy_fields(self):
        result = generate_career_advice_v2({"student": {"firstName": "A"}, "offer": {"title": "Stage"}, "matching": matching(), "question": ""})
        for field in ("profileSummary", "matchingScore", "strengths", "skillsToImprove", "actionPlan", "finalAdvice", "ragInsights"):
            self.assertIn(field, result)
        self.assertEqual(result["v2"]["adviceMethod"], "CAREER_ASSISTANT_V2_FROM_MATCHING_V3")

    def test_accepts_real_matching_v3_output(self):
        matching_result = MatchingAgentV3().run({
            "candidateSkills": ["React", "Node.js", "PostgreSQL"],
            "requiredSkills": ["React", "Node.js", "PostgreSQL", "Docker"],
            "optionalSkills": ["AWS"],
            "candidateText": "Projet de candidatures realise avec React, Node.js et PostgreSQL.",
            "offerText": "Stage fullstack React Node.js PostgreSQL avec Docker.",
            "offerAnalysis": {"title": "Stage React Node.js", "description": "React Node.js PostgreSQL Docker", "requiredSkills": ["React", "Node.js", "PostgreSQL", "Docker"], "optionalSkills": ["AWS"]},
            "debug": True,
        })
        result = generate_career_advice_v2({"student": {"firstName": "A"}, "offer": {"title": "Stage React Node.js"}, "matching": matching_result})
        self.assertTrue(matching_result["v3"]["coverageMatrix"])
        self.assertIn("Docker", [item["skill"] for item in result["v2"]["priorityFocus"]])


if __name__ == "__main__":
    unittest.main()
