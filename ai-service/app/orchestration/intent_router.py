"""Intent normalization and execution planning for Orchestrator V2."""

from __future__ import annotations

from typing import Any

from app.utils.text_normalization import normalize_text


SUPPORTED_INTENTS = {
    "ANALYZE_CV",
    "ANALYZE_OFFER",
    "MATCH",
    "CAREER_ADVICE",
    "GENERATE_LETTER",
    "FULL_APPLICATION_ASSISTANCE",
    "CANDIDATE_RANKING_ASSISTANCE",
    "RAG_QUESTION",
    "UNKNOWN",
}

INTENT_ALIASES = {
    "analyze_cv": "ANALYZE_CV",
    "cv_analysis": "ANALYZE_CV",
    "analyse_cv": "ANALYZE_CV",
    "analyze_offer": "ANALYZE_OFFER",
    "offer_analysis": "ANALYZE_OFFER",
    "analyse_offer": "ANALYZE_OFFER",
    "match": "MATCH",
    "matching": "MATCH",
    "career_advice": "CAREER_ADVICE",
    "career": "CAREER_ADVICE",
    "generate_letter": "GENERATE_LETTER",
    "motivation_letter": "GENERATE_LETTER",
    "letter": "GENERATE_LETTER",
    "full_application_assistance": "FULL_APPLICATION_ASSISTANCE",
    "application_assistance": "FULL_APPLICATION_ASSISTANCE",
    "candidate_ranking": "CANDIDATE_RANKING_ASSISTANCE",
    "candidate_ranking_assistance": "CANDIDATE_RANKING_ASSISTANCE",
    "rag": "RAG_QUESTION",
    "rag_question": "RAG_QUESTION",
    "question": "RAG_QUESTION",
}


def _bool_option(options: dict[str, Any], name: str, default: bool) -> bool:
    value = options.get(name, default)
    return bool(value)


def normalize_intent(intent: str | None) -> str:
    if not intent:
        return "UNKNOWN"
    cleaned = str(intent).strip()
    upper = cleaned.upper()
    if upper in SUPPORTED_INTENTS:
        return upper
    alias_key = cleaned.lower().replace("-", "_").replace(" ", "_")
    return INTENT_ALIASES.get(alias_key, "UNKNOWN")


def detect_intent_from_question(question: str | None) -> str:
    normalized = normalize_text(question or "")
    if not normalized:
        return "UNKNOWN"
    if any(token in normalized for token in ("lettre", "motivation", "candidature ecrite")):
        return "GENERATE_LETTER"
    if any(token in normalized for token in ("postuler", "dossier", "aide moi pour cette offre", "preparer ma candidature")):
        return "FULL_APPLICATION_ASSISTANCE"
    if any(token in normalized for token in ("conseil", "ameliorer", "competence", "ecart", "progresser", "plan d action")):
        return "CAREER_ADVICE"
    if any(token in normalized for token in ("matching", "compatibilite", "score", "correspondance")):
        return "MATCH"
    if any(token in normalized for token in ("source", "document", "contexte", "rag", "citation")):
        return "RAG_QUESTION"
    if any(token in normalized for token in ("cv", "analyse mon cv", "competences cv")):
        return "ANALYZE_CV"
    if any(token in normalized for token in ("offre", "analyse l offre", "exigences")):
        return "ANALYZE_OFFER"
    return "UNKNOWN"


def resolve_intent(intent: str | None, question: str | None) -> str:
    normalized = normalize_intent(intent)
    if normalized != "UNKNOWN":
        return normalized
    return detect_intent_from_question(question)


def build_execution_plan(intent: str, options: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    opts = options or {}
    include_matching = _bool_option(opts, "includeMatching", True)
    include_career = _bool_option(opts, "includeCareerAdvice", True)
    include_letter = _bool_option(opts, "includeMotivationLetter", True)
    include_rag = _bool_option(opts, "includeRag", True)

    plan: list[dict[str, Any]] = []

    def add(step: str, required: bool, can_use_cache: bool = True) -> None:
        if step not in [item["step"] for item in plan]:
            plan.append({"step": step, "required": required, "canUseCache": can_use_cache})

    if intent == "ANALYZE_CV":
        add("ANALYZE_CV", True)
    elif intent == "ANALYZE_OFFER":
        add("ANALYZE_OFFER", True)
    elif intent == "MATCH":
        add("ANALYZE_CV", False)
        add("ANALYZE_OFFER", False)
        add("MATCH_V3", True)
    elif intent == "CAREER_ADVICE":
        if include_matching:
            add("ANALYZE_CV", False)
            add("ANALYZE_OFFER", False)
            add("MATCH_V3", True)
        if include_rag:
            add("RAG_V2", False)
        add("CAREER_ASSISTANT_V2", True)
    elif intent == "GENERATE_LETTER":
        if include_matching:
            add("ANALYZE_CV", False)
            add("ANALYZE_OFFER", False)
            add("MATCH_V3", True)
        if include_rag:
            add("RAG_V2", False)
        if include_career:
            add("CAREER_ASSISTANT_V2", False)
        add("MOTIVATION_LETTER_V2", True)
    elif intent == "FULL_APPLICATION_ASSISTANCE":
        add("ANALYZE_CV", True)
        add("ANALYZE_OFFER", True)
        if include_matching:
            add("MATCH_V3", True)
        if include_rag:
            add("RAG_V2", False)
        if include_career:
            add("CAREER_ASSISTANT_V2", False)
        if include_letter:
            add("MOTIVATION_LETTER_V2", False)
    elif intent == "CANDIDATE_RANKING_ASSISTANCE":
        add("ANALYZE_CV", False)
        add("ANALYZE_OFFER", False)
        add("MATCH_V3", True)
        if include_rag:
            add("RAG_V2", False)
    elif intent == "RAG_QUESTION":
        add("RAG_V2", True)
    else:
        return []

    add("QUALITY_CONTROL", True, False)
    return plan
