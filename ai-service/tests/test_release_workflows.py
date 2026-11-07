"""Exercise compiled LangGraph paths, using only the shipped local AI logic."""
import unittest
from unittest.mock import patch

from app.models.schemas import MatchingWorkflowRequest, MotivationLetterWorkflowRequest
from app.services.workflow_service import run_matching_workflow, run_motivation_letter_workflow
from app.workflows.matching_workflow_v3 import build_matching_workflow_v3
from app.workflows.motivation_letter_workflow_v2 import build_motivation_letter_workflow_v2


class ReleaseWorkflowTests(unittest.TestCase):
    def test_matching_graph_contract_and_score_bounds(self):
        payload = MatchingWorkflowRequest(
            candidateSkills=["React", "PostgreSQL"], requiredSkills=["React", "Docker"],
            candidateText="Built and tested React components with a PostgreSQL REST API.",
        )
        result = run_matching_workflow(payload)
        self.assertEqual(result["workflow"], "matching_workflow")
        self.assertGreaterEqual(result["result"]["score"], 0)
        self.assertLessEqual(result["result"]["score"], 100)
        self.assertIn("Docker", result["result"]["missingSkills"])
        self.assertGreaterEqual(len(result["result"]["explanation"]), 80)

    def test_matching_graph_rejects_invalid_skills_without_scoring(self):
        state = build_matching_workflow_v3().invoke({"candidateSkills": [123], "requiredSkills": ["React"]})
        self.assertIn("list of strings", state["error"])
        self.assertIsNone(state.get("result"))

    def test_letter_graph_rejects_missing_student(self):
        state = build_motivation_letter_workflow_v2().invoke({"offer": {"title": "Stage"}})
        self.assertEqual(state["error"], "student is required")
        self.assertIsNone(state.get("result"))

    def test_letter_graph_generates_structured_verified_content(self):
        payload = MotivationLetterWorkflowRequest(
            student={"firstName": "Test", "lastName": "Synthetic", "educationLevel": "Engineering"},
            candidateSkills=["React"],
            offer={"title": "Stage React", "description": "Develop React components and tests.", "requiredSkills": ["React", "Docker"]},
            company={"companyName": "Synthetic QA"},
            matching={"score": 60, "matchedSkills": ["React"], "missingSkills": ["Docker"]},
        )
        result = run_motivation_letter_workflow(payload)
        self.assertEqual(result["workflow"], "motivation_letter_workflow")
        self.assertGreater(len(result["result"]["content"]), 100)
        self.assertIn("Stage React", result["result"]["content"])
        self.assertTrue(result["result"]["v2"]["qualityChecks"]["doesNotClaimMissingSkills"])

    def test_letter_graph_stops_on_claim_validation_error(self):
        with patch("app.workflows.motivation_letter_workflow_v2.validate_letter_claims", return_value={"valid": False}):
            state = build_motivation_letter_workflow_v2().invoke({
                "student": {"firstName": "Test", "lastName": "Synthetic"},
                "offer": {"title": "Stage React", "description": "Build components"},
                "company": {"companyName": "Synthetic QA"},
            })
        self.assertEqual(state["error"], "Letter claim validation failed")
        self.assertIsNone(state.get("result"))


if __name__ == "__main__":
    unittest.main()
