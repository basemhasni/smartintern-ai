"""Explainable deterministic matching engine V2."""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from app.knowledge.skill_taxonomy import SKILLS_BY_NAME, get_related_skills
from app.services.skill_extraction_service import canonicalize_skill_list, categorize_skills
from app.utils.text_normalization import deduplicate_strings, normalize_text


REQUIRED_WEIGHT = 60.0
OPTIONAL_WEIGHT = 20.0
DOMAIN_WEIGHT = 10.0
EXPERIENCE_WEIGHT = 10.0
PARTIAL_FACTOR = 0.5


def _skill_weight(skill: str) -> float:
    definition = SKILLS_BY_NAME.get(skill)
    return definition.weight if definition else 1.0


def _related_candidate(required_skill: str, candidate_skills: list[str]) -> str | None:
    required_related = set(get_related_skills(required_skill))
    for candidate in candidate_skills:
        if candidate in required_related or required_skill in set(get_related_skills(candidate)):
            return candidate
    return None


def _match_skill_group(candidate_skills: list[str], offer_skills: list[str]) -> dict:
    candidate_set = set(candidate_skills)
    exact: list[str] = []
    partial: list[dict] = []
    missing: list[str] = []
    earned = 0.0
    possible = sum(_skill_weight(skill) for skill in offer_skills)

    for skill in offer_skills:
        weight = _skill_weight(skill)
        if skill in candidate_set:
            exact.append(skill)
            earned += weight
            continue
        related = _related_candidate(skill, candidate_skills)
        if related:
            partial.append({"requiredSkill": skill, "candidateSkill": related, "similarity": PARTIAL_FACTOR})
            earned += weight * PARTIAL_FACTOR
        else:
            missing.append(skill)

    ratio = earned / possible if possible else 1.0
    return {"exact": exact, "partial": partial, "missing": missing, "ratio": ratio}


def _domain_alignment(candidate_skills: list[str], required_skills: list[str]) -> tuple[float, dict[str, int]]:
    candidate_categories = categorize_skills(candidate_skills)
    required_categories = categorize_skills(required_skills)
    category_scores: dict[str, int] = {}
    weighted_scores: list[float] = []

    for category, required_values in required_categories.items():
        candidate_values = set(candidate_categories.get(category, []))
        exact_count = sum(1 for skill in required_values if skill in candidate_values)
        related_count = sum(
            1
            for skill in required_values
            if skill not in candidate_values and _related_candidate(skill, candidate_skills)
        )
        score = round(((exact_count + related_count * PARTIAL_FACTOR) / len(required_values)) * 100) if required_values else 100
        category_scores[category] = score
        weighted_scores.append(score)

    alignment = (sum(weighted_scores) / len(weighted_scores) / 100.0) if weighted_scores else 0.0
    return alignment, category_scores


def _experience_alignment(candidate_analysis: dict, offer_analysis: dict) -> tuple[float, bool]:
    candidate_level = candidate_analysis.get("experienceLevelV2") or candidate_analysis.get("experienceLevel")
    expected_level = offer_analysis.get("seniorityExpected")
    if not candidate_level or not expected_level or expected_level == "UNKNOWN":
        return 0.5, False
    levels = {"UNKNOWN": 0, "BEGINNER": 1, "JUNIOR": 2, "INTERMEDIATE": 3, "SENIOR": 4}
    candidate_value = levels.get(str(candidate_level).upper(), 0)
    expected_value = levels.get(str(expected_level).upper(), 0)
    if candidate_value >= expected_value:
        return 1.0, True
    if candidate_value == expected_value - 1:
        return 0.6, True
    return 0.2, True


def _confidence(candidate_skills: list[str], required_skills: list[str], candidate_analysis: dict, offer_analysis: dict) -> str:
    cv_quality = (candidate_analysis.get("rawTextQuality") or {}).get("quality")
    explicit_offer = bool(offer_analysis.get("criticalSkills") or required_skills)
    if len(candidate_skills) >= 4 and len(required_skills) >= 3 and cv_quality != "LOW" and explicit_offer:
        return "HIGH"
    if len(candidate_skills) >= 2 and len(required_skills) >= 2:
        return "MEDIUM"
    return "LOW"


def _decision_label(score: int, confidence: str, required_skills: list[str]) -> str:
    if not required_skills or confidence == "LOW" and score == 0:
        return "INSUFFICIENT_DATA"
    if score >= 80:
        return "STRONG_MATCH"
    if score >= 65:
        return "GOOD_MATCH"
    if score >= 40:
        return "PARTIAL_MATCH"
    return "LOW_MATCH"


def _explanation(score: int, confidence: str, required: list[str], required_result: dict, domain_score: float) -> str:
    covered = required_result["exact"]
    partial = required_result["partial"]
    missing = required_result["missing"]
    parts = [f"Le profil couvre directement {len(covered)} competence(s) requise(s) sur {len(required)}."]
    if covered:
        parts.append(f"Les correspondances principales sont {', '.join(covered[:5])}.")
    if partial:
        pairs = [f"{item['requiredSkill']} via {item['candidateSkill']}" for item in partial[:3]]
        parts.append(f"Des correspondances partielles ont ete reconnues : {', '.join(pairs)}.")
    if missing:
        parts.append(f"Le score est limite par l'absence de {', '.join(missing[:4])} parmi les exigences explicites.")
    if domain_score >= 0.65:
        parts.append("Le domaine technique du profil reste coherent avec celui de l'offre.")
    parts.append(f"Score final {score}/100 avec un niveau de confiance {confidence.lower()}.")
    return " ".join(parts)


def match_profile_to_offer(cv_analysis: dict[str, Any], offer_analysis: dict[str, Any]) -> dict:
    candidate_skills = canonicalize_skill_list(cv_analysis.get("detectedSkills") or cv_analysis.get("skills") or [])
    required_skills = canonicalize_skill_list(offer_analysis.get("requiredSkills") or offer_analysis.get("criticalSkills") or [])
    optional_skills = [
        skill
        for skill in canonicalize_skill_list(offer_analysis.get("optionalSkills") or offer_analysis.get("niceToHaveSkills") or [])
        if skill not in required_skills
    ]

    required_result = _match_skill_group(candidate_skills, required_skills)
    optional_result = _match_skill_group(candidate_skills, optional_skills)
    domain_alignment, category_scores = _domain_alignment(candidate_skills, required_skills)
    experience_alignment, has_experience_data = _experience_alignment(cv_analysis, offer_analysis)

    has_offer_requirements = bool(required_skills)
    required_score = REQUIRED_WEIGHT * required_result["ratio"] if has_offer_requirements else 0.0
    optional_score = (OPTIONAL_WEIGHT * optional_result["ratio"] if optional_skills else OPTIONAL_WEIGHT) if has_offer_requirements else 0.0
    domain_score = DOMAIN_WEIGHT * domain_alignment if has_offer_requirements else 0.0
    experience_score = EXPERIENCE_WEIGHT * experience_alignment if has_offer_requirements else 0.0
    total = round(max(0.0, min(100.0, required_score + optional_score + domain_score + experience_score)))
    confidence = _confidence(candidate_skills, required_skills, cv_analysis, offer_analysis)
    decision = _decision_label(total, confidence, required_skills)

    partial_matches = [
        {**item, "requirementType": "REQUIRED"}
        for item in required_result["partial"]
    ] + [
        {**item, "requirementType": "OPTIONAL"}
        for item in optional_result["partial"]
    ]
    used_candidate_skills = set(required_result["exact"] + optional_result["exact"])
    used_candidate_skills.update(item["candidateSkill"] for item in partial_matches)
    extra_skills = [skill for skill in candidate_skills if skill not in used_candidate_skills]
    strengths = [f"Competence requise couverte : {skill}." for skill in required_result["exact"][:5]]
    if domain_alignment >= 0.65:
        strengths.append("Le domaine technique principal est coherent avec l'offre.")
    risks = [f"Competence requise non detectee : {skill}." for skill in required_result["missing"][:5]]
    if confidence == "LOW":
        risks.append("Les donnees disponibles sont insuffisantes pour un score tres fiable.")
    recommendations = [f"Renforcer ou documenter {skill} avec un projet concret." for skill in required_result["missing"][:4]]

    return {
        "score": total,
        "confidence": confidence,
        "decisionLabel": decision,
        "matchedSkills": required_result["exact"],
        "missingSkills": required_result["missing"],
        "optionalMatchedSkills": optional_result["exact"],
        "partialMatchedSkills": partial_matches,
        "missingRequiredSkills": required_result["missing"],
        "missingOptionalSkills": [skill for skill in optional_skills if skill not in optional_result["exact"]],
        "extraCandidateSkills": extra_skills,
        "categoryScores": category_scores,
        "scoreBreakdown": {
            "requiredSkillsScore": round(required_score, 2),
            "optionalSkillsScore": round(optional_score, 2),
            "domainScore": round(domain_score, 2),
            "experienceScore": round(experience_score, 2),
            "total": total,
            "weights": {"required": 60, "optional": 20, "domain": 10, "experience": 10},
            "experienceDataAvailable": has_experience_data,
        },
        "explanation": _explanation(total, confidence, required_skills, required_result, domain_alignment),
        "strengths": deduplicate_strings(strengths),
        "risks": deduplicate_strings(risks),
        "recommendations": deduplicate_strings(recommendations),
    }


class MatchingEngineV2:
    def match(self, cv_analysis: dict[str, Any], offer_analysis: dict[str, Any]) -> dict:
        return match_profile_to_offer(cv_analysis, offer_analysis)
