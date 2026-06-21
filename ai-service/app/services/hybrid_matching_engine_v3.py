"""Hybrid exact, fuzzy, semantic and evidence-aware matching engine V3."""

from __future__ import annotations

import importlib.util
import math
from difflib import SequenceMatcher
from typing import Any

from app.knowledge.skill_taxonomy import SKILLS_BY_NAME, get_related_skills
from app.services.evidence_extraction_service import TYPE_WEIGHTS, build_candidate_evidence_profile
from app.services.matching_explanation_service import generate_matching_explanation
from app.services.offer_analysis_v3 import analyze_offer_v3
from app.services.semantic_similarity_service import compute_requirement_evidence_similarity, get_similarity_backend
from app.services.skill_extraction_service import canonicalize_skill_list, categorize_skills
from app.utils.text_normalization import deduplicate_strings, normalize_text


SCORING_WEIGHTS = {
    "criticalSkills": 35.0,
    "requiredSkills": 30.0,
    "optionalSkills": 10.0,
    "evidenceQuality": 10.0,
    "domainAlignment": 8.0,
    "seniorityAlignment": 5.0,
    "cvQuality": 2.0,
}


def _fuzzy_ratio(value_a: str, value_b: str) -> float:
    normalized_a = normalize_text(value_a).replace(" ", "")
    normalized_b = normalize_text(value_b).replace(" ", "")
    if not normalized_a or not normalized_b:
        return 0.0
    if importlib.util.find_spec("rapidfuzz") is not None:
        try:
            from rapidfuzz.fuzz import ratio

            return ratio(normalized_a, normalized_b) / 100.0
        except Exception:
            pass
    return SequenceMatcher(None, normalized_a, normalized_b).ratio()


def _controlled_fuzzy_match(requirement: str, raw_candidate_skills: list[str]) -> tuple[str | None, float]:
    best_skill = None
    best_score = 0.0
    normalized_requirement = normalize_text(requirement).replace(" ", "")
    for skill in raw_candidate_skills:
        normalized_skill = normalize_text(skill).replace(" ", "")
        if min(len(normalized_requirement), len(normalized_skill)) < 4:
            continue
        if normalized_requirement[:2] != normalized_skill[:2]:
            continue
        score = _fuzzy_ratio(requirement, skill)
        if score >= 0.86 and score > best_score:
            best_skill, best_score = skill, score
    return best_skill, best_score


def _find_related(requirement: str, candidate_skills: list[str]) -> str | None:
    related = set(get_related_skills(requirement))
    for candidate in candidate_skills:
        if candidate in related or requirement in set(get_related_skills(candidate)):
            return candidate
    return None


def _skill_evidence(candidate_profile: dict, skill: str) -> list[dict]:
    return list((candidate_profile.get("evidenceProfile") or {}).get("skillEvidence", {}).get(skill, []))


def _best_evidence_quality(evidence: list[dict]) -> tuple[float, str]:
    if not evidence:
        return 0.0, "UNKNOWN"
    best = max(evidence, key=lambda item: item.get("confidence", 0))
    return float(best.get("confidence", TYPE_WEIGHTS.get(best.get("type"), 0.5))), best.get("type", "UNKNOWN")


def _raw_skill_match_type(requirement: str, raw_candidate_skills: list[str]) -> tuple[str | None, str | None]:
    canonical_requirement = canonicalize_skill_list([requirement])
    canonical_requirement = canonical_requirement[0] if canonical_requirement else requirement
    for raw_skill in raw_candidate_skills:
        if normalize_text(raw_skill) == normalize_text(canonical_requirement):
            return "EXACT", raw_skill
        canonical = canonicalize_skill_list([raw_skill])
        if canonical_requirement in canonical:
            return "ALIAS", raw_skill
    return None, None


def _coverage_row(requirement_item: dict, candidate_profile: dict, debug: bool) -> dict:
    requirement = requirement_item["label"]
    candidate_skills = candidate_profile["skills"]
    raw_skills = candidate_profile["rawSkills"]
    direct_type, raw_match = _raw_skill_match_type(requirement, raw_skills)
    evidence = _skill_evidence(candidate_profile, requirement)
    evidence_quality, evidence_type = _best_evidence_quality(evidence)
    match_type = "MISSING"
    coverage = 0.0
    confidence = 0.0
    reason = f"Aucune preuve fiable de {requirement} n'a ete detectee dans le profil."
    semantic_details = None

    if direct_type:
        match_type = direct_type
        base = 1.0 if direct_type == "EXACT" else 0.95
        coverage = base if evidence_quality >= 0.9 else max(0.82, base - 0.08)
        confidence = max(0.82, evidence_quality)
        proof = "avec une preuve de projet ou d'experience" if evidence_quality >= 0.9 else "dans les competences explicites du profil"
        reason = f"{requirement} est reconnu {proof}."
    else:
        fuzzy_skill, fuzzy_score = _controlled_fuzzy_match(requirement, raw_skills)
        if fuzzy_skill:
            match_type = "FUZZY"
            coverage = min(0.85, fuzzy_score * 0.9)
            confidence = fuzzy_score
            reason = f"La variante {fuzzy_skill} est tres proche de {requirement}, sans etre consideree comme une preuve exacte."
        else:
            evidence_texts = [item["text"] for item in candidate_profile.get("allEvidence", [])]
            semantic_details = compute_requirement_evidence_similarity(requirement, evidence_texts)
            semantic_score = semantic_details["score"]
            if semantic_score >= 0.75:
                match_type = "SEMANTIC"
                coverage = min(0.9, max(0.75, semantic_score))
                confidence = semantic_score
                reason = f"Une preuve textuelle est semantiquement proche de l'exigence {requirement}."
                if semantic_details.get("bestEvidence"):
                    evidence = [{"text": semantic_details["bestEvidence"], "type": "UNKNOWN", "confidence": semantic_score}]
                    evidence_type = "UNKNOWN"
            elif semantic_score >= 0.55:
                match_type = "SEMANTIC"
                coverage = min(0.7, max(0.45, semantic_score * 0.85))
                confidence = semantic_score
                reason = f"Un signal semantique partiel existe pour {requirement}, mais il reste insuffisant comme preuve de maitrise."
                if semantic_details.get("bestEvidence"):
                    evidence = [{"text": semantic_details["bestEvidence"], "type": "UNKNOWN", "confidence": semantic_score}]
                    evidence_type = "UNKNOWN"
            else:
                related = _find_related(requirement, candidate_skills)
                if related:
                    match_type = "RELATED"
                    coverage = 0.55
                    related_evidence = _skill_evidence(candidate_profile, related)
                    related_quality, related_type = _best_evidence_quality(related_evidence)
                    if related_evidence:
                        evidence = related_evidence
                        evidence_type = related_type
                    confidence = max(0.60, related_quality * 0.8)
                    reason = f"{related} est techniquement liee a {requirement} et dispose d'une preuve, mais ne prouve pas sa maitrise."

    row = {
        "requirement": requirement,
        "importance": requirement_item["importance"],
        "category": requirement_item.get("category", "Other"),
        "matchType": match_type,
        "coverage": round(coverage, 3),
        "confidence": round(confidence, 3),
        "evidence": [item["text"][:220] for item in evidence[: (4 if debug else 1)]],
        "evidenceType": evidence_type,
        "reason": reason,
    }
    if raw_match:
        row["matchedCandidateSkill"] = raw_match
    if debug and semantic_details:
        row["semanticMatches"] = semantic_details["allMatches"][:5]
    return row


def build_requirement_coverage_matrix(candidate_profile: dict, offer_requirements: dict, debug: bool = False) -> list[dict]:
    return [_coverage_row(item, candidate_profile, debug) for item in offer_requirements.get("requirementItems", [])]


def _average_coverage(rows: list[dict], default: float = 0.0) -> float:
    return sum(row["coverage"] for row in rows) / len(rows) if rows else default


def _domain_alignment(candidate_profile: dict, offer_analysis: dict) -> dict:
    candidate_domains = deduplicate_strings(candidate_profile.get("domainSignals") or [])
    offer_domain = offer_analysis.get("domain", "GENERAL")
    candidate_set = set(candidate_domains)
    if offer_domain in candidate_set:
        score = 1.0
    elif offer_domain == "FULLSTACK" and "FRONTEND" in candidate_set and "BACKEND" in candidate_set:
        score = 0.95
    elif offer_domain in ("WEB", "FULLSTACK") and candidate_set & {"WEB", "FRONTEND", "BACKEND"}:
        score = 0.72
    elif offer_domain == "GENERAL":
        score = 0.5
    else:
        score = 0.2 if candidate_domains else 0.0
    return {"candidateDomains": candidate_domains, "offerDomain": offer_domain, "score": round(score, 3)}


def _seniority_alignment(candidate_profile: dict, offer_analysis: dict) -> float:
    levels = {"UNKNOWN": 0, "BEGINNER": 1, "JUNIOR": 2, "INTERMEDIATE": 3, "SENIOR": 4}
    candidate = levels.get(str(candidate_profile.get("experienceLevelV2", "UNKNOWN")).upper(), 0)
    expected = levels.get(str(offer_analysis.get("seniorityExpected", "UNKNOWN")).upper(), 0)
    if not candidate or not expected:
        return 0.5
    if candidate >= expected:
        return 1.0
    if candidate == expected - 1:
        return 0.6
    return 0.2


def _confidence(candidate_profile: dict, offer_analysis: dict, matrix: list[dict]) -> str:
    cv_quality = (candidate_profile.get("rawTextQuality") or {}).get("quality", "LOW")
    offer_quality = (offer_analysis.get("offerQuality") or {}).get("quality", "LOW")
    strong_evidence = sum(1 for row in matrix if row["coverage"] >= 0.75 and row.get("evidence"))
    if cv_quality == "GOOD" and offer_quality == "GOOD" and strong_evidence >= 3:
        return "HIGH"
    if cv_quality != "LOW" and offer_quality != "LOW" and matrix:
        return "MEDIUM"
    return "LOW"


def calculate_hybrid_score(coverage_matrix: list[dict], candidate_profile: dict, offer_analysis: dict) -> dict:
    critical_rows = [row for row in coverage_matrix if row["importance"] == "CRITICAL"]
    required_rows = [row for row in coverage_matrix if row["importance"] in ("CRITICAL", "REQUIRED")]
    optional_rows = [row for row in coverage_matrix if row["importance"] == "OPTIONAL"]
    critical_ratio = _average_coverage(critical_rows, _average_coverage(required_rows))
    required_ratio = _average_coverage(required_rows)
    optional_ratio = _average_coverage(optional_rows, 1.0 if required_rows else 0.0)
    evidence_rows = [row for row in required_rows if row["coverage"] > 0]
    evidence_ratio = _average_coverage([
        {"coverage": max(TYPE_WEIGHTS.get(row.get("evidenceType"), 0.5), row["confidence"] * 0.8) if row.get("evidence") else 0.35}
        for row in evidence_rows
    ])
    domain = _domain_alignment(candidate_profile, offer_analysis)
    seniority = _seniority_alignment(candidate_profile, offer_analysis)
    cv_quality_name = (candidate_profile.get("rawTextQuality") or {}).get("quality", "LOW")
    cv_quality = {"GOOD": 1.0, "MEDIUM": 0.65, "LOW": 0.2}.get(cv_quality_name, 0.2)

    breakdown = {
        "criticalSkills": round(SCORING_WEIGHTS["criticalSkills"] * critical_ratio, 2),
        "requiredSkills": round(SCORING_WEIGHTS["requiredSkills"] * required_ratio, 2),
        "optionalSkills": round(SCORING_WEIGHTS["optionalSkills"] * optional_ratio, 2),
        "evidenceQuality": round(SCORING_WEIGHTS["evidenceQuality"] * evidence_ratio, 2),
        "domainAlignment": round(SCORING_WEIGHTS["domainAlignment"] * domain["score"], 2),
        "seniorityAlignment": round(SCORING_WEIGHTS["seniorityAlignment"] * seniority, 2),
        "cvQuality": round(SCORING_WEIGHTS["cvQuality"] * cv_quality, 2),
    }
    raw_score = math.floor(sum(breakdown.values()))
    score = raw_score
    warnings: list[str] = []
    critical_missing = [row["requirement"] for row in critical_rows if row["coverage"] < 0.75]
    missing_required = [row for row in required_rows if row["coverage"] < 0.45]
    covered_required = [row for row in required_rows if row["coverage"] >= 0.45]

    if critical_missing and score > 72:
        score = 72
        warnings.append("une competence critique manque, plafond applique a 72")
    if required_rows and len(missing_required) / len(required_rows) > 0.5 and score > 55:
        score = 55
        warnings.append("plus de la moitie des competences requises manquent, plafond applique a 55")
    if required_rows and not covered_required and score > 35:
        score = 35
        warnings.append("aucune competence requise n'est couverte, plafond applique a 35")
    if cv_quality_name == "LOW" and score > 60:
        score = 60
        warnings.append("CV pauvre ou texte insuffisant, plafond applique a 60")
    optional_missing = [row for row in optional_rows if row["coverage"] < 0.75]
    if score > 90 and (cv_quality_name != "GOOD" or optional_missing):
        score = 90
        warnings.append("score superieur a 90 reserve aux profils riches avec couverture optionnelle presque complete")
    if score > 98 and not (critical_ratio >= 0.98 and required_ratio >= 0.98 and evidence_ratio >= 0.9 and cv_quality_name == "GOOD"):
        score = 98
        warnings.append("score superieur a 98 reserve aux profils presque totalement prouves")
    if not required_rows:
        score = 0
        warnings.append("offre sans exigence exploitable")

    breakdown["rawTotal"] = raw_score
    breakdown["total"] = score
    return {
        "score": max(0, min(100, score)),
        "scoreBreakdown": breakdown,
        "criticalMissingSkills": critical_missing,
        "warnings": warnings,
        "domainAlignment": domain,
        "evidenceQualityRatio": round(evidence_ratio, 3),
    }


def _decision_label(score: int, has_requirements: bool, has_candidate_data: bool) -> str:
    if not has_requirements or not has_candidate_data:
        return "INSUFFICIENT_DATA"
    if score >= 85:
        return "STRONG_MATCH"
    if score >= 70:
        return "GOOD_MATCH"
    if score >= 50:
        return "PARTIAL_MATCH"
    if score >= 30:
        return "LOW_MATCH"
    return "VERY_LOW_MATCH"


def _build_candidate_profile(cv_analysis: dict, raw_cv_text: str | None, raw_candidate_skills: list[str]) -> dict:
    profile = dict(cv_analysis or {})
    canonical_skills = canonicalize_skill_list(profile.get("detectedSkills") or profile.get("skills") or raw_candidate_skills)
    profile["skills"] = canonical_skills
    profile["detectedSkills"] = canonical_skills
    profile["rawSkills"] = list(raw_candidate_skills)
    evidence_profile = profile.get("evidenceProfile") or build_candidate_evidence_profile(profile, raw_cv_text)
    profile["evidenceProfile"] = evidence_profile
    profile["allEvidence"] = [item for item in evidence_profile.get("evidenceSentences", []) if not item.get("negated")] or [
        item for values in evidence_profile.get("skillEvidence", {}).values() for item in values
    ]
    profile.setdefault("domainSignals", _domains_from_skills(canonical_skills))
    profile.setdefault("rawTextQuality", _fallback_cv_quality(raw_cv_text, canonical_skills))
    profile.setdefault("experienceLevelV2", "UNKNOWN")
    return profile


def _domains_from_skills(skills: list[str]) -> list[str]:
    categories = categorize_skills(skills)
    mapping = {"Frontend": "FRONTEND", "Backend": "BACKEND", "Database": "BACKEND", "DevOps / Cloud": "DEVOPS", "Data / AI": "AI", "Mobile": "MOBILE", "Testing / QA": "QA"}
    return deduplicate_strings([mapping[category] for category, values in categories.items() if values and category in mapping])


def _fallback_cv_quality(raw_text: str | None, skills: list[str]) -> dict:
    length = len(raw_text or "")
    if length >= 600:
        quality = "GOOD"
    elif length >= 160 or len(skills) >= 4:
        quality = "MEDIUM"
    else:
        quality = "LOW"
    return {"quality": quality, "length": length, "hasEnoughText": quality != "LOW"}


class HybridMatchingEngineV3:
    def match(
        self,
        candidate_skills: list[str],
        required_skills: list[str],
        optional_skills: list[str] | None = None,
        candidate_analysis: dict | None = None,
        offer_analysis: dict | None = None,
        candidate_text: str | None = None,
        offer_text: str | None = None,
        debug: bool = False,
    ) -> dict[str, Any]:
        raw_candidate_skills = [skill.strip() for skill in candidate_skills if isinstance(skill, str) and skill.strip()]
        candidate_profile = _build_candidate_profile(candidate_analysis or {}, candidate_text, raw_candidate_skills)
        offer_data = dict(offer_analysis or {})
        title = offer_data.get("title") or "Internship offer"
        description = offer_text or offer_data.get("description") or "Internship requirements"
        offer_requirements = analyze_offer_v3(title, description, required_skills, optional_skills)
        offer_requirements.update({key: value for key, value in offer_data.items() if value not in (None, [], {})})
        if not offer_requirements.get("requirementItems"):
            offer_requirements = analyze_offer_v3(title, description, required_skills, optional_skills)

        matrix = build_requirement_coverage_matrix(candidate_profile, offer_requirements, debug)
        scoring = calculate_hybrid_score(matrix, candidate_profile, offer_requirements)
        confidence = _confidence(candidate_profile, offer_requirements, matrix)
        required_rows = [row for row in matrix if row["importance"] in ("CRITICAL", "REQUIRED")]
        optional_rows = [row for row in matrix if row["importance"] == "OPTIONAL"]
        strong_types = {"EXACT", "ALIAS", "FUZZY", "SEMANTIC"}
        matched = [row["requirement"] for row in required_rows if row["coverage"] >= 0.75 and row["matchType"] in strong_types]
        missing = [row["requirement"] for row in required_rows if row["coverage"] < 0.75]
        optional_matched = [row["requirement"] for row in optional_rows if row["coverage"] >= 0.75 and row["matchType"] in strong_types]
        partial = [row for row in matrix if 0 < row["coverage"] < 0.75]
        used_skills = set(matched + optional_matched)
        used_skills.update(row.get("matchedCandidateSkill") for row in matrix if row.get("matchedCandidateSkill"))
        extras = [skill for skill in candidate_profile["skills"] if skill not in used_skills]
        evidence_summary = {
            "strongEvidenceCount": sum(1 for row in matrix if row["coverage"] >= 0.75 and row.get("evidence")),
            "weakEvidenceCount": sum(1 for row in matrix if 0 < row["coverage"] < 0.75),
            "missingEvidenceCount": sum(1 for row in matrix if not row.get("evidence")),
        }
        explanation = generate_matching_explanation(scoring["score"], confidence, matrix, scoring["domainAlignment"], scoring["warnings"])
        decision = _decision_label(scoring["score"], bool(required_rows), bool(candidate_profile["skills"] or candidate_profile["allEvidence"]))
        strengths = [f"{row['requirement']} est couverte avec une preuve {row['evidenceType'].lower()}." for row in required_rows if row["coverage"] >= 0.75][:6]
        risks = [f"Competence critique manquante : {skill}." for skill in scoring["criticalMissingSkills"]]
        risks.extend(f"Preuve insuffisante pour {row['requirement']}." for row in partial[:4])
        recommendations = [f"Ajouter une preuve de projet ou d'experience pour {skill}." for skill in missing[:5]]

        public_matrix = matrix if debug else [{**row, "evidence": row["evidence"][:1]} for row in matrix]
        v3 = {
            "scoringMethod": "HYBRID_SEMANTIC_V3",
            "scoreBreakdown": scoring["scoreBreakdown"],
            "coverageMatrix": public_matrix,
            "criticalMissingSkills": scoring["criticalMissingSkills"],
            "missingRequiredSkills": missing,
            "missingOptionalSkills": [row["requirement"] for row in optional_rows if row["coverage"] < 0.75],
            "partialMatchedSkills": [{"skill": row["requirement"], "matchType": row["matchType"], "coverage": row["coverage"], "reason": row["reason"]} for row in partial],
            "extraCandidateSkills": extras,
            "domainAlignment": scoring["domainAlignment"],
            "evidenceSummary": evidence_summary,
            "semanticMethod": get_similarity_backend(),
        }
        if debug:
            v3["warnings"] = scoring["warnings"]
            v3["candidateEvidenceProfile"] = candidate_profile["evidenceProfile"]

        return {
            "score": scoring["score"],
            "confidence": confidence,
            "decisionLabel": decision,
            "matchedSkills": deduplicate_strings(matched),
            "missingSkills": deduplicate_strings(missing),
            "optionalMatchedSkills": deduplicate_strings(optional_matched),
            "explanation": explanation,
            "partialMatchedSkills": v3["partialMatchedSkills"],
            "missingRequiredSkills": v3["missingRequiredSkills"],
            "missingOptionalSkills": v3["missingOptionalSkills"],
            "extraCandidateSkills": extras,
            "categoryScores": _category_scores(matrix),
            "scoreBreakdown": scoring["scoreBreakdown"],
            "strengths": deduplicate_strings(strengths),
            "risks": deduplicate_strings(risks),
            "recommendations": deduplicate_strings(recommendations),
            "v3": v3,
        }


def _category_scores(matrix: list[dict]) -> dict[str, int]:
    categories: dict[str, list[float]] = {}
    for row in matrix:
        categories.setdefault(row["category"], []).append(row["coverage"])
    return {category: round(sum(values) / len(values) * 100) for category, values in categories.items()}
