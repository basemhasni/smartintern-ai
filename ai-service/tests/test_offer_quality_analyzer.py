import unittest

from app.orchestration.intent_router import build_execution_plan, detect_intent_from_question
from app.services.offer_analysis_v3 import analyze_offer_v3
from app.services.offer_quality_analyzer_service import analyze_offer_quality


class OfferQualityAnalyzerTests(unittest.TestCase):
    def test_complete_offer_is_matching_ready(self):
        result = analyze_offer_quality(
            {
                "title": "Stage Developpeur Fullstack React Node.js",
                "description": (
                    "Le stagiaire participera au developpement d'une application web. "
                    "Il creera des interfaces React, developpera des API Node.js, "
                    "modelisera les donnees PostgreSQL et documentera les fonctionnalites."
                ),
                "requiredSkills": ["React", "Node.js", "PostgreSQL", "REST API"],
                "optionalSkills": ["Docker"],
                "location": "Tunis",
                "duration": "6 mois",
            }
        )
        self.assertGreaterEqual(result["qualityScore"], 80)
        self.assertEqual(result["matchingReadiness"], "HIGH")

    def test_missing_required_skills_is_reported(self):
        result = analyze_offer_quality(
            {
                "title": "Stage informatique",
                "description": "Nous cherchons un stagiaire motive.",
                "requiredSkills": [],
                "optionalSkills": ["React", "Docker"],
            }
        )
        issue_types = {item["type"] for item in result["issues"]}
        self.assertIn("MISSING_REQUIRED_SKILLS", issue_types)
        self.assertEqual(result["matchingReadiness"], "LOW")
        self.assertLessEqual(result["qualityScore"], 49)

    def test_overlap_and_seniority_are_detected(self):
        result = analyze_offer_quality(
            {
                "title": "Stage Senior Backend Node.js",
                "description": "Expert confirme avec 5 ans d'experience pour developper et documenter une API Node.js.",
                "requiredSkills": ["Node.js", "PostgreSQL"],
                "optionalSkills": ["Node.js", "Docker"],
            }
        )
        issue_types = {item["type"] for item in result["issues"]}
        self.assertIn("REQUIRED_OPTIONAL_OVERLAP", issue_types)
        self.assertIn("SENIORITY_TOO_HIGH_FOR_INTERNSHIP", issue_types)

    def test_improved_draft_does_not_invent_skills(self):
        result = analyze_offer_quality(
            {
                "title": "Stage React",
                "description": "Participer au developpement d'une interface React et documenter les composants.",
                "requiredSkills": ["React"],
                "optionalSkills": ["Figma"],
            }
        )
        draft = result["improvedOfferDraft"]
        self.assertTrue(set(draft["requiredSkills"] + draft["optionalSkills"]).issubset({"React", "Figma"}))

    def test_offer_analysis_keeps_quality_contract(self):
        result = analyze_offer_v3(
            "Stage React",
            "Participer au developpement d'une interface React et documenter les composants.",
            ["React"],
            [],
        )
        self.assertIn("offerQuality", result)
        self.assertIn(result["offerQuality"]["quality"], {"GOOD", "MEDIUM", "LOW"})
        self.assertIn("qualityScore", result["offerQuality"])

    def test_orchestrator_intent_and_plan(self):
        self.assertEqual(detect_intent_from_question("Comment ameliorer cette offre ?"), "OFFER_QUALITY_ANALYSIS")
        steps = [item["step"] for item in build_execution_plan("OFFER_QUALITY_ANALYSIS")]
        self.assertEqual(steps, ["OFFER_QUALITY_ANALYZER", "QUALITY_CONTROL"])


if __name__ == "__main__":
    unittest.main()
