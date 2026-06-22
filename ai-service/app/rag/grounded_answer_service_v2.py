"""Grounded extractive answers with citations and explicit limitations."""

from __future__ import annotations

from app.utils.text_normalization import normalize_text


def detect_insufficient_context(question: str, contexts: list[dict]) -> bool:
    relevant = [context for context in contexts if float(context.get("score") or 0) >= 0.08 and (context.get("text") or context.get("contentPreview"))]
    return not question.strip() or not relevant


def extract_citations(contexts: list[dict], limit: int = 5) -> list[dict]:
    citations = []
    for context in contexts[:limit]:
        metadata = context.get("metadata") or {}
        text = context.get("text") or context.get("contentPreview") or ""
        citations.append(
            {
                "sourceId": context.get("id") or metadata.get("documentId") or context.get("ownerId"),
                "title": context.get("title") or "Document indexe",
                "sourceType": metadata.get("sourceType") or context.get("sourceType") or context.get("ownerType") or "DOCUMENT",
                "ownerType": context.get("ownerType") or metadata.get("ownerType"),
                "chunkIndex": metadata.get("chunkIndex", context.get("chunkIndex", 0)),
                "score": round(float(context.get("score") or 0), 4),
                "snippet": " ".join(text.split())[:240],
            }
        )
    return citations


def build_answer_with_limitations(question: str, contexts: list[dict]) -> str:
    if detect_insufficient_context(question, contexts):
        return "Je n ai pas assez d informations indexees pour repondre precisement. Ajoutez un document plus detaille ou selectionnez un contexte plus complet."
    selected = [context for context in contexts if float(context.get("score") or 0) >= 0.08][:3]
    facts = []
    query_terms = set(normalize_text(question).split())
    for context in selected:
        text = " ".join((context.get("text") or context.get("contentPreview") or "").split())
        sentences = [sentence.strip() for sentence in text.replace("!", ".").replace("?", ".").split(".") if sentence.strip()]
        ranked = sorted(sentences, key=lambda sentence: len(query_terms & set(normalize_text(sentence).split())), reverse=True)
        if ranked:
            facts.append(ranked[0][:320])
    if not facts:
        return "Les documents retrouves ne contiennent pas de passage assez precis pour construire une reponse fiable."
    return "D apres les documents indexes, " + " ".join(facts) + " Cette synthese est limitee aux sources citees et ne complete pas les informations absentes."


def generate_grounded_answer(question: str, contexts: list[dict], mode: str = "GENERAL") -> dict:
    if not isinstance(question, str) or not question.strip():
        raise ValueError("question is required")
    insufficient = detect_insufficient_context(question, contexts)
    citations = [] if insufficient else extract_citations(contexts)
    confidence = "LOW" if insufficient or len(citations) < 2 else "HIGH" if len(citations) >= 3 and citations[0]["score"] >= 0.65 else "MEDIUM"
    warnings = ["Contexte insuffisant; aucune information externe n a ete inventee."] if insufficient else []
    return {
        "answer": build_answer_with_limitations(question, contexts),
        "citations": citations,
        "confidence": confidence,
        "usedContextCount": len(citations),
        "answerMode": mode,
        "warnings": warnings,
        "usedDocuments": [{"id": item["sourceId"], "title": item["title"], "score": item["score"]} for item in citations],
    }
