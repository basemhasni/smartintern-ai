"""Taxonomy-driven skill extraction with aliases and local context."""

from __future__ import annotations

import re
from collections import defaultdict

from app.knowledge.skill_taxonomy import SKILL_TAXONOMY, SkillDefinition, get_related_skills
from app.utils.text_normalization import deduplicate_strings, normalize_text, safe_parse_list


def _alias_pattern(alias: str) -> re.Pattern[str]:
    normalized_alias = normalize_text(alias)
    escaped = re.escape(normalized_alias).replace(r"\ ", r"\s+")
    return re.compile(rf"(?<![a-z0-9]){escaped}(?![a-z0-9])", re.IGNORECASE)


def _context_windows(text: str, start: int, end: int, radius: int = 90) -> list[str]:
    left = max(0, start - radius)
    right = min(len(text), end + radius)
    context = text[left:right].strip(" ,.;:-\n")
    return [context] if context else []


def detect_skill_mentions(text: str, taxonomy=SKILL_TAXONOMY) -> list[dict]:
    normalized = normalize_text(text)
    if not normalized:
        return []

    mentions: list[dict] = []
    candidates: list[tuple[int, int, SkillDefinition, str]] = []
    for definition in taxonomy:
        for alias in definition.aliases:
            for match in _alias_pattern(alias).finditer(normalized):
                candidates.append((match.start(), match.end(), definition, alias))

    selected: list[tuple[int, int, SkillDefinition, str]] = []
    occupied: list[tuple[int, int]] = []
    for start, end, definition, alias in sorted(candidates, key=lambda item: (-(item[1] - item[0]), item[0])):
        if any(start < occupied_end and end > occupied_start for occupied_start, occupied_end in occupied):
            continue
        occupied.append((start, end))
        selected.append((start, end, definition, alias))

    grouped: dict[str, list[tuple[int, int, SkillDefinition, str]]] = defaultdict(list)
    for item in selected:
        grouped[item[2].canonical_name].append(item)

    for canonical_name, matches in grouped.items():
        definition = matches[0][2]
        unique_contexts: list[str] = []
        matched_aliases: list[str] = []
        for start, end, _, alias in sorted(matches, key=lambda item: item[0]):
            matched_aliases.append(alias)
            unique_contexts.extend(_context_windows(normalized, start, end))

        canonical_alias = normalize_text(definition.canonical_name)
        alias_quality = max(
            1.0 if normalize_text(alias) == canonical_alias else 0.95
            for alias in matched_aliases
        )
        repetition_bonus = min(0.04, max(0, len(matches) - 1) * 0.02)
        mentions.append(
            {
                "skill": definition.canonical_name,
                "matchedAlias": matched_aliases[0],
                "category": definition.category,
                "confidence": round(min(0.99, alias_quality + repetition_bonus), 2),
                "contexts": deduplicate_strings(unique_contexts)[:3],
                "mentionCount": len(matches),
                "weight": definition.weight,
            }
        )

    return sorted(mentions, key=lambda item: (-item["confidence"], item["skill"]))


def categorize_skills(skills: list[str]) -> dict[str, list[str]]:
    categories: dict[str, list[str]] = defaultdict(list)
    lookup = {definition.canonical_name: definition for definition in SKILL_TAXONOMY}
    for skill in skills:
        definition = lookup.get(skill)
        category = definition.category if definition else "Other"
        categories[category].append(skill)
    return {category: deduplicate_strings(values) for category, values in categories.items()}


def infer_related_skills(skills: list[str]) -> list[dict]:
    explicit = set(skills)
    inferred: dict[str, set[str]] = defaultdict(set)
    for skill in skills:
        for related in get_related_skills(skill):
            if related not in explicit and related in {item.canonical_name for item in SKILL_TAXONOMY}:
                inferred[related].add(skill)
    return [
        {"skill": skill, "relatedTo": sorted(sources), "confidence": 0.45}
        for skill, sources in sorted(inferred.items())
    ]


def extract_skills_with_context(text: str) -> dict:
    mentions = detect_skill_mentions(text)
    skills = [mention["skill"] for mention in mentions]
    return {
        "skills": skills,
        "skillsByCategory": categorize_skills(skills),
        "detectedMentions": mentions,
        "inferredSkills": infer_related_skills(skills),
    }


def extract_skills_from_text(text: str) -> list[str]:
    return extract_skills_with_context(text)["skills"]


def canonicalize_skill_list(value) -> list[str]:
    raw_skills = safe_parse_list(value)
    alias_lookup: dict[str, str] = {}
    for definition in SKILL_TAXONOMY:
        alias_lookup[normalize_text(definition.canonical_name)] = definition.canonical_name
        for alias in definition.aliases:
            alias_lookup.setdefault(normalize_text(alias), definition.canonical_name)
    canonical: list[str] = []
    for raw_skill in raw_skills:
        direct_match = alias_lookup.get(normalize_text(raw_skill))
        if direct_match:
            canonical.append(direct_match)
            continue
        extracted = extract_skills_from_text(raw_skill)
        canonical.extend(extracted or [raw_skill.strip()])
    return deduplicate_strings(canonical)
