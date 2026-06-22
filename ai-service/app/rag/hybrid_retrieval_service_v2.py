"""Hybrid vector, lexical and metadata retrieval for RAG V2."""

from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timezone
import math

from app.rag.embedding_service_v2 import generate_embedding
from app.rag.reranking_service_v2 import rerank_results
from app.utils.text_normalization import normalize_text


def _cosine(left: list[float], right: list[float]) -> float:
    if not left or not right or len(left) != len(right):
        return 0.0
    dot = sum(float(a) * float(b) for a, b in zip(left, right))
    left_norm = math.sqrt(sum(float(value) ** 2 for value in left))
    right_norm = math.sqrt(sum(float(value) ** 2 for value in right))
    return max(0.0, min(1.0, dot / (left_norm * right_norm))) if left_norm and right_norm else 0.0


def _lexical_score(query: str, text: str) -> float:
    query_terms = normalize_text(query).split()
    text_terms = normalize_text(text).split()
    if not query_terms or not text_terms:
        return 0.0
    query_counts, text_counts = Counter(query_terms), Counter(text_terms)
    overlap = sum(min(count, text_counts.get(term, 0)) for term, count in query_counts.items())
    phrase_bonus = 0.15 if normalize_text(query) in normalize_text(text) else 0.0
    return min(1.0, overlap / max(1, len(query_terms)) + phrase_bonus)


def _metadata_boost(document: dict, filters: dict) -> float:
    metadata = document.get("metadata") or {}
    fields = ("studentId", "companyId", "offerId", "applicationId")
    matches = sum(1 for field in fields if filters.get(field) is not None and str(metadata.get(field)) == str(filters[field]))
    return min(1.0, matches / 2)


def _recency_boost(document: dict) -> float:
    raw = document.get("updatedAt") or document.get("createdAt")
    if not raw:
        return 0.0
    try:
        value = datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
        value = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
        age_days = max(0, (datetime.now(timezone.utc) - value).days)
        return max(0.0, 1.0 - age_days / 365)
    except (TypeError, ValueError):
        return 0.0


def _matches_filters(document: dict, filters: dict) -> bool:
    metadata = document.get("metadata") or {}
    included = filters.get("includeOwnerTypes") or filters.get("ownerTypes")
    excluded = filters.get("excludeOwnerTypes") or []
    owner_type = document.get("ownerType") or metadata.get("ownerType")
    if included and owner_type not in included:
        return False
    if owner_type in excluded:
        return False
    for field in ("studentId", "companyId", "offerId", "applicationId"):
        if filters.get(field) is not None and str(metadata.get(field)) != str(filters[field]):
            return False
    return True


def hybrid_search(query: str, documents: list[dict], filters: dict | None = None, options: dict | None = None) -> dict:
    filters, options = filters or {}, options or {}
    top_k = max(1, min(int(options.get("topK") or 5), 20))
    min_score = max(0.0, min(float(options.get("minScore") or 0.08), 1.0))
    query_embedding = generate_embedding(query)
    candidates = []
    for document in documents:
        if not _matches_filters(document, filters):
            continue
        text = document.get("text") or document.get("content") or document.get("contentPreview") or ""
        embedding = document.get("embedding") or generate_embedding(text)
        vector_score = _cosine(query_embedding, embedding)
        lexical_score = _lexical_score(query, text)
        metadata_score = _metadata_boost(document, filters)
        recency_score = _recency_boost(document)
        hybrid_score = 0.60 * vector_score + 0.25 * lexical_score + 0.10 * metadata_score + 0.05 * recency_score
        if hybrid_score < min_score or (vector_score < 0.03 and lexical_score < 0.1):
            continue
        public_document = {key: value for key, value in document.items() if key not in {"embedding", "embeddingJson"}}
        candidates.append({
            **public_document,
            "text": text,
            "vectorScore": round(vector_score, 4),
            "lexicalScore": round(lexical_score, 4),
            "metadataBoost": round(metadata_score, 4),
            "recencyBoost": round(recency_score, 4),
            "hybridScore": round(hybrid_score, 4),
            "score": round(hybrid_score, 4),
        })
    ranked = rerank_results(query, candidates, filters) if options.get("useReranking", True) else sorted(candidates, key=lambda item: item["score"], reverse=True)
    deduplicated, counts = [], defaultdict(int)
    for result in ranked:
        key = f"{result.get('ownerType')}:{result.get('ownerId') or result.get('id')}"
        if counts[key] >= 2:
            continue
        counts[key] += 1
        deduplicated.append(result)
        if len(deduplicated) >= top_k:
            break
    return {"results": deduplicated, "count": len(deduplicated), "retrievalMethod": "HYBRID_RAG_V2"}
