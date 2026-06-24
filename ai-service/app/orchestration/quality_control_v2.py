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
    offer_quality = _as_dict(context.offerQualityAnalysis)
    simulation = _as_dict(context.skillGapSimulation)
    career = _as_dict(context.careerAdvice)
    letter = _as_dict(context.motivationLetter)
    rag = _as_dict(context.ragContext)
    offer = _as_dict(context.normalizedInput.get("offer"))

    if matching:
        v3 = _as_dict(matching.get("v3"))
        explainability = _as_dict(matching.get("explainability"))
        signal_map = _as_dict(explainability.get("careerSignalMap"))
        categories = _as_list(signal_map.get("categories"))
        decision_trace = _as_list(explainability.get("decisionTrace"))
        skill_evidence = _as_dict(explainability.get("skillEvidenceMap"))
        matrix = _as_list(v3.get("coverageMatrix"))
        required = _as_list(_as_dict(context.offerAnalysis).get("requiredSkills")) or _as_list(offer.get("requiredSkills"))
        checks.append(_check("MATCHING_SCORE_BOUNDS", _score_ok(matching), "BLOCKING", "Le score matching doit etre entre 0 et 100."))
        checks.append(_check("MATCHING_DECISION_LABEL", bool(matching.get("decisionLabel")), "WARNING", "Le matching doit exposer decisionLabel."))
        checks.append(_check("MATCHING_COVERAGE_MATRIX", not required or bool(matrix), "WARNING", "coverageMatrix est attendue si des competences requises existent."))
        checks.append(_check("EXPLAINABILITY_PRESENT", bool(explainability), "WARNING", "Le matching doit exposer explainability."))
        checks.append(_check("EXPLAINABILITY_SKILL_EVIDENCE", not required or bool(skill_evidence), "WARNING", "skillEvidenceMap doit couvrir les competences requises."))
        checks.append(_check("EXPLAINABILITY_SIGNAL_MAP", bool(categories), "WARNING", "careerSignalMap doit contenir des categories."))
        checks.append(_check("EXPLAINABILITY_DECISION_TRACE", len(decision_trace) >= 3, "WARNING", "decisionTrace doit contenir au moins trois etapes."))
        for category in categories:
            score = _as_dict(category).get("score")
            checks.append(_check("SIGNAL_MAP_SCORE_BOUNDS", isinstance(score, int) and 0 <= score <= 100, "WARNING", "Les scores de categorie doivent etre entre 0 et 100."))
        if _as_list(v3.get("criticalMissingSkills")) and int(matching.get("score") or 0) > 72:
            checks.append(_check("CRITICAL_MISSING_CAP", False, "BLOCKING", "Une competence critique manquante doit plafonner le score."))
    else:
        checks.append(_check("MATCHING_AVAILABLE", context.intent not in {"MATCH", "SKILL_GAP_SIMULATION", "FULL_APPLICATION_ASSISTANCE", "CAREER_ADVICE", "GENERATE_LETTER"}, "WARNING", "Aucun matching disponible."))

    if offer_quality:
        quality_score = offer_quality.get("qualityScore")
        issues = _as_list(offer_quality.get("issues"))
        draft = _as_dict(offer_quality.get("improvedOfferDraft"))
        trace = _as_list(offer_quality.get("decisionTrace"))
        required = _as_list(_as_dict(offer_quality.get("context")).get("requiredSkills"))
        issue_types = {str(_as_dict(item).get("type")) for item in issues}
        checks.append(_check("OFFER_QUALITY_SCORE_BOUNDS", isinstance(quality_score, int) and 0 <= quality_score <= 100, "BLOCKING", "Le score de qualite de l'offre doit etre entre 0 et 100."))
        checks.append(_check("OFFER_QUALITY_LEVEL", bool(offer_quality.get("qualityLevel")), "WARNING", "L'analyse doit exposer qualityLevel."))
        checks.append(_check("OFFER_QUALITY_MISSING_REQUIRED", bool(required) or "MISSING_REQUIRED_SKILLS" in issue_types, "BLOCKING", "Une offre sans requiredSkills doit etre signalee."))
        checks.append(_check("OFFER_QUALITY_DRAFT", bool(draft), "WARNING", "Une proposition d'offre amelioree est attendue."))
        checks.append(_check("OFFER_QUALITY_TRACE", len(trace) >= 3, "WARNING", "La trace de decision doit expliquer l'analyse de l'offre."))

    if simulation:
        current = simulation.get("currentScore")
        potential = simulation.get("potentialBestScore")
        gain = simulation.get("scoreGain")
        gaps = _as_list(simulation.get("highImpactGaps"))
        path = _as_list(simulation.get("recommendedPath"))
        required_missing = _as_list(_as_dict(matching.get("v3")).get("missingRequiredSkills"))
        checks.append(_check("SIMULATION_CURRENT_SCORE_BOUNDS", isinstance(current, int) and 0 <= current <= 100, "BLOCKING", "Le score actuel simule doit etre entre 0 et 100."))
        checks.append(_check("SIMULATION_POTENTIAL_SCORE_BOUNDS", isinstance(potential, int) and 0 <= potential <= 100, "BLOCKING", "Le score potentiel doit etre entre 0 et 100."))
        checks.append(_check("SIMULATION_NON_NEGATIVE_GAIN", isinstance(gain, int) and gain >= 0 and potential >= current, "BLOCKING", "La simulation ne doit pas produire un gain negatif."))
        checks.append(_check("SIMULATION_HIGH_IMPACT_GAPS", not required_missing or bool(gaps), "WARNING", "Les gaps obligatoires doivent produire des priorites de simulation."))
        checks.append(_check("SIMULATION_RECOMMENDED_PATH", not gaps or bool(path), "WARNING", "Le chemin recommande doit suivre les gaps prioritaires."))
        checks.append(_check("SIMULATION_NO_STRONG_PRIORITY", not any(str(_as_dict(gap).get("currentEvidenceLevel") or "").upper() == "STRONG" for gap in gaps), "WARNING", "Une competence deja fortement prouvee ne doit pas etre priorisee."))

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
