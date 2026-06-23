import unittest

from app.orchestration.context import OrchestrationContext
from app.orchestration.orchestrator_v2 import orchestrate_v2
from app.orchestration.quality_control_v2 import run_global_quality_control
from evaluation.evaluators.quality_metrics import (
    assert_no_missing_skill_claimed,
    assert_non_generic_text,
    assert_score_in_range,
)


class AiQualityRulesTests(unittest.TestCase):
    def test_score_in_bounds_rule(self):
        self.assertTrue(assert_score_in_range(78, 70, 90)["passed"])
        self.assertFalse(assert_score_in_range(120, 0, 100)["passed"])

    def test_no_missing_skill_claimed_rule(self):
        safe = "Je souhaite progresser sur Docker mentionne dans votre offre."
        unsafe = "Je maitrise Docker et CI/CD dans mes projets."
        self.assertTrue(assert_no_missing_skill_claimed(safe, ["Docker"])["passed"])
        self.assertFalse(assert_no_missing_skill_claimed(unsafe, ["Docker"])["passed"])

    def test_non_generic_advice_rule(self):
        text = "Travaillez React en realisant une interface connectee a une API REST, puis documentez les composants, formulaires et erreurs gerees."
        self.assertTrue(assert_non_generic_text(text)["passed"])

    def test_quality_control_catches_missing_skill_claim(self):
        context = OrchestrationContext(intent="GENERATE_LETTER", input={})
        context.motivationLetter = {
            "content": "Je maitrise React.",
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

    def test_orchestrator_partial_success_on_optional_rag_failure(self):
        result = orchestrate_v2(
            {
                "intent": "FULL_APPLICATION_ASSISTANCE",
                "studentProfile": {"firstName": "Nabil", "lastName": "Haddad"},
                "cvText": "Projet React Node.js.",
                "offer": {"title": "Stage React", "description": "React", "requiredSkills": ["React"]},
                "options": {"includeRag": True, "includeMotivationLetter": False},
            }
        )
        self.assertEqual(result["status"], "PARTIAL_SUCCESS")
        self.assertFalse(result["results"]["rag"]["used"])

    def test_readiness_coherent_for_poor_cv(self):
        result = orchestrate_v2(
            {
                "intent": "FULL_APPLICATION_ASSISTANCE",
                "studentProfile": {"firstName": "Nabil", "lastName": "Haddad"},
                "cvText": "Etudiant motive.",
                "offer": {"title": "Stage React", "description": "React Node", "requiredSkills": ["React", "Node.js"]},
                "options": {"includeMotivationLetter": False},
            }
        )
        career = result["results"]["careerAdvice"]["v2"]
        self.assertEqual(career["readinessLevel"], "INSUFFICIENT_DATA")


if __name__ == "__main__":
    unittest.main()
