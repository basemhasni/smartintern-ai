import unittest

from app.services.skill_gap_simulator_service import (
    identify_high_impact_gaps,
    simulate_skill_gap_impact,
)


def _matching(score=64, confidence="MEDIUM", matrix=None, evidence=None, raw_total=None):
    matrix = matrix or []
    return {
        "score": score,
        "confidence": confidence,
        "decisionLabel": "PARTIAL_MATCH",
        "matchedSkills": [row["requirement"] for row in matrix if row.get("coverage", 0) >= 0.75],
        "missingSkills": [row["requirement"] for row in matrix if row.get("importance") in {"CRITICAL", "REQUIRED"} and row.get("coverage", 0) < 0.75],
        "optionalMatchedSkills": [],
        "v3": {
            "coverageMatrix": matrix,
            "scoreBreakdown": {"rawTotal": raw_total if raw_total is not None else score, "cvQuality": 1.3},
            "criticalMissingSkills": [row["requirement"] for row in matrix if row.get("importance") == "CRITICAL" and row.get("coverage", 0) < 0.75],
            "missingRequiredSkills": [row["requirement"] for row in matrix if row.get("importance") in {"CRITICAL", "REQUIRED"} and row.get("coverage", 0) < 0.75],
            "missingOptionalSkills": [row["requirement"] for row in matrix if row.get("importance") == "OPTIONAL" and row.get("coverage", 0) < 0.75],
            "partialMatchedSkills": [],
            "domainAlignment": {"offerDomain": "FULLSTACK"},
            "evidenceSummary": {"strongEvidenceCount": 1},
        },
        "explainability": {"skillEvidenceMap": evidence or {}},
    }


class SkillGapSimulatorTests(unittest.TestCase):
    def test_critical_gap_has_more_impact_than_optional_gap(self):
        matching = _matching(
            matrix=[
                {"requirement": "React", "importance": "CRITICAL", "category": "Frontend", "coverage": 0, "evidence": [], "evidenceType": "NONE"},
                {"requirement": "Node.js", "importance": "REQUIRED", "category": "Backend", "coverage": 1, "evidence": ["Projet API"], "evidenceType": "PROJECT"},
                {"requirement": "Docker", "importance": "OPTIONAL", "category": "DevOps / Cloud", "coverage": 0, "evidence": [], "evidenceType": "NONE"},
            ],
            evidence={"React": {"evidenceLevel": "MISSING"}, "Docker": {"evidenceLevel": "MISSING"}},
        )
        result = simulate_skill_gap_impact(matching, options={"simulationMode": "REALISTIC"})
        gains = {item["skill"]: item["gain"] for item in result["singleSkillSimulations"]}
        self.assertGreater(gains["React"], gains["Docker"])

    def test_strong_skill_is_not_proposed_as_gap(self):
        matching = _matching(
            score=88,
            matrix=[
                {"requirement": "React", "importance": "CRITICAL", "category": "Frontend", "coverage": 1, "evidence": ["Projet React"], "evidenceType": "PROJECT"},
                {"requirement": "Node.js", "importance": "REQUIRED", "category": "Backend", "coverage": 1, "evidence": ["Projet API"], "evidenceType": "PROJECT"},
            ],
            evidence={"React": {"evidenceLevel": "STRONG"}, "Node.js": {"evidenceLevel": "STRONG"}},
        )
        self.assertEqual(identify_high_impact_gaps(matching), [])

    def test_poor_cv_cap_is_explained(self):
        matching = _matching(
            score=20,
            confidence="LOW",
            raw_total=20,
            matrix=[
                {"requirement": "React", "importance": "CRITICAL", "category": "Frontend", "coverage": 0, "evidence": [], "evidenceType": "NONE"},
                {"requirement": "Node.js", "importance": "REQUIRED", "category": "Backend", "coverage": 0, "evidence": [], "evidenceType": "NONE"},
            ],
            evidence={"React": {"evidenceLevel": "MISSING"}, "Node.js": {"evidenceLevel": "MISSING"}},
        )
        matching["v3"]["scoreBreakdown"]["cvQuality"] = 0.4
        result = simulate_skill_gap_impact(matching, selected_skills=["React", "Node.js"])
        self.assertLessEqual(result["potentialBestScore"], 60)
        self.assertTrue(any(item["cap"] == 60 for item in result["scoreCapsApplied"]))

    def test_potential_score_never_decreases_or_exceeds_95(self):
        matching = _matching(
            score=70,
            matrix=[
                {"requirement": "Docker", "importance": "REQUIRED", "category": "DevOps / Cloud", "coverage": 0, "evidence": [], "evidenceType": "NONE"},
            ],
            evidence={"Docker": {"evidenceLevel": "MISSING"}},
        )
        result = simulate_skill_gap_impact(matching)
        self.assertGreaterEqual(result["potentialBestScore"], result["currentScore"])
        self.assertLessEqual(result["potentialBestScore"], 95)
        self.assertGreaterEqual(result["scoreGain"], 0)


if __name__ == "__main__":
    unittest.main()
