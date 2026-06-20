"""Deterministic offer analysis using structured skills first."""

from __future__ import annotations

import re

from app.services.skill_extraction_service import canonicalize_skill_list, categorize_skills, extract_skills_from_text
from app.utils.text_normalization import deduplicate_strings, normalize_text


DOMAIN_RULES = (
    ("MOBILE", ("mobile", "android", "ios", "flutter", "react native")),
    ("DEVOPS", ("devops", "cloud", "docker", "kubernetes", "ci cd", "infrastructure")),
    ("QA", ("qa", "quality assurance", "test automation", "selenium", "cypress")),
    ("AI", ("artificial intelligence", "intelligence artificielle", "machine learning", "nlp", "rag", "langgraph")),
    ("DATA", ("data", "pandas", "numpy", "analytics")),
    ("WEB", ("web", "frontend", "backend", "fullstack", "full stack", "react", "node")),
)


def _detect_domain(text: str, categories: dict[str, list[str]]) -> str:
    normalized = normalize_text(text)
    for domain, keywords in DOMAIN_RULES:
        if any(re.search(rf"(?<![a-z0-9]){re.escape(keyword)}(?![a-z0-9])", normalized) for keyword in keywords):
            return domain
    if categories.get("Mobile"):
        return "MOBILE"
    if categories.get("DevOps / Cloud"):
        return "DEVOPS"
    if categories.get("Testing / QA"):
        return "QA"
    if categories.get("Data / AI"):
        return "AI"
    if categories.get("Frontend") or categories.get("Backend"):
        return "WEB"
    return "GENERAL"


def _detect_seniority(text: str) -> str:
    normalized = normalize_text(text)
    if any(keyword in normalized for keyword in ("3 ans", "4 ans", "5 ans", "senior", "experimente")):
        return "INTERMEDIATE"
    if any(keyword in normalized for keyword in ("junior", "stage", "stagiaire", "internship", "debutant")):
        return "JUNIOR"
    return "UNKNOWN"


def _extract_responsibilities(description: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+|\n+|;", description)
    action_markers = ("develop", "implement", "concevoir", "maintenir", "tester", "collabor", "particip", "build", "design")
    return deduplicate_strings([
        sentence.strip()[:240]
        for sentence in sentences
        if len(sentence.strip()) >= 18 and any(marker in normalize_text(sentence) for marker in action_markers)
    ])[:8]


def _extract_keywords(title: str, description: str, skills: list[str], domain: str) -> list[str]:
    normalized = normalize_text(f"{title} {description}")
    keywords = list(skills)
    for keyword in ("stage", "fullstack", "frontend", "backend", "mobile", "cloud", "remote", "agile"):
        if keyword in normalized:
            keywords.append(keyword.upper() if keyword == "remote" else keyword)
    keywords.append(domain)
    return deduplicate_strings(keywords)[:20]


def analyze_offer_v2(title: str, description: str, required_skills=None, optional_skills=None) -> dict:
    cleaned_title = title.strip() if isinstance(title, str) else ""
    cleaned_description = description.strip() if isinstance(description, str) else ""
    if not cleaned_title or not cleaned_description:
        raise ValueError("Offer title and description must not be empty")

    structured_required = canonicalize_skill_list(required_skills)
    structured_optional = canonicalize_skill_list(optional_skills)
    detected = extract_skills_from_text(f"{cleaned_title} {cleaned_description}")
    required = structured_required or detected
    optional = [skill for skill in structured_optional if skill not in required]
    all_skills = deduplicate_strings(required + optional + detected)
    categories = categorize_skills(all_skills)
    domain = _detect_domain(f"{cleaned_title} {cleaned_description}", categories)
    seniority = _detect_seniority(f"{cleaned_title} {cleaned_description}")

    return {
        "title": cleaned_title,
        "summary": f"Offre {domain.lower()} avec {len(required)} competence(s) requise(s) explicite(s).",
        "requiredSkills": required,
        "optionalSkills": optional,
        "skillsByCategory": categories,
        "responsibilities": _extract_responsibilities(cleaned_description),
        "domain": domain,
        "seniorityExpected": seniority,
        "keywords": _extract_keywords(cleaned_title, cleaned_description, all_skills, domain),
        "criticalSkills": required,
        "niceToHaveSkills": optional,
    }

