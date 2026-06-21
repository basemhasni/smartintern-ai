"""Semantic similarity with lazy optional backends and safe fallbacks."""

from __future__ import annotations

import importlib.util
import math
import os
from difflib import SequenceMatcher
from typing import Any

from app.utils.text_normalization import normalize_text


_sentence_model = None
_sentence_model_failed = False


def _sentence_transformers_available() -> bool:
    return importlib.util.find_spec("sentence_transformers") is not None


def _sklearn_available() -> bool:
    return importlib.util.find_spec("sklearn") is not None


def _load_sentence_model():
    global _sentence_model, _sentence_model_failed
    if _sentence_model is not None or _sentence_model_failed or not _sentence_transformers_available():
        return _sentence_model
    try:
        from sentence_transformers import SentenceTransformer

        model_name = os.getenv("SMARTINTERN_SENTENCE_MODEL", "all-MiniLM-L6-v2")
        allow_download = os.getenv("SMARTINTERN_ALLOW_MODEL_DOWNLOAD", "false").lower() == "true"
        _sentence_model = SentenceTransformer(model_name, local_files_only=not allow_download)
    except Exception:
        _sentence_model_failed = True
        _sentence_model = None
    return _sentence_model


def _cosine_similarity(vector_a, vector_b) -> float:
    dot = sum(float(a) * float(b) for a, b in zip(vector_a, vector_b))
    norm_a = math.sqrt(sum(float(value) ** 2 for value in vector_a))
    norm_b = math.sqrt(sum(float(value) ** 2 for value in vector_b))
    if not norm_a or not norm_b:
        return 0.0
    return max(0.0, min(1.0, dot / (norm_a * norm_b)))


def _sentence_similarity(text_a: str, text_b: str) -> float | None:
    model = _load_sentence_model()
    if model is None:
        return None
    try:
        vectors = model.encode([text_a, text_b], normalize_embeddings=True)
        return _cosine_similarity(vectors[0], vectors[1])
    except Exception:
        return None


def _tfidf_similarity(text_a: str, text_b: str) -> float | None:
    if not _sklearn_available():
        return None
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        matrix = TfidfVectorizer(ngram_range=(1, 2), strip_accents="unicode").fit_transform([text_a, text_b])
        return max(0.0, min(1.0, float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0])))
    except Exception:
        return None


def _lexical_similarity(text_a: str, text_b: str) -> float:
    normalized_a = normalize_text(text_a)
    normalized_b = normalize_text(text_b)
    if not normalized_a or not normalized_b:
        return 0.0
    tokens_a = set(normalized_a.split())
    tokens_b = set(normalized_b.split())
    intersection = len(tokens_a & tokens_b)
    union = len(tokens_a | tokens_b)
    jaccard = intersection / union if union else 0.0
    containment = intersection / min(len(tokens_a), len(tokens_b)) if tokens_a and tokens_b else 0.0
    sequence = SequenceMatcher(None, normalized_a, normalized_b).ratio()
    return max(0.0, min(1.0, jaccard * 0.45 + containment * 0.35 + sequence * 0.20))


def compute_text_similarity(text_a: str, text_b: str) -> dict[str, Any]:
    if not normalize_text(text_a) or not normalize_text(text_b):
        return {"score": 0.0, "method": "lexical"}
    sentence_score = _sentence_similarity(text_a, text_b)
    if sentence_score is not None:
        return {"score": round(sentence_score, 4), "method": "sentence-transformers"}
    tfidf_score = _tfidf_similarity(text_a, text_b)
    if tfidf_score is not None:
        return {"score": round(tfidf_score, 4), "method": "tfidf"}
    return {"score": round(_lexical_similarity(text_a, text_b), 4), "method": "lexical"}


def rank_evidence_for_requirement(requirement: str, evidence_list: list[str]) -> list[dict]:
    matches = []
    for evidence in evidence_list:
        if not isinstance(evidence, str) or not evidence.strip():
            continue
        similarity = compute_text_similarity(requirement, evidence)
        matches.append({"text": evidence.strip(), **similarity})
    return sorted(matches, key=lambda item: item["score"], reverse=True)


def compute_requirement_evidence_similarity(requirement: str, evidence_list: list[str]) -> dict[str, Any]:
    ranked = rank_evidence_for_requirement(requirement, evidence_list)
    best = ranked[0] if ranked else {"text": None, "score": 0.0, "method": get_similarity_backend()}
    return {
        "score": best["score"],
        "method": best["method"],
        "bestEvidence": best["text"],
        "allMatches": ranked,
    }


def get_similarity_backend() -> str:
    if _load_sentence_model() is not None:
        return "sentence-transformers"
    if _sklearn_available():
        return "tfidf"
    return "lexical"

