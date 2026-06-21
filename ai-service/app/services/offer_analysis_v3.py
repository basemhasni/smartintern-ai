"""Offer V3 analysis with explicit requirement items and criticality."""

from __future__ import annotations

from app.knowledge.skill_taxonomy import SKILLS_BY_NAME
from app.services.offer_analysis_v2 import analyze_offer_v2
from app.utils.text_normalization import normalize_text


def _domain_v3(title: str, description: str, fallback: str) -> str:
    text = normalize_text(f"{title} {description}")
    if "fullstack" in text or "full stack" in text:
        return "FULLSTACK"
    if "frontend" in text or "front end" in text:
        return "FRONTEND"
    if "backend" in text or "back end" in text:
        return "BACKEND"
    return fallback


def _offer_quality(required: list[str], title: str, description: str) -> dict:
    text_length = len(f"{title} {description}".strip())
    if len(required) >= 3 and text_length >= 120:
        quality = "GOOD"
    elif required and (text_length >= 40 or len(required) >= 3):
        quality = "MEDIUM"
    else:
        quality = "LOW"
    return {"quality": quality, "hasExplicitRequirements": bool(required), "textLength": text_length}


def analyze_offer_v3(title: str, description: str, required_skills=None, optional_skills=None) -> dict:
    analysis = analyze_offer_v2(title, description, required_skills, optional_skills)
    normalized_title = normalize_text(title)
    structured_required = bool(required_skills)
    structured_optional = bool(optional_skills)
    requirement_items = []
    critical_skills = []

    for index, skill in enumerate(analysis["requiredSkills"], start=1):
        in_title = normalize_text(skill) in normalized_title
        importance = "CRITICAL" if in_title else "REQUIRED"
        if importance == "CRITICAL":
            critical_skills.append(skill)
        definition = SKILLS_BY_NAME.get(skill)
        requirement_items.append(
            {
                "id": f"req_{index}",
                "label": skill,
                "type": "SKILL",
                "importance": importance,
                "category": definition.category if definition else "Other",
                "source": "requiredSkills" if structured_required else "description",
            }
        )

    offset = len(requirement_items)
    for index, skill in enumerate(analysis["optionalSkills"], start=1):
        definition = SKILLS_BY_NAME.get(skill)
        requirement_items.append(
            {
                "id": f"req_{offset + index}",
                "label": skill,
                "type": "SKILL",
                "importance": "OPTIONAL",
                "category": definition.category if definition else "Other",
                "source": "optionalSkills" if structured_optional else "description",
            }
        )

    analysis["domain"] = _domain_v3(title, description, analysis["domain"])
    analysis["description"] = description
    analysis["criticalSkills"] = critical_skills
    analysis["requirementItems"] = requirement_items
    analysis["offerQuality"] = _offer_quality(analysis["requiredSkills"], title, description)
    return analysis
