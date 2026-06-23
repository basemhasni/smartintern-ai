"""Career signal map for explainable matching."""

from __future__ import annotations

from typing import Any

from app.knowledge.skill_taxonomy import get_skill
from app.services.skill_extraction_service import canonicalize_skill_list
from app.utils.text_normalization import deduplicate_strings, normalize_text


DISPLAY_CATEGORIES = [
    "Frontend",
    "Backend",
    "Database",
    "DevOps",
    "Cloud",
    "Data / AI",
    "Mobile",
    "QA / Testing",
    "Tools",
    "Soft Skills",
]

EVIDENCE_VALUE = {"STRONG": 1.0, "MEDIUM": 0.68, "WEAK": 0.35, "MISSING": 0.0}
CLOUD_SKILLS = {"AWS", "Azure"}
DEVOPS_SKILLS = {"Docker", "Kubernetes", "GitHub Actions", "Jenkins", "CI/CD", "Linux", "Nginx"}


def _as_dict(value: Any) -> dict:
    return value if isinstance(value, dict) else {}


def _as_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def _category_for(skill: str) -> str:
    definition = get_skill(skill)
    category = definition.category if definition else "Soft Skills"
    if category == "DevOps / Cloud":
        if skill in CLOUD_SKILLS:
            return "Cloud"
        if skill in DEVOPS_SKILLS:
            return "DevOps"
        return "DevOps"
    if category == "Testing / QA":
        return "QA / Testing"
    return category if category in DISPLAY_CATEGORIES else "Soft Skills"


def _level(score: int) -> str:
    if score >= 75:
        return "STRONG"
    if score >= 60:
        return "GOOD"
    if score >= 40:
        return "PARTIAL"
    if score >= 15:
        return "WEAK"
    return "EMPTY"


def _evidence_quality(levels: list[str]) -> str:
    if not levels:
        return "INSUFFICIENT"
    value = sum(EVIDENCE_VALUE.get(level, 0.0) for level in levels) / len(levels)
    if value >= 0.82:
        return "EXCELLENT"
    if value >= 0.62:
        return "GOOD"
    if value >= 0.42:
        return "MEDIUM"
    if value > 0:
        return "LOW"
    return "INSUFFICIENT"


def _profile_type(category_scores: dict[str, int]) -> str:
    strong = {category for category, score in category_scores.items() if score >= 55}
    if {"Frontend", "Backend"} <= strong or ({"Frontend", "Database"} <= strong and category_scores.get("Backend", 0) >= 40):
        return "FULLSTACK"
    ordered = sorted(category_scores.items(), key=lambda item: item[1], reverse=True)
    if not ordered or ordered[0][1] < 25:
        return "UNKNOWN"
    top = ordered[0][0]
    return {
        "Frontend": "FRONTEND",
        "Backend": "BACKEND",
        "Mobile": "MOBILE",
        "Data / AI": "DATA_AI",
        "DevOps": "DEVOPS",
        "Cloud": "DEVOPS",
        "QA / Testing": "QA",
    }.get(top, "GENERALIST")


def build_career_signal_map(cv_analysis: dict, offer_analysis: dict, matching_result: dict, evidence_result: dict) -> dict:
    """Build category-level signals from detected skills, requirements, and proof quality."""
    evidence_map = _as_dict(evidence_result.get("skillEvidenceMap"))
    v3 = _as_dict(matching_result.get("v3"))
    rows = _as_list(v3.get("coverageMatrix"))
    detected = canonicalize_skill_list(
        _as_list(cv_analysis.get("detectedSkills")) or _as_list(cv_analysis.get("skills"))
    )
    offer_skills = canonicalize_skill_list(
        _as_list(offer_analysis.get("requiredSkills")) + _as_list(offer_analysis.get("optionalSkills"))
    )

    bucket: dict[str, dict[str, Any]] = {
        category: {"scores": [], "matched": [], "weak": [], "missing": [], "levels": [], "demanded": 0, "detected": 0}
        for category in DISPLAY_CATEGORIES
    }

    for skill in detected:
        category = _category_for(skill)
        item = _as_dict(evidence_map.get(skill))
        evidence_level = item.get("evidenceLevel", "WEAK")
        bucket[category]["detected"] += 1
        bucket[category]["levels"].append(evidence_level)
        if evidence_level in {"STRONG", "MEDIUM"}:
            bucket[category]["matched"].append(skill)
            bucket[category]["scores"].append(72 * EVIDENCE_VALUE.get(evidence_level, 0.35))
        elif evidence_level == "WEAK":
            bucket[category]["weak"].append(skill)
            bucket[category]["scores"].append(32)

    for row in rows:
        skill = str(row.get("requirement") or "")
        canonical = canonicalize_skill_list([skill])
        skill = canonical[0] if canonical else skill
        category = _category_for(skill)
        coverage = float(row.get("coverage") or 0)
        item = _as_dict(evidence_map.get(skill))
        evidence_level = item.get("evidenceLevel", "MISSING")
        evidence_score = EVIDENCE_VALUE.get(evidence_level, 0.0)
        demanded_score = round((coverage * 70) + (evidence_score * 30))
        bucket[category]["demanded"] += 1
        bucket[category]["levels"].append(evidence_level)
        bucket[category]["scores"].append(demanded_score)
        if coverage >= 0.75 and evidence_level in {"STRONG", "MEDIUM"}:
            bucket[category]["matched"].append(skill)
        elif coverage > 0:
            bucket[category]["weak"].append(skill)
        else:
            bucket[category]["missing"].append(skill)

    categories = []
    scores: dict[str, int] = {}
    for category in DISPLAY_CATEGORIES:
        data = bucket[category]
        if data["scores"]:
            score = max(0, min(100, round(sum(data["scores"]) / len(data["scores"]))))
        else:
            score = 0
        scores[category] = score
        level = _level(score)
        matched = deduplicate_strings(data["matched"])
        weak = deduplicate_strings(data["weak"])
        missing = deduplicate_strings(data["missing"])
        if matched:
            explanation = f"{category} contient des signaux exploitables sur {', '.join(matched[:3])}."
        elif missing and data["demanded"]:
            explanation = f"{category} est demande par l'offre mais les preuves restent absentes ou faibles."
        elif weak:
            explanation = f"{category} apparait dans le CV avec des preuves encore limitees."
        else:
            explanation = f"{category} n'est pas un signal majeur pour cette offre ou ce CV."
        categories.append(
            {
                "category": category,
                "score": score,
                "level": level,
                "matchedSkills": matched,
                "weakSkills": weak,
                "missingSkills": missing,
                "evidenceQuality": _evidence_quality(data["levels"]),
                "explanation": explanation,
            }
        )

    non_empty = {category: score for category, score in scores.items() if score > 0}
    dominant = [category for category, score in sorted(non_empty.items(), key=lambda item: item[1], reverse=True) if score >= 60][:3]
    weak_domains = [
        item["category"]
        for item in categories
        if (item["missingSkills"] or item["weakSkills"]) and item["score"] < 60
    ][:3]
    best = max(non_empty, key=non_empty.get) if non_empty else None
    demanded_categories = [item["category"] for item in categories if item["missingSkills"] or item["matchedSkills"] or item["weakSkills"]]
    lowest_candidates = {category: scores[category] for category in demanded_categories} or non_empty
    lowest = min(lowest_candidates, key=lowest_candidates.get) if lowest_candidates else None
    confidence = "HIGH" if sum(1 for item in categories if item["evidenceQuality"] in {"GOOD", "EXCELLENT"}) >= 2 else "MEDIUM" if non_empty else "LOW"

    return {
        "categories": categories,
        "globalSignals": {
            "dominantDomains": dominant,
            "weakDomains": deduplicate_strings(weak_domains),
            "bestEvidenceCategory": best,
            "lowestEvidenceCategory": lowest,
            "profileType": _profile_type(scores),
            "signalConfidence": confidence,
        },
    }
