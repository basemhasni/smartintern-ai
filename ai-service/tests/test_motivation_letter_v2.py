import unittest

from app.services.motivation_letter_v2_service import (
    calculate_personalization_score,
    extract_letter_evidence,
    generate_motivation_letter_v2,
    normalize_tone,
    validate_letter_claims,
)


def payload(tone="PROFESSIONAL", missing=None, poor=False, company_name="SmartTech"):
    skills = [] if poor else ["React", "Node.js", "PostgreSQL"]
    missing = missing or []
    rows = [
        {"requirement": skill, "coverage": 1, "confidence": 0.95, "evidence": [f"Projet avec {skill}"], "evidenceType": "PROJECT"}
        for skill in skills
    ] + [
        {"requirement": skill, "coverage": 0, "confidence": 0, "evidence": [], "evidenceType": "UNKNOWN"}
        for skill in missing
    ]
    return {
        "student": {"firstName": "Hasni", "lastName": "Badis", "educationLevel": "Licence informatique", "targetJob": "Developpeur fullstack"},
        "candidateSkills": skills,
        "cvAnalysis": {"detectedSkills": skills, "domainSignals": [] if poor else ["WEB"], "rawTextQuality": {"quality": "LOW" if poor else "GOOD"}},
        "offer": {"title": "Stage developpeur fullstack", "description": "React Node PostgreSQL", "requiredSkills": skills + missing, "optionalSkills": []},
        "company": {"companyName": company_name, "sector": "Informatique"},
        "matchingResult": {
            "score": 30 if poor else 78,
            "confidence": "LOW" if poor else "HIGH",
            "decisionLabel": "INSUFFICIENT_DATA" if poor else "GOOD_MATCH",
            "matchedSkills": skills,
            "missingSkills": missing,
            "v3": {"coverageMatrix": rows, "missingRequiredSkills": missing, "criticalMissingSkills": [], "evidenceSummary": {}},
        },
        "tone": tone,
    }


class MotivationLetterV2Tests(unittest.TestCase):
    def test_normalize_tone_falls_back(self):
        self.assertEqual(normalize_tone("DYNAMIC"), "DYNAMIC")
        self.assertEqual(normalize_tone("unknown"), "PROFESSIONAL")

    def test_extracts_only_verified_skills(self):
        data = payload(missing=["Docker"])
        evidence = extract_letter_evidence(data["cvAnalysis"], data["matchingResult"], data["candidateSkills"])
        self.assertEqual(evidence["verifiedSkills"], ["React", "Node.js", "PostgreSQL"])
        self.assertIn("Docker", evidence["missingSkills"])

    def test_missing_skill_is_not_claimed(self):
        result = generate_motivation_letter_v2(payload(missing=["Docker"]))
        normalized = result["content"].lower()
        self.assertNotIn("maitrise docker", normalized)
        self.assertTrue(result["v2"]["qualityChecks"]["doesNotClaimMissingSkills"])
        self.assertEqual(result["v2"]["missingSkillsHandled"], ["Docker"])

    def test_claim_validator_rejects_missing_mastery(self):
        evidence = {"missingSkills": ["Docker"]}
        report = validate_letter_claims("Je maitrise Docker.", evidence, {})
        self.assertFalse(report["valid"])
        self.assertFalse(validate_letter_claims("J ai utilise Docker dans plusieurs projets.", evidence, {})["valid"])

    def test_tones_produce_different_content(self):
        professional = generate_motivation_letter_v2(payload("PROFESSIONAL"))["content"]
        dynamic = generate_motivation_letter_v2(payload("DYNAMIC"))["content"]
        simple = generate_motivation_letter_v2(payload("SIMPLE"))["content"]
        self.assertNotEqual(professional, dynamic)
        self.assertNotEqual(dynamic, simple)
        self.assertLess(len(simple.split()), len(professional.split()))

    def test_personalization_score_is_bounded(self):
        result = generate_motivation_letter_v2(payload())
        score = result["v2"]["personalizationScore"]
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 1)

    def test_insufficient_data_adds_warning_without_invention(self):
        result = generate_motivation_letter_v2(payload(poor=True))
        self.assertTrue(any("moins personnalisee" in warning for warning in result["v2"]["warnings"]))
        self.assertEqual(result["v2"]["usedSkills"], [])

    def test_company_is_optional_and_never_undefined(self):
        result = generate_motivation_letter_v2(payload(company_name=""))
        self.assertNotIn("undefined", result["content"].lower())
        self.assertTrue(result["v2"]["qualityChecks"]["mentionsCompany"])

    def test_legacy_and_v2_fields_are_present(self):
        result = generate_motivation_letter_v2(payload())
        for field in ("content", "letter", "generatedLetter", "tone", "generatedAt", "v2"):
            self.assertIn(field, result)
        self.assertEqual(result["v2"]["generationMethod"], "MOTIVATION_LETTER_V2_EVIDENCE_BASED")


if __name__ == "__main__":
    unittest.main()
