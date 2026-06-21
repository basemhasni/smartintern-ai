"""Extract short, attributable evidence snippets from CV text."""

from __future__ import annotations

import re

from app.services.skill_extraction_service import canonicalize_skill_list, extract_skills_from_text
from app.utils.text_normalization import deduplicate_strings, normalize_text


TYPE_WEIGHTS = {
    "PROJECT": 1.0,
    "EXPERIENCE": 0.95,
    "EDUCATION": 0.75,
    "SKILL_LIST": 0.65,
    "SUMMARY": 0.6,
    "UNKNOWN": 0.5,
}


def _split_sentences(text: str) -> list[str]:
    if not isinstance(text, str):
        return []
    fragments = re.split(r"(?<=[.!?])\s+|\n+|\s+[|]\s+", text)
    return deduplicate_strings([fragment.strip(" -•\t")[:280] for fragment in fragments if len(fragment.strip()) >= 12])


def _evidence_type(sentence: str) -> str:
    normalized = normalize_text(sentence)
    if any(marker in normalized for marker in ("projet", "project", "realise", "developpe", "concu", "built")):
        return "PROJECT"
    if any(marker in normalized for marker in ("experience", "emploi", "poste", "alternance", "worked", "responsable")):
        return "EXPERIENCE"
    if any(marker in normalized for marker in ("formation", "universite", "licence", "master", "education", "cours")):
        return "EDUCATION"
    if any(marker in normalized for marker in ("competences", "skills", "technologies", "outils", "stack")):
        return "SKILL_LIST"
    if any(marker in normalized for marker in ("profil", "resume", "summary", "objectif")):
        return "SUMMARY"
    return "UNKNOWN"


def _contains_negation(sentence: str) -> bool:
    normalized = normalize_text(sentence)
    return any(pattern in normalized for pattern in (
        "pas encore", "n ai pas", "ne dispose pas", "ne connais pas",
        "aucune experience", "sans experience", "not used",
        "have not used", "no experience", "never used",
    ))


def extract_evidence_sentences(cv_text: str) -> list[dict]:
    return [
        {"text": sentence, "type": _evidence_type(sentence), "confidence": TYPE_WEIGHTS[_evidence_type(sentence)], "negated": _contains_negation(sentence)}
        for sentence in _split_sentences(cv_text)
    ][:40]


def extract_project_evidence(cv_text: str) -> list[dict]:
    return [item for item in extract_evidence_sentences(cv_text) if item["type"] == "PROJECT"]


def extract_experience_evidence(cv_text: str) -> list[dict]:
    return [item for item in extract_evidence_sentences(cv_text) if item["type"] == "EXPERIENCE"]


def extract_skill_evidence(cv_text: str, skills: list[str]) -> dict[str, list[dict]]:
    target_skills = canonicalize_skill_list(skills)
    evidence_by_skill = {skill: [] for skill in target_skills}
    for item in extract_evidence_sentences(cv_text):
        if item.get("negated"):
            continue
        sentence_skills = set(extract_skills_from_text(item["text"]))
        for skill in target_skills:
            if skill in sentence_skills:
                evidence_by_skill[skill].append(item)
    return {skill: values[:4] for skill, values in evidence_by_skill.items() if values}


def build_candidate_evidence_profile(cv_analysis: dict, raw_cv_text: str | None = None) -> dict:
    text = raw_cv_text or cv_analysis.get("rawText") or ""
    skills = canonicalize_skill_list(cv_analysis.get("detectedSkills") or cv_analysis.get("skills") or [])
    sentences = extract_evidence_sentences(text)
    skill_evidence = extract_skill_evidence(text, skills) if text else {}

    if not text:
        for mention in cv_analysis.get("detectedMentions") or []:
            skill = mention.get("skill")
            contexts = mention.get("contexts") or []
            if skill and contexts:
                skill_evidence[skill] = [
                    {"text": context[:280], "type": "SKILL_LIST", "confidence": 0.65}
                    for context in contexts[:3]
                ]

    return {
        "evidenceSentences": sentences,
        "projectEvidence": [item for item in sentences if item["type"] == "PROJECT"],
        "experienceEvidence": [item for item in sentences if item["type"] == "EXPERIENCE"],
        "skillEvidence": skill_evidence,
        "evidenceQuality": _evidence_quality(skill_evidence, sentences),
    }


def _evidence_quality(skill_evidence: dict[str, list[dict]], sentences: list[dict]) -> dict:
    evidence = [item for values in skill_evidence.values() for item in values]
    strong = sum(1 for item in evidence if item.get("confidence", 0) >= 0.9)
    medium = sum(1 for item in evidence if 0.65 <= item.get("confidence", 0) < 0.9)
    score = min(1.0, (strong * 1.0 + medium * 0.65 + len(sentences) * 0.04) / 5.0)
    return {"score": round(score, 3), "strongEvidenceCount": strong, "mediumEvidenceCount": medium}
