"""Evidence quality checks for explainable matching."""

from __future__ import annotations

from typing import Any

from app.services.evidence_extraction_service import TYPE_WEIGHTS, build_candidate_evidence_profile
from app.services.skill_extraction_service import canonicalize_skill_list
from app.utils.text_normalization import deduplicate_strings, normalize_text


CONCRETE_TYPES = {"PROJECT", "EXPERIENCE"}
USEFUL_TYPES = {"PROJECT", "EXPERIENCE", "EDUCATION", "SKILL_LIST", "SUMMARY", "RAG_CONTEXT"}
WEAK_MARKERS = (
    "connaissance",
    "notion",
    "notions",
    "en cours",
    "apprentissage",
    "debutant",
    "mentionne",
    "initiation",
    "bases",
)


def _as_dict(value: Any) -> dict:
    return value if isinstance(value, dict) else {}


def _as_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def _short_snippet(text: str, limit: int = 220) -> str:
    cleaned = " ".join(str(text or "").split())
    if len(cleaned) <= limit:
        return cleaned
    return cleaned[: limit - 3].rstrip() + "..."


def _skill_key(skill: str) -> str:
    canonical = canonicalize_skill_list([skill])
    return canonical[0] if canonical else str(skill or "").strip()


def _coverage_row_for(skill: str, matching_context: dict) -> dict:
    key = normalize_text(_skill_key(skill))
    for row in _as_list(_as_dict(matching_context).get("coverageMatrix")):
        if normalize_text(str(row.get("requirement") or "")) == key:
            return row
    return {}


def _evidence_profile(cv_analysis: dict, cv_text: str | None) -> dict:
    profile = _as_dict(cv_analysis).get("evidenceProfile")
    if isinstance(profile, dict):
        return profile
    return build_candidate_evidence_profile(_as_dict(cv_analysis), cv_text)


def extract_evidence_snippets(skill: str, cv_text: str | None, cv_analysis: dict) -> list[str]:
    """Return short snippets where a skill is actually supported."""
    profile = _evidence_profile(cv_analysis, cv_text)
    skill_evidence = _as_dict(profile.get("skillEvidence"))
    canonical = _skill_key(skill)
    evidence = _as_list(skill_evidence.get(canonical))
    snippets = [_short_snippet(item.get("text", "")) for item in evidence if isinstance(item, dict) and item.get("text")]
    return deduplicate_strings([snippet for snippet in snippets if snippet])[:3]


def classify_evidence_level(evidence_items: list[dict], match_type: str | None = None, coverage: float = 0.0) -> str:
    """Classify evidence independently from the final matching score."""
    items = [item for item in evidence_items if isinstance(item, dict) and item.get("text")]
    match = str(match_type or "").upper()
    if match == "MISSING" or not items:
        return "MISSING"
    if match == "RELATED":
        return "WEAK"

    best = max(items, key=lambda item: float(item.get("confidence") or TYPE_WEIGHTS.get(item.get("type"), 0.5)))
    evidence_type = str(best.get("type") or "UNKNOWN").upper()
    confidence = float(best.get("confidence") or TYPE_WEIGHTS.get(evidence_type, 0.5))
    text = normalize_text(str(best.get("text") or ""))
    is_weak_wording = any(marker in text for marker in WEAK_MARKERS)

    if is_weak_wording:
        return "WEAK"
    if match in {"SEMANTIC", "FUZZY"} and coverage < 0.85:
        return "MEDIUM" if confidence >= 0.75 else "WEAK"
    if evidence_type in CONCRETE_TYPES and confidence >= 0.78 and coverage >= 0.75:
        return "STRONG"
    if evidence_type in USEFUL_TYPES and confidence >= 0.58:
        return "MEDIUM"
    return "WEAK"


def _recommendation(skill: str, level: str, row: dict) -> str:
    if level == "STRONG":
        return f"Conserver cette preuve pour {skill} et preciser le role joue si le CV le permet."
    if level == "MEDIUM":
        return f"Renforcer {skill} avec un exemple de projet, une responsabilite ou un resultat concret."
    if level == "WEAK":
        return f"Ajouter une preuve plus concrete pour {skill}, par exemple un mini-projet ou une realisation mesurable."
    importance = str(row.get("importance") or "").upper()
    if importance in {"CRITICAL", "REQUIRED"}:
        return f"{skill} est demande pour cette offre; prevoir apprentissage cible ou projet pratique avant de le revendiquer."
    return f"{skill} n'est pas prouve dans le CV; ne pas le revendiquer sans experience reelle."


def evaluate_skill_evidence(skill: str, cv_text: str | None, cv_analysis: dict, matching_context: dict | None = None) -> dict:
    """Evaluate whether a skill is proved, merely mentioned, weak, or absent."""
    canonical = _skill_key(skill)
    profile = _evidence_profile(cv_analysis, cv_text)
    skill_evidence = _as_dict(profile.get("skillEvidence"))
    row = _coverage_row_for(canonical, matching_context or {})
    row_evidence = _as_list(row.get("evidence"))
    cv_evidence = _as_list(skill_evidence.get(canonical))
    raw_evidence_items = row_evidence or cv_evidence
    row_type = str(row.get("evidenceType") or "UNKNOWN").upper()
    row_confidence = float(row.get("confidence") or 0.5)
    evidence_items = [
        item if isinstance(item, dict) else {"text": str(item), "type": row_type, "confidence": row_confidence}
        for item in raw_evidence_items
        if item
    ]

    match_type = str(row.get("matchType") or ("EXACT" if evidence_items else "MISSING")).upper()
    coverage = float(row.get("coverage") or (1.0 if evidence_items else 0.0))
    level = classify_evidence_level(evidence_items, match_type, coverage)
    best = max(evidence_items, key=lambda item: float(item.get("confidence") or 0), default={})
    evidence_type = "NONE" if level == "MISSING" else str(best.get("type") or row.get("evidenceType") or "UNKNOWN").upper()
    confidence = 0.0 if level == "MISSING" else min(0.99, max(float(best.get("confidence") or row.get("confidence") or 0.5), coverage * 0.9))
    snippets = deduplicate_strings(
        [_short_snippet(item.get("text", "")) for item in evidence_items if isinstance(item, dict) and item.get("text")]
    )[:3]

    if level == "STRONG":
        reason = f"{canonical} est relie a une preuve concrete du CV."
    elif level == "MEDIUM":
        reason = f"{canonical} est present dans le CV, mais la preuve gagnerait a etre plus contextualisee."
    elif level == "WEAK":
        reason = f"{canonical} est seulement mentionne ou detecte de maniere partielle."
    else:
        reason = f"Aucune preuve exploitable de {canonical} n'a ete detectee."

    return {
        "skill": canonical,
        "evidenceLevel": level,
        "confidence": round(confidence, 2),
        "evidenceType": evidence_type,
        "evidenceSnippets": snippets,
        "reason": reason,
        "recommendation": _recommendation(canonical, level, row),
    }


def evaluate_all_skills_evidence(skills: list[str], cv_text: str | None, cv_analysis: dict, matching_context: dict | None = None) -> dict:
    canonical_skills = deduplicate_strings(canonicalize_skill_list(skills))
    evidence_map = {
        skill: evaluate_skill_evidence(skill, cv_text, cv_analysis, matching_context or {})
        for skill in canonical_skills
    }
    return {"skillEvidenceMap": evidence_map, "evidenceSummary": build_evidence_summary(evidence_map)}


def build_evidence_summary(evidence_map: dict[str, dict]) -> dict:
    counts = {"strong": 0, "medium": 0, "weak": 0, "missing": 0}
    for item in evidence_map.values():
        level = str(_as_dict(item).get("evidenceLevel") or "MISSING").lower()
        if level in counts:
            counts[level] += 1
    total = sum(counts.values())
    if not total:
        quality = "INSUFFICIENT"
    else:
        proven_ratio = (counts["strong"] * 1.0 + counts["medium"] * 0.65 + counts["weak"] * 0.25) / total
        if proven_ratio >= 0.82:
            quality = "EXCELLENT"
        elif proven_ratio >= 0.62:
            quality = "GOOD"
        elif proven_ratio >= 0.42:
            quality = "MEDIUM"
        elif proven_ratio > 0:
            quality = "LOW"
        else:
            quality = "INSUFFICIENT"
    return {**counts, "overallEvidenceQuality": quality}
