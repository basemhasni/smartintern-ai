"""Global quality control for Orchestrator V2 outputs."""

from __future__ import annotations

from typing import Any

from app.utils.text_normalization import normalize_text


def _as_dict(value: Any) -> dict:
    return value if isinstance(value, dict) else {}


def _as_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def _check(name: str, passed: bool, severity: str, message: str) -> dict[str, Any]:
    return {"name": name, "passed": bool(passed), "severity": severity, "message": message}


def _score_ok(matching: dict) -> bool:
    score = matching.get("score")
    return isinstance(score, int) and 0 <= score <= 100


def run_global_quality_control(context) -> dict[str, Any]:
    checks: list[dict[str, Any]] = []
    warnings: list[str] = []
    blocking: list[str] = []
    matching = _as_dict(context.matchingResult)
    career = _as_dict(context.careerAdvice)
    letter = _as_dict(context.motivationLetter)
    rag = _as_dict(context.ragContext)
    offer = _as_dict(context.normalizedInput.get("offer"))

    if matching:
        v3 = _as_dict(matching.get("v3"))
        matrix = _as_list(v3.get("coverageMatrix"))
        required = _as_list(_as_dict(context.offerAnalysis).get("requiredSkills")) or _as_list(offer.get("requiredSkills"))
        checks.append(_check("MATCHING_SCORE_BOUNDS", _score_ok(matching), "BLOCKING", "Le score matching doit etre entre 0 et 100."))
        checks.append(_check("MATCHING_DECISION_LABEL", bool(matching.get("decisionLabel")), "WARNING", "Le matching doit exposer decisionLabel."))
        checks.append(_check("MATCHING_COVERAGE_MATRIX", not required or bool(matrix), "WARNING", "coverageMatrix est attendue si des competences requises existent."))
        if _as_list(v3.get("criticalMissingSkills")) and int(matching.get("score") or 0) > 72:
            checks.append(_check("CRITICAL_MISSING_CAP", False, "BLOCKING", "Une competence critique manquante doit plafonner le score."))
    else:
        checks.append(_check("MATCHING_AVAILABLE", context.intent not in {"MATCH", "FULL_APPLICATION_ASSISTANCE", "CAREER_ADVICE", "GENERATE_LETTER"}, "WARNING", "Aucun matching disponible."))

    if career:
        v2 = _as_dict(career.get("v2"))
        checks.append(_check("CAREER_READINESS_LEVEL", bool(v2.get("readinessLevel")), "WARNING", "Career Assistant doit retourner readinessLevel."))
        checks.append(_check("CAREER_PRIORITY_FOCUS", bool(_as_list(v2.get("priorityFocus"))) or v2.get("readinessLevel") in {"READY", "INSUFFICIENT_DATA"}, "WARNING", "Les priorites doivent venir des gaps du matching."))
        final_advice = normalize_text(str(career.get("finalAdvice") or ""))
        checks.append(_check("CAREER_NOT_GENERIC", len(final_advice) > 80, "WARNING", "Le conseil final doit etre contextualise."))

    if letter:
        v2 = _as_dict(letter.get("v2"))
        quality = _as_dict(v2.get("qualityChecks"))
        checks.append(_check("LETTER_MENTIONS_OFFER", bool(quality.get("mentionsOffer", False)), "WARNING", "La lettre doit mentionner l'offre."))
        checks.append(_check("LETTER_NO_MISSING_SKILLS_CLAIMED", bool(quality.get("doesNotClaimMissingSkills", False)), "BLOCKING", "La lettre ne doit pas revendiquer une competence manquante."))
        checks.append(_check("LETTER_VERIFIED_SKILLS", bool(quality.get("usesOnlyVerifiedSkills", False)), "BLOCKING", "Les competences utilisees doivent etre verifiees."))
        checks.append(_check("LETTER_STRUCTURE", bool(quality.get("hasClearStructure", False)), "WARNING", "La lettre doit conserver une structure claire."))
        checks.append(_check("LETTER_LENGTH", bool(quality.get("lengthOk", False)), "WARNING", "La longueur de la lettre doit rester dans la plage attendue."))

    if rag:
        used = bool(rag.get("used"))
        citations = _as_list(rag.get("citations"))
        insufficient = any("insuffisant" in normalize_text(str(item)) for item in _as_list(rag.get("warnings")))
        checks.append(_check("RAG_CITATIONS_OR_WARNING", not used or bool(citations) or insufficient, "WARNING", "RAG doit fournir des citations ou signaler le contexte insuffisant."))
        for citation in citations:
            if "embedding" in citation or "embeddingJson" in citation:
                checks.append(_check("RAG_NO_RAW_EMBEDDINGS", False, "BLOCKING", "Les embeddings bruts ne doivent jamais etre exposes."))

    for check in checks:
        if not check["passed"]:
            if check["severity"] == "BLOCKING":
                blocking.append(check["message"])
            elif check["severity"] == "WARNING":
                warnings.append(check["message"])

    warnings.extend(context.warnings)
    blocking.extend(context.errors)
    return {
        "passed": not blocking,
        "checks": checks,
        "warnings": list(dict.fromkeys(warnings)),
        "blockingIssues": list(dict.fromkeys(blocking)),
    }
