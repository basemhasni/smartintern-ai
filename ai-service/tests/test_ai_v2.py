import unittest

from app.services.cv_analysis_v2 import analyze_cv_v2
from app.services.matching_engine_v2 import match_profile_to_offer
from app.services.offer_analysis_v2 import analyze_offer_v2
from app.services.skill_extraction_service import canonicalize_skill_list, extract_skills_from_text
from app.utils.text_normalization import normalize_text, safe_parse_list


class TextNormalizationTests(unittest.TestCase):
    def test_normalize_text_handles_accents_and_punctuation(self):
        self.assertEqual(normalize_text("Developpement Web - Node.js"), "developpement web node js")

    def test_safe_parse_list_supports_json_and_csv(self):
        self.assertEqual(safe_parse_list('["React", "Docker"]'), ["React", "Docker"])
        self.assertEqual(safe_parse_list("React, Docker"), ["React", "Docker"])


class SkillExtractionTests(unittest.TestCase):
    def test_aliases_are_canonicalized(self):
        self.assertEqual(canonicalize_skill_list(["postgres", "nodejs"]), ["PostgreSQL", "Node.js"])

    def test_compound_alias_does_not_create_short_alias_false_positive(self):
        skills = extract_skills_from_text("API Node.js avec PostgreSQL")
        self.assertIn("Node.js", skills)
        self.assertNotIn("JavaScript", skills)

    def test_no_duplicate_skills(self):
        self.assertEqual(canonicalize_skill_list(["React", "reactjs", "React"]), ["React"])


class MatchingEngineTests(unittest.TestCase):
    def test_required_skills_dominate_score(self):
        result = match_profile_to_offer(
            {"skills": ["Docker"]},
            {"requiredSkills": ["React", "Node.js"], "optionalSkills": []},
        )
        self.assertLessEqual(result["score"], 30)

    def test_optional_skill_is_moderate_bonus(self):
        base = match_profile_to_offer(
            {"skills": ["React"]},
            {"requiredSkills": ["React"], "optionalSkills": ["Docker"]},
        )
        bonus = match_profile_to_offer(
            {"skills": ["React", "Docker"]},
            {"requiredSkills": ["React"], "optionalSkills": ["Docker"]},
        )
        self.assertGreater(bonus["score"], base["score"])
        self.assertLessEqual(bonus["score"] - base["score"], 20)

    def test_related_skill_is_partial_not_exact(self):
        result = match_profile_to_offer(
            {"skills": ["MySQL"]},
            {"requiredSkills": ["PostgreSQL"], "optionalSkills": []},
        )
        self.assertEqual(result["matchedSkills"], [])
        self.assertEqual(result["partialMatchedSkills"][0]["candidateSkill"], "MySQL")

    def test_empty_candidate_has_low_confidence(self):
        result = match_profile_to_offer(
            {"skills": [], "rawTextQuality": {"quality": "LOW"}},
            {"requiredSkills": ["React"], "optionalSkills": []},
        )
        self.assertEqual(result["confidence"], "LOW")

    def test_empty_offer_is_insufficient_data(self):
        result = match_profile_to_offer({"skills": ["React"]}, {"requiredSkills": []})
        self.assertEqual(result["score"], 0)
        self.assertEqual(result["decisionLabel"], "INSUFFICIENT_DATA")

    def test_score_is_bounded(self):
        cv = analyze_cv_v2("Projet React Node.js PostgreSQL Docker Git et API REST.")
        offer = analyze_offer_v2("Stage fullstack", "Developper une application web", ["React"], ["Docker"])
        result = match_profile_to_offer(cv, offer)
        self.assertGreaterEqual(result["score"], 0)
        self.assertLessEqual(result["score"], 100)


if __name__ == "__main__":
    unittest.main()

