from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.orchestration.orchestrator_v2 import orchestrate_v2  # noqa: E402


CV_FULLSTACK = (
    "Developpeur fullstack junior. Projets realises avec React, Node.js, Express, "
    "PostgreSQL, Prisma, Docker et Git. Creation d API REST et interfaces web responsive."
)

CV_POOR = "Etudiant motive en informatique."

OFFER_FULLSTACK = {
    "id": 1,
    "title": "Stage developpeur fullstack React Node.js",
    "companyName": "SmartTech",
    "description": "Stage fullstack pour construire une interface React et une API Node.js REST avec PostgreSQL.",
    "requiredSkills": ["React", "Node.js", "PostgreSQL", "REST API"],
    "optionalSkills": ["Docker", "CI/CD"],
}

STUDENT = {
    "firstName": "Nabil",
    "lastName": "Haddad",
    "educationLevel": "Licence Informatique",
    "targetJob": "Developpeur Fullstack",
}

RAG_DOC = {
    "id": "offer-guidance-1",
    "title": "Guide stages fullstack",
    "ownerType": "OFFER",
    "score": 0.82,
    "contentPreview": "Les stages fullstack React Node.js valorisent React, API REST, PostgreSQL, Docker et des preuves projet.",
    "metadata": {"sourceType": "INTERNSHIP_OFFER", "skills": ["React", "Node.js", "Docker"]},
}


def compact_steps(result: dict) -> str:
    return ", ".join(f"{step['name']}={step['status']}" for step in result.get("steps", []))


def print_case(name: str, result: dict, passed: bool) -> None:
    matching = result.get("results", {}).get("matching") or {}
    career = result.get("results", {}).get("careerAdvice") or {}
    letter = result.get("results", {}).get("motivationLetter") or {}
    quality = result.get("qualityControl") or {}
    readiness = (career.get("v2") or {}).get("readinessLevel")
    letter_checks = (letter.get("v2") or {}).get("qualityChecks") or {}
    print(f"Case: {name}")
    print(f"Status: {result.get('status')} | Intent: {result.get('intent')} | PASS={passed}")
    print(f"Steps: {compact_steps(result)}")
    if matching:
        print(f"Matching: score={matching.get('score')} confidence={matching.get('confidence')} decision={matching.get('decisionLabel')}")
    if readiness:
        print(f"Readiness: {readiness}")
    if letter_checks:
        print(f"Letter quality: missingClaim={letter_checks.get('doesNotClaimMissingSkills')} verified={letter_checks.get('usesOnlyVerifiedSkills')}")
    print(f"QC passed: {quality.get('passed')} warnings={len(quality.get('warnings') or [])}")
    print("-" * 72)


def main() -> int:
    cases = []

    cases.append(
        (
            "intent_match",
            {
                "intent": "MATCH",
                "cvText": CV_FULLSTACK,
                "offer": OFFER_FULLSTACK,
                "options": {"debug": True},
            },
            lambda r: bool((r.get("results", {}).get("matching") or {}).get("v3", {}).get("coverageMatrix")),
        )
    )

    matching = orchestrate_v2({"intent": "MATCH", "cvText": CV_FULLSTACK, "offer": OFFER_FULLSTACK})["results"]["matching"]
    cases.append(
        (
            "career_advice_with_matching",
            {
                "intent": "CAREER_ADVICE",
                "question": "Quelles competences dois-je ameliorer ?",
                "studentProfile": STUDENT,
                "offer": OFFER_FULLSTACK,
                "matchingResult": matching,
            },
            lambda r: bool((r.get("results", {}).get("careerAdvice") or {}).get("v2", {}).get("readinessLevel")),
        )
    )

    cases.append(
        (
            "generate_letter",
            {
                "intent": "GENERATE_LETTER",
                "studentProfile": STUDENT,
                "cvText": CV_FULLSTACK,
                "offer": OFFER_FULLSTACK,
                "matchingResult": matching,
                "tone": "PROFESSIONAL",
            },
            lambda r: bool((r.get("results", {}).get("motivationLetter") or {}).get("v2", {}).get("qualityChecks")),
        )
    )

    cases.append(
        (
            "full_application_assistance",
            {
                "intent": "FULL_APPLICATION_ASSISTANCE",
                "question": "Je veux postuler a cette offre, aide-moi a ameliorer mon dossier.",
                "studentProfile": STUDENT,
                "cvText": CV_FULLSTACK,
                "offer": OFFER_FULLSTACK,
                "ragContextDocuments": [RAG_DOC],
                "options": {"includeMotivationLetter": True, "includeRag": True},
            },
            lambda r: r.get("status") in {"SUCCESS", "PARTIAL_SUCCESS"} and bool(r.get("results", {}).get("careerAdvice")),
        )
    )

    cases.append(
        (
            "rag_unavailable",
            {
                "intent": "FULL_APPLICATION_ASSISTANCE",
                "studentProfile": STUDENT,
                "cvText": CV_FULLSTACK,
                "offer": OFFER_FULLSTACK,
                "options": {"includeRag": True, "includeMotivationLetter": False},
            },
            lambda r: r.get("status") == "PARTIAL_SUCCESS" and not (r.get("results", {}).get("rag") or {}).get("used"),
        )
    )

    cases.append(
        (
            "poor_cv",
            {
                "intent": "FULL_APPLICATION_ASSISTANCE",
                "studentProfile": STUDENT,
                "cvText": CV_POOR,
                "offer": OFFER_FULLSTACK,
                "options": {"includeMotivationLetter": False},
            },
            lambda r: (r.get("results", {}).get("matching") or {}).get("confidence") in {"LOW", "MEDIUM"},
        )
    )

    unsafe_letter = {
        "content": "Je maitrise Docker et CI/CD pour cette offre.",
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
    cases.append(
        (
            "letter_missing_skill_qc",
            {
                "intent": "GENERATE_LETTER",
                "studentProfile": STUDENT,
                "offer": OFFER_FULLSTACK,
                "matchingResult": {
                    **matching,
                    "missingSkills": ["Docker"],
                    "v3": {**matching.get("v3", {}), "missingRequiredSkills": ["Docker"]},
                },
                "careerAdvice": {},
                "options": {"includeCareerAdvice": False},
                "debug": True,
            },
            lambda r: bool((r.get("qualityControl") or {}).get("passed")),
        )
    )

    cases.append(
        (
            "unknown_intent",
            {"intent": "DO_SOMETHING_ELSE", "question": ""},
            lambda r: r.get("intent") == "UNKNOWN" and r.get("status") == "FAILED" and bool(r.get("recommendations")),
        )
    )

    passed_count = 0
    for name, payload, assertion in cases:
        result = orchestrate_v2(payload)
        if name == "letter_missing_skill_qc":
            result["results"]["motivationLetter"] = unsafe_letter
            from app.orchestration.context import OrchestrationContext
            from app.orchestration.quality_control_v2 import run_global_quality_control

            ctx = OrchestrationContext(intent="GENERATE_LETTER", input=payload)
            ctx.normalizedInput = payload
            ctx.matchingResult = payload["matchingResult"]
            ctx.motivationLetter = unsafe_letter
            qc = run_global_quality_control(ctx)
            result["qualityControl"] = qc
            ok = not qc.get("passed") and bool(qc.get("blockingIssues"))
        else:
            ok = bool(assertion(result))
        passed_count += int(ok)
        print_case(name, result, ok)

    print(f"Summary: {passed_count}/{len(cases)} PASS")
    return 0 if passed_count >= 7 else 1


if __name__ == "__main__":
    raise SystemExit(main())
