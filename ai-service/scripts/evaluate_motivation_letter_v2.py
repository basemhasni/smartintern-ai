"""Functional evaluation for Motivation Letter V2."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.motivation_letter_v2_service import generate_motivation_letter_v2


def make_payload(name, candidate, required, missing=None, tone="PROFESSIONAL", company="SmartTech", poor=False):
    missing = missing or []
    matched = [skill for skill in required if skill in candidate and skill not in missing]
    rows = [
        {"requirement": skill, "coverage": 1 if skill in matched else 0, "confidence": 0.95 if skill in matched else 0, "evidence": [f"Projet realise avec {skill}"] if skill in matched else [], "evidenceType": "PROJECT" if skill in matched else "UNKNOWN"}
        for skill in required
    ]
    return {
        "name": name,
        "payload": {
            "student": {"firstName": "Hasni", "lastName": "Badis", "educationLevel": "Licence informatique", "targetJob": "Developpeur fullstack"},
            "candidateSkills": candidate,
            "cvAnalysis": {"detectedSkills": candidate, "domainSignals": [] if poor else ["WEB"], "rawTextQuality": {"quality": "LOW" if poor else "GOOD"}},
            "offer": {"title": "Stage developpeur fullstack", "description": "Mission de developpement", "requiredSkills": required, "optionalSkills": []},
            "company": {"companyName": company, "sector": "Informatique"},
            "matchingResult": {"score": 30 if poor else 80, "confidence": "LOW" if poor else "HIGH", "decisionLabel": "INSUFFICIENT_DATA" if poor else "GOOD_MATCH", "matchedSkills": matched, "missingSkills": missing, "v3": {"coverageMatrix": rows, "missingRequiredSkills": missing, "criticalMissingSkills": [], "evidenceSummary": {}}},
            "tone": tone,
        },
    }


CASES = [
    make_payload("strong_fullstack", ["React", "Node.js", "PostgreSQL", "Docker", "Git"], ["React", "Node.js", "PostgreSQL"]),
    make_payload("docker_missing", ["React", "Node.js", "PostgreSQL"], ["React", "Node.js", "PostgreSQL", "Docker"], ["Docker"]),
    make_payload("java_vs_react", ["Java", "Spring Boot", "MySQL"], ["React", "Node.js", "PostgreSQL"], ["React", "Node.js", "PostgreSQL"]),
    make_payload("poor_cv", [], ["React", "Node.js"], ["React", "Node.js"], poor=True),
    make_payload("professional_tone", ["React", "Node.js"], ["React", "Node.js"], tone="PROFESSIONAL"),
    make_payload("dynamic_tone", ["React", "Node.js"], ["React", "Node.js"], tone="DYNAMIC"),
    make_payload("simple_tone", ["React", "Node.js"], ["React", "Node.js"], tone="SIMPLE"),
    make_payload("without_company", ["React", "Node.js"], ["React", "Node.js"], company=""),
]


def main():
    passed = 0
    for case in CASES:
        result = generate_motivation_letter_v2(case["payload"])
        v2 = result["v2"]
        quality = v2["qualityChecks"]
        missing = case["payload"]["matchingResult"]["missingSkills"]
        forbidden = [skill for skill in missing if f"maitrise {skill.lower()}" in result["content"].lower()]
        ok = (
            not forbidden
            and quality["mentionsOffer"]
            and quality["doesNotClaimMissingSkills"]
            and quality["hasClearStructure"]
            and "undefined" not in result["content"].lower()
        )
        passed += int(ok)
        print(f"Case: {case['name']}")
        print(f"Tone: {result['tone']} | Words: {quality['wordCount']} | Personalization: {v2['personalizationScore']}")
        print(f"Used skills: {v2['usedSkills']}")
        print(f"Avoided claims: {v2['avoidedClaims']}")
        print(f"Quality: {quality}")
        print(f"Content: {result['content']}\n")
        print("PASS\n" if ok else "FAIL\n")
    print(f"Summary: {passed}/{len(CASES)} cases passed")
    return 0 if passed == len(CASES) else 1


if __name__ == "__main__":
    raise SystemExit(main())
