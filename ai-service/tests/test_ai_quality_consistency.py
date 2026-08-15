import json
import unittest
from pathlib import Path

from app.orchestration.intent_router import detect_intent_from_question
from app.rag.grounded_answer_service_v2 import generate_grounded_answer
from app.services.career_assistant_v2_service import generate_career_advice_v2
from app.services.cv_analysis_v3 import analyze_cv_v3
from app.services.hybrid_matching_engine_v3 import HybridMatchingEngineV3
from app.services.motivation_letter_v2_service import generate_motivation_letter_v2
from app.services.offer_analysis_v3 import analyze_offer_v3
from app.services.skill_gap_simulator_service import simulate_skill_gap_impact


ROOT = Path(__file__).resolve().parents[1]


class AIQualityConsistencyTests(unittest.TestCase):
    def setUp(self):
        self.engine = HybridMatchingEngineV3()

    def match(self, skills, required, text, optional=None, title=None):
        title = title or f"Stage {' '.join(required)}"
        cv = analyze_cv_v3(text)
        offer = analyze_offer_v3(title, f"Competences requises: {', '.join(required)}.", required, optional or [])
        return self.engine.match(skills, required, optional or [], cv, offer, text, offer["description"], True)

    @staticmethod
    def row(result, skill):
        return next(row for row in result["v3"]["coverageMatrix"] if row["requirement"] == skill)

    def test_evaluation_dataset_has_required_profiles_and_offers(self):
        path = ROOT / "evaluation" / "cases" / "ai_quality_consistency_cases.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        self.assertEqual([item["id"] for item in data["profiles"]], [f"PROFILE-0{i}" for i in range(1, 8)])
        self.assertEqual([item["id"] for item in data["offers"]], [f"OFFER-0{i}" for i in range(1, 8)])

    def test_angular_does_not_prove_react(self):
        result = self.match(["Angular", "TypeScript"], ["React", "TypeScript"], "Projet Angular et TypeScript realise avec des composants et formulaires.", title="Stage React")
        self.assertEqual(self.row(result, "React")["matchType"], "TRANSFERABLE")
        self.assertNotIn("React", result["matchedSkills"])

    def test_java_does_not_prove_javascript(self):
        result = self.match(["Java"], ["JavaScript"], "Projet backend realise avec Java et documente.")
        self.assertEqual(self.row(result, "JavaScript")["matchType"], "MISSING")

    def test_docker_does_not_prove_kubernetes(self):
        result = self.match(["Docker"], ["Kubernetes"], "Projet deploye dans plusieurs conteneurs Docker.")
        self.assertEqual(self.row(result, "Kubernetes")["matchType"], "RELATED")
        self.assertNotIn("Kubernetes", result["matchedSkills"])

    def test_sql_does_not_prove_postgresql(self):
        result = self.match(["SQL"], ["PostgreSQL"], "Formation SQL avec requetes relationnelles et jointures.")
        self.assertEqual(self.row(result, "PostgreSQL")["matchType"], "TRANSFERABLE")

    def test_git_does_not_prove_gitlab_ci(self):
        result = self.match(["Git"], ["GitLab CI"], "Projet versionne avec Git. Aucun pipeline GitLab CI n a ete utilise.")
        self.assertEqual(self.row(result, "GitLab CI")["matchType"], "MISSING")

    def test_flask_does_not_prove_fastapi(self):
        result = self.match(["Python", "Flask"], ["FastAPI", "Python"], "Projet API realise avec Python et Flask. FastAPI n a pas ete utilise.", title="Stage FastAPI")
        self.assertEqual(self.row(result, "FastAPI")["matchType"], "MISSING")

    def test_node_does_not_prove_express(self):
        result = self.match(["Node.js"], ["Express.js"], "Projet backend realise avec Node.js sans framework web.")
        self.assertEqual(self.row(result, "Express.js")["matchType"], "TRANSFERABLE")

    def test_react_native_does_not_prove_react_web(self):
        result = self.match(["React Native"], ["React"], "Projet mobile realise avec React Native pour Android.", title="Stage React Web")
        self.assertEqual(self.row(result, "React")["matchType"], "TRANSFERABLE")

    def test_skill_list_alone_is_weak_evidence(self):
        result = self.match(["React"], ["React"], "Competences: React.", title="Stage React")
        evidence = result["explainability"]["skillEvidenceMap"]["React"]
        self.assertEqual(evidence["evidenceLevel"], "WEAK")
        self.assertNotIn("React", result["matchedSkills"])

    def test_concise_concrete_project_is_not_low_quality(self):
        text = "Projet realise avec React, TypeScript et Jest. J ai construit les composants, formulaires et tests."
        result = self.match(["React", "TypeScript", "Jest"], ["React", "TypeScript", "Jest"], text, title="Stage React TypeScript Jest")
        self.assertNotEqual(result["confidence"], "LOW")
        self.assertGreaterEqual(result["score"], 70)

    def test_weak_wording_stays_weak(self):
        result = self.match(["React"], ["React"], "Competences: notions de React en cours d apprentissage.", title="Stage React")
        self.assertEqual(result["explainability"]["skillEvidenceMap"]["React"]["evidenceLevel"], "WEAK")

    def test_critical_gap_prevents_positive_label(self):
        result = self.match(["Angular", "TypeScript"], ["React", "TypeScript"], "Projet Angular et TypeScript realise et documente.", title="Stage React")
        self.assertIn(result["decisionLabel"], {"PARTIAL_MATCH", "LOW_MATCH", "VERY_LOW_MATCH", "INSUFFICIENT_DATA"})

    def test_relevant_evidence_does_not_lower_score(self):
        weak = self.match(["React"], ["React"], "Competences: React.", title="Stage React")
        strong = self.match(["React"], ["React"], "Projet frontend realise avec React. J ai construit et teste les composants.", title="Stage React")
        self.assertGreaterEqual(strong["score"], weak["score"])

    def test_unrelated_skill_has_no_material_effect(self):
        text = "Projet frontend realise avec React et TypeScript. J ai construit les composants et les tests."
        base = self.match(["React", "TypeScript"], ["React", "TypeScript"], text, title="Stage React")
        extra = self.match(["React", "TypeScript", "Jira"], ["React", "TypeScript"], text, title="Stage React")
        self.assertLessEqual(abs(base["score"] - extra["score"]), 2)

    def test_alias_has_stable_score(self):
        alias = self.match(["Postgres"], ["PostgreSQL"], "Projet realise avec Postgres et des migrations.")
        canonical = self.match(["PostgreSQL"], ["PostgreSQL"], "Projet realise avec PostgreSQL et des migrations.")
        self.assertLessEqual(abs(alias["score"] - canonical["score"]), 2)

    def test_repeated_matching_is_stable(self):
        args = (["React", "TypeScript"], ["React", "TypeScript"], "Projet React TypeScript realise avec composants et tests.")
        outputs = [self.match(*args, title="Stage React") for _ in range(3)]
        signatures = {(item["score"], item["confidence"], item["decisionLabel"], tuple(item["matchedSkills"])) for item in outputs}
        self.assertEqual(len(signatures), 1)

    def test_rag_ignores_low_relevance_context(self):
        answer = generate_grounded_answer("Comment progresser en React ?", [{"id": "x", "score": 0.05, "text": "Fiscalite et comptabilite."}])
        self.assertEqual(answer["confidence"], "LOW")
        self.assertEqual(answer["citations"], [])

    def test_rag_keeps_relevant_context_with_citation(self):
        answer = generate_grounded_answer("Comment progresser en React ?", [{"id": "x", "title": "Guide React", "score": 0.9, "text": "Construire des composants React et les tester."}])
        self.assertEqual(answer["usedContextCount"], 1)
        self.assertEqual(answer["citations"][0]["sourceId"], "x")

    def test_letter_does_not_claim_unrelated_candidate_skill(self):
        matching = self.match(["Java"], ["React"], "Projet backend realise avec Java et Spring Boot.", title="Stage React")
        letter = generate_motivation_letter_v2({
            "student": {"firstName": "Test", "educationLevel": "Licence"},
            "candidateSkills": ["Java"],
            "cvAnalysis": analyze_cv_v3("Projet backend realise avec Java et Spring Boot."),
            "offer": {"title": "Stage React", "requiredSkills": ["React"]},
            "company": {"companyName": "Demo"},
            "matching": matching,
        })
        self.assertNotIn("Java", letter["v2"]["usedSkills"])
        self.assertTrue(letter["v2"]["qualityChecks"]["doesNotClaimMissingSkills"])

    def test_career_assistant_ignores_low_relevance_rag(self):
        matching = self.match(["Angular"], ["React"], "Projet frontend realise avec Angular.", title="Stage React")
        advice = generate_career_advice_v2({
            "student": {"firstName": "Test"},
            "offer": {"title": "Stage React", "requiredSkills": ["React"]},
            "matching": matching,
            "ragContextDocuments": [{"id": "x", "score": 0.05, "title": "Hors sujet", "metadata": {"skills": ["React"]}}],
        })
        self.assertFalse(advice["v2"]["ragContextUsed"])
        self.assertEqual(advice["ragInsights"], [])

    def test_skill_gap_modes_are_ordered(self):
        matching = self.match(["Angular", "TypeScript"], ["React", "TypeScript"], "Projet Angular TypeScript realise avec composants et tests.", title="Stage React")
        scores = []
        for mode in ("CONSERVATIVE", "REALISTIC", "OPTIMISTIC"):
            simulation = simulate_skill_gap_impact(matching, ["React"], {"simulationMode": mode, "forceMode": True, "maxCombinations": 0})
            scores.append(simulation["potentialBestScore"])
        self.assertEqual(scores, sorted(scores))

    def test_ambiguous_score_improvement_routes_to_simulation(self):
        self.assertEqual(detect_intent_from_question("Comment ameliorer mon score de matching ?"), "SKILL_GAP_SIMULATION")

    def test_all_scores_stay_in_bounds(self):
        result = self.match(["React", "TypeScript", "Docker"], ["React", "TypeScript"], "Projet React TypeScript dockerise et teste.", ["Docker"], "Stage React")
        self.assertGreaterEqual(result["score"], 0)
        self.assertLessEqual(result["score"], 100)


if __name__ == "__main__":
    unittest.main()
