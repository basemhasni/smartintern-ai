"""Deterministic reranking for hybrid RAG candidates."""

from __future__ import annotations

from app.services.skill_extraction_service import extract_skills_from_text
from app.utils.text_normalization import normalize_text

IMPORTANT_SECTIONS = {"skills", "required_skills", "projects", "experience", "missions"}


def rerank_results(query: str, results: list[dict], filters: dict | None = None) -> list[dict]:
    filters = filters or {}
    extraction = extract_skills_from_text(query)
    query_skills = set(extraction.get("skills", []) if isinstance(extraction, dict) else extraction)
    reranked = []
    for result in results:
        metadata = result.get("metadata") or {}
        signals = []
        bonus = 0.0
        result_skills = set(metadata.get("skills") or [])
        for skill in sorted(query_skills & result_skills):
            signals.append(f"skill:{skill}")
            bonus += 0.025
        section = metadata.get("section")
        if section in IMPORTANT_SECTIONS:
            signals.append(f"section:{section}")
            bonus += 0.03
        for field in ("offerId", "applicationId", "studentId", "companyId"):
            if filters.get(field) and str(metadata.get(field)) == str(filters[field]):
                signals.append(f"{field}:{filters[field]}")
                bonus += 0.05
        if normalize_text(query) in normalize_text(result.get("text") or ""):
            signals.append("exact-query")
            bonus += 0.04
        score = min(1.0, float(result.get("hybridScore") or result.get("score") or 0) + bonus)
        reranked.append({**result, "score": round(score, 4), "rerankReason": ", ".join(signals) or "hybrid similarity", "matchedSignals": signals})
    return sorted(reranked, key=lambda item: item["score"], reverse=True)
