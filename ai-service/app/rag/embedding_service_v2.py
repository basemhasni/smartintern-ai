"""Stable local embeddings with optional sentence-transformers acceleration."""

from __future__ import annotations

import hashlib
import math
import os
import re
from typing import Iterable

DEFAULT_DIMENSION = 384
MODEL_NAME = "all-MiniLM-L6-v2"
_model = None
_model_attempted = False
_backend = "hashing-v2"


def _tokens(text: str) -> list[str]:
    return re.findall(r"[a-z0-9+#.]{2,}", (text or "").lower())


def normalize_embedding(vector: Iterable[float]) -> list[float]:
    values = [float(value) for value in vector]
    norm = math.sqrt(sum(value * value for value in values))
    if not norm:
        return [0.0 for _ in values]
    return [round(value / norm, 8) for value in values]


def validate_embedding(vector: object) -> bool:
    return isinstance(vector, list) and len(vector) == get_embedding_dimension() and all(
        isinstance(value, (int, float)) and math.isfinite(float(value)) for value in vector
    )


def _load_model():
    global _model, _model_attempted, _backend
    if _model_attempted:
        return _model
    _model_attempted = True
    try:
        from sentence_transformers import SentenceTransformer

        local_only = os.getenv("RAG_ALLOW_MODEL_DOWNLOAD", "false").lower() != "true"
        _model = SentenceTransformer(MODEL_NAME, local_files_only=local_only)
        _backend = "sentence-transformers"
    except Exception:
        _model = None
        _backend = "hashing-v2"
    return _model


def _hashing_embedding(text: str) -> list[float]:
    tokens = _tokens(text)
    features = tokens + [f"{left}::{right}" for left, right in zip(tokens, tokens[1:])]
    vector = [0.0] * DEFAULT_DIMENSION
    for feature in features:
        digest = hashlib.blake2b(feature.encode("utf-8"), digest_size=8).digest()
        index = int.from_bytes(digest[:4], "little") % DEFAULT_DIMENSION
        sign = 1.0 if digest[4] % 2 == 0 else -1.0
        vector[index] += sign
    return normalize_embedding(vector)


def generate_embedding(text: str) -> list[float]:
    if not isinstance(text, str) or not text.strip():
        return [0.0] * DEFAULT_DIMENSION
    model = _load_model()
    if model is not None:
        try:
            return normalize_embedding(model.encode(text, normalize_embeddings=True).tolist())
        except Exception:
            pass
    return _hashing_embedding(text)


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    return [generate_embedding(text) for text in texts]


def get_embedding_dimension() -> int:
    return DEFAULT_DIMENSION


def get_embedding_backend() -> str:
    _load_model()
    return _backend
