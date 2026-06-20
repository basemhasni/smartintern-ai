"""Deterministic CV analysis built on the shared skill taxonomy."""

from __future__ import annotations

import re

from app.services.skill_extraction_service import extract_skills_with_context
from app.utils.text_normalization import deduplicate_strings, normalize_text


SOFT_SKILLS = {
    "Communication": ("communication", "communiquer", "presentation"),
    "Teamwork": ("teamwork", "team work", "travail en equipe", "esprit equipe"),
    "Autonomy": ("autonome", "autonomie", "independent"),
    "Problem Solving": ("problem solving", "resolution de problemes", "resoudre des problemes"),
    "Adaptability": ("adaptabilite", "adaptable", "flexible"),
}

DOMAIN_CATEGORY_MAP = {
    "Frontend": "FRONTEND",
    "Backend": "BACKEND",
    "Database": "BACKEND",
    "DevOps / Cloud": "DEVOPS",
    "Data / AI": "AI",
    "Mobile": "MOBILE",
    "Testing / QA": "QA",
}

LANGUAGE_ALIASES = {
    "French": ("francais", "french"),
    "English": ("anglais", "english"),
    "Arabic": ("arabe", "arabic"),
    "German": ("allemand", "german"),
    "Spanish": ("espagnol", "spanish"),
}


def _contains_phrase(text: str, phrase: str) -> bool:
    escaped = re.escape(normalize_text(phrase)).replace(r"\ ", r"\s+")
    return bool(re.search(rf"(?<![a-z0-9]){escaped}(?![a-z0-9])", text))


def _detect_soft_skills(normalized_text: str) -> list[str]:
    return [
        name
        for name, aliases in SOFT_SKILLS.items()
        if any(_contains_phrase(normalized_text, alias) for alias in aliases)
    ]


def _detect_languages(normalized_text: str) -> list[str]:
    return [
        language
        for language, aliases in LANGUAGE_ALIASES.items()
        if any(_contains_phrase(normalized_text, alias) for alias in aliases)
    ]


def _detect_education_level(normalized_text: str) -> str:
    patterns = (
        ("MASTER", ("master", "bac 5", "ingenieur", "engineering degree")),
        ("LICENCE", ("licence", "bachelor", "bac 3")),
        ("BTS", ("bts", "technicien superieur")),
        ("DOCTORATE", ("doctorat", "phd")),
    )
    for level, aliases in patterns:
        if any(_contains_phrase(normalized_text, alias) for alias in aliases):
            return level
    return "UNKNOWN"


def _detect_experience_level(normalized_text: str, has_skills: bool) -> str:
    year_values = [int(value) for value in re.findall(r"\b(\d{1,2})\s*(?:ans|annees|years)\b", normalized_text)]
    max_years = max(year_values, default=0)
    if max_years >= 5 or any(_contains_phrase(normalized_text, item) for item in ("senior", "expert", "lead developer")):
        return "INTERMEDIATE"
    if max_years >= 2 or any(_contains_phrase(normalized_text, item) for item in ("alternance", "professional experience", "experience professionnelle")):
        return "INTERMEDIATE"
    if any(_contains_phrase(normalized_text, item) for item in ("junior", "stage", "internship", "projet academique", "academic project")):
        return "JUNIOR"
    if has_skills:
        return "BEGINNER"
    return "UNKNOWN"


def _extract_project_signals(text: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+|\n+", text)
    signals = []
    for sentence in sentences:
        normalized = normalize_text(sentence)
        if any(keyword in normalized for keyword in ("projet", "project", "realise", "developpe", "concu", "built")):
            cleaned = sentence.strip()
            if len(cleaned) >= 20:
                signals.append(cleaned[:240])
    return deduplicate_strings(signals)[:6]


def _detect_domains(skills_by_category: dict[str, list[str]], normalized_text: str) -> list[str]:
    domains = [DOMAIN_CATEGORY_MAP[category] for category, skills in skills_by_category.items() if skills and category in DOMAIN_CATEGORY_MAP]
    keyword_domains = {
        "WEB": ("web", "fullstack", "full stack", "site web"),
        "MOBILE": ("mobile", "android", "ios"),
        "DATA": ("data analysis", "analyse de donnees", "data science"),
        "DEVOPS": ("devops", "cloud", "infrastructure"),
        "QA": ("quality assurance", "assurance qualite", "qa"),
    }
    for domain, aliases in keyword_domains.items():
        if any(_contains_phrase(normalized_text, alias) for alias in aliases):
            domains.append(domain)
    return deduplicate_strings(domains)


def _raw_text_quality(text: str) -> dict:
    length = len(text.strip())
    if length >= 600:
        quality = "GOOD"
    elif length >= 160:
        quality = "MEDIUM"
    else:
        quality = "LOW"
    return {"hasEnoughText": length >= 160, "length": length, "quality": quality}


def _summary(skills: list[str], domains: list[str], experience_level: str, quality: str) -> str:
    if quality == "LOW" and not skills:
        return "Le texte du CV est trop limite pour etablir un profil technique fiable."
    skill_text = ", ".join(skills[:6]) if skills else "peu de competences techniques explicites"
    domain_text = ", ".join(domains[:3]) if domains else "domaine non determine"
    return f"Profil {experience_level.lower()} oriente {domain_text}, avec des signaux explicites autour de {skill_text}."


def analyze_cv_v2(text: str) -> dict:
    cleaned_text = text.strip() if isinstance(text, str) else ""
    if not cleaned_text:
        raise ValueError("CV text must not be empty")

    normalized = normalize_text(cleaned_text)
    extraction = extract_skills_with_context(cleaned_text)
    skills = extraction["skills"]
    categories = extraction["skillsByCategory"]
    quality = _raw_text_quality(cleaned_text)
    level_v2 = _detect_experience_level(normalized, bool(skills))
    legacy_level = {
        "INTERMEDIATE": "intermediate",
        "JUNIOR": "junior",
        "BEGINNER": "junior",
        "UNKNOWN": "junior",
    }[level_v2]
    domains = _detect_domains(categories, normalized)
    tools = categories.get("Tools", []) + categories.get("DevOps / Cloud", [])

    return {
        "skills": skills,
        "experienceLevel": legacy_level,
        "summary": _summary(skills, domains, level_v2, quality["quality"]),
        "detectedSkills": skills,
        "skillsByCategory": categories,
        "detectedMentions": extraction["detectedMentions"],
        "inferredRelatedSkills": extraction["inferredSkills"],
        "technicalSkills": [skill for category, values in categories.items() if category != "Tools" for skill in values],
        "softSkills": _detect_soft_skills(normalized),
        "educationLevel": _detect_education_level(normalized),
        "experienceLevelV2": level_v2,
        "projectSignals": _extract_project_signals(cleaned_text),
        "domainSignals": domains,
        "languages": _detect_languages(normalized),
        "tools": deduplicate_strings(tools),
        "rawTextQuality": quality,
    }

