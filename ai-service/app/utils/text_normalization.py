"""Text and list normalization helpers shared by AI V2 services."""

from __future__ import annotations

import json
import re
import unicodedata
from typing import Any


def remove_accents(text: str) -> str:
    if not isinstance(text, str):
        return ""
    return "".join(
        character
        for character in unicodedata.normalize("NFKD", text)
        if not unicodedata.combining(character)
    )


def normalize_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    value = remove_accents(text).lower()
    value = value.replace("&", " and ")
    value = re.sub(r"[./_\\|+\-]+", " ", value)
    value = re.sub(r"[^a-z0-9+#\s]", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def tokenize_text(text: str) -> list[str]:
    return [token for token in normalize_text(text).split(" ") if token]


def normalize_skill_name(skill: str) -> str:
    return normalize_text(skill)


def safe_parse_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, (tuple, set)):
        value = list(value)
    if isinstance(value, list):
        result: list[str] = []
        for item in value:
            if isinstance(item, str) and item.strip():
                result.append(item.strip())
        return result
    if isinstance(value, str):
        cleaned = value.strip()
        if not cleaned:
            return []
        try:
            parsed = json.loads(cleaned)
        except (json.JSONDecodeError, TypeError):
            parsed = None
        if isinstance(parsed, list):
            return safe_parse_list(parsed)
        return [item.strip() for item in re.split(r"[,;\n]", cleaned) if item.strip()]
    return []


def deduplicate_strings(values: list[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        key = normalize_text(value)
        if key and key not in seen:
            seen.add(key)
            result.append(value)
    return result

