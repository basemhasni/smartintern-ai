import unittest

from app.orchestration.context import OrchestrationContext
from app.orchestration.intent_router import build_execution_plan, detect_intent_from_question, normalize_intent
from app.orchestration.orchestrator_v2 import orchestrate_v2
from app.orchestration.quality_control_v2 import run_global_quality_control


class OrchestratorV2Test(unittest.TestCase):
    def test_normalize_intent_aliases(self):
        self.assertEqual(normalize_intent("match"), "MATCH")
        self.assertEqual(normalize_intent("generate-letter"), "GENERATE_LETTER")
        self.assertEqual(normalize_intent("unknown"), "UNKNOWN")

    def test_detect_intent_from_question(self):
        self.assertEqual(detect_intent_from_question("Peux-tu generer une lettre de motivation ?"), "GENERATE_LETTER")
        self.assertEqual(detect_intent_from_question("Quel est mon score de compatibilite ?"), "MATCH")

    def test_execution_plan_full_application(self):
        steps = [item["step"] for item in build_execution_plan("FULL_APPLICATION_ASSISTANCE", {})]
        self.assertIn("MATCH_V3", steps)
        self.assertIn("CAREER_ASSISTANT_V2", steps)
        self.assertIn("MOTIVATION_LETTER_V2", steps)
        self.assertEqual(steps[-1], "QUALITY_CONTROL")

    def test_match_uses_cached_cv_and_offer_analysis(self):
        result = orchestrate_v2(
            {
                "intent": "MATCH",
                "cvAnalysis": {"detectedSkills": ["React", "Node.js"], "rawTextQuality": {"quality": "GOOD"}},
                "offerAnalysis": {"requiredSkills": ["React"], "optionalSkills": ["Docker"], "title": "Stage React"},
            }
        )
        self.assertIn(result["status"], {"SUCCESS", "PARTIAL_SUCCESS"})
        self.assertTrue(result["results"]["matching"]["v3"]["coverageMatrix"])
        self.assertTrue(any(step["usedCachedInput"] for step in result["steps"]))

    def test_optional_rag_failure_is_partial_success(self):
        result = orchestrate_v2(
            {
                "intent": "FULL_APPLICATION_ASSISTANCE",
                "studentProfile": {"firstName": "A", "lastName": "B"},
                "cvText": "Projet React Node.js PostgreSQL.",
                "offer": {"title": "Stage React", "description": "React Node.js", "requiredSkills": ["React"]},
                "options": {"includeRag": True, "includeMotivationLetter": False},
            }
        )
        self.assertEqual(result["status"], "PARTIAL_SUCCESS")
        self.assertFalse(result["results"]["rag"]["used"])

    def test_quality_control_blocks_unsafe_letter(self):
        context = OrchestrationContext(intent="GENERATE_LETTER", input={})
        context.motivationLetter = {
            "content": "Je maitrise Docker.",
            "v2": {
                "qualityChecks": {
                    "mentionsOffer": True,
                    "doesNotClaimMissingSkills": False,
                    "usesOnlyVerifiedSkills": False,
                    "hasClearStructure": True,
                    "lengthOk": True,
                }
            },
        }
        qc = run_global_quality_control(context)
        self.assertFalse(qc["passed"])
        self.assertTrue(qc["blockingIssues"])


if __name__ == "__main__":
    unittest.main()
