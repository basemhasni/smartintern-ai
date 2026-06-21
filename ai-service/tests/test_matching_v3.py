import unittest

from app.services.cv_analysis_v3 import analyze_cv_v3
from app.services.hybrid_matching_engine_v3 import HybridMatchingEngineV3
from app.services.offer_analysis_v3 import analyze_offer_v3
from app.services.semantic_similarity_service import compute_text_similarity


class SemanticSimilarityTests(unittest.TestCase):
    def test_similarity_fallback_is_normalized(self):
        result = compute_text_similarity("React frontend components", "Projet frontend avec composants React")
        self.assertGreaterEqual(result["score"], 0)
        self.assertLessEqual(result["score"], 1)
        self.assertIn(result["method"], {"sentence-transformers", "tfidf", "lexical"})


class HybridMatchingV3Tests(unittest.TestCase):
    def setUp(self):
        self.engine = HybridMatchingEngineV3()

    def _match(self, candidate_skills, required, optional=None, candidate_text=None, title="Stage React Node.js", debug=False):
        cv = analyze_cv_v3(candidate_text) if candidate_text else {"skills": candidate_skills, "detectedSkills": candidate_skills}
        offer = analyze_offer_v3(title, "Developper une application et documenter les choix techniques.", required, optional or [])
        return self.engine.match(candidate_skills, required, optional or [], cv, offer, candidate_text, offer["description"], debug)

    def test_exact_match(self):
        result = self._match(["React"], ["React"], candidate_text="Projet frontend developpe avec React et documente pour une equipe produit.", title="Stage React")
        self.assertEqual(result["v3"]["coverageMatrix"][0]["matchType"], "EXACT")

    def test_alias_match(self):
        result = self._match(["reactjs"], ["React"], title="Stage React")
        self.assertEqual(result["v3"]["coverageMatrix"][0]["matchType"], "ALIAS")

    def test_fuzzy_match_is_controlled(self):
        result = self._match(["Reacct"], ["React"], title="Stage React")
        self.assertEqual(result["v3"]["coverageMatrix"][0]["matchType"], "FUZZY")
        self.assertLessEqual(result["v3"]["coverageMatrix"][0]["coverage"], 0.85)

    def test_related_match_is_not_legacy_matched(self):
        result = self._match(["Angular"], ["React"], title="Stage React")
        self.assertEqual(result["v3"]["coverageMatrix"][0]["matchType"], "RELATED")
        self.assertNotIn("React", result["matchedSkills"])
        self.assertIn("React", result["missingSkills"])

    def test_missing_critical_skill_caps_score(self):
        text = "Projet frontend TypeScript HTML CSS documente avec composants modulaires et tests. " * 5
        result = self._match(["TypeScript", "HTML", "CSS"], ["React", "TypeScript", "HTML", "CSS"], candidate_text=text, title="Stage React TypeScript")
        self.assertIn("React", result["v3"]["criticalMissingSkills"])
        self.assertLessEqual(result["score"], 72)

    def test_optional_skill_has_limited_weight(self):
        base_text = "Projet frontend React documente avec composants reutilisables, formulaires et tests. Le travail a ete presente a une equipe et versionne avec Git. Cette realisation montre une utilisation pratique de React dans un contexte complet."
        docker_text = base_text + " Le projet a aussi ete conteneurise avec Docker pour faciliter son execution."
        without_optional = self._match(["React"], ["React"], ["Docker"], candidate_text=base_text, title="Stage React")
        with_optional = self._match(["React", "Docker"], ["React"], ["Docker"], candidate_text=docker_text, title="Stage React")
        self.assertGreater(with_optional["score"], without_optional["score"])
        self.assertLessEqual(with_optional["score"] - without_optional["score"], 10)

    def test_poor_cv_cap(self):
        result = self._match(["React", "Node.js"], ["React", "Node.js"], candidate_text="React Node.js", title="Stage React Node.js")
        self.assertLessEqual(result["score"], 60)
        self.assertEqual(result["confidence"], "LOW")

    def test_score_bounds_and_rare_100(self):
        text = "Projet complet React Node.js PostgreSQL REST API Docker documente et teste avec une equipe. " * 4
        result = self._match(["React", "Node.js", "PostgreSQL", "REST API", "Docker"], ["React", "Node.js", "PostgreSQL", "REST API"], ["Docker", "AWS"], text)
        self.assertGreaterEqual(result["score"], 0)
        self.assertLessEqual(result["score"], 100)
        self.assertLess(result["score"], 100)

    def test_explanation_and_coverage_matrix(self):
        result = self._match(["React"], ["React", "Node.js"], title="Stage React Node.js", debug=True)
        self.assertGreater(len(result["explanation"]), 80)
        self.assertEqual(len(result["v3"]["coverageMatrix"]), 2)
        self.assertTrue(all({"requirement", "importance", "matchType", "coverage", "reason"}.issubset(row) for row in result["v3"]["coverageMatrix"]))
        self.assertIn("warnings", result["v3"])
        self.assertIn("candidateEvidenceProfile", result["v3"])

    def test_negated_skill_is_not_detected(self):
        cv = analyze_cv_v3("Projet Java Spring Boot. Je n ai pas encore utilise React dans un projet.")
        self.assertNotIn("React", cv["skills"])


if __name__ == "__main__":
    unittest.main()
