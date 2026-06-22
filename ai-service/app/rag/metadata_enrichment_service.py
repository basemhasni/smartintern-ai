"""Metadata extraction shared by RAG indexing and retrieval."""

from __future__ import annotations

from app.services.skill_extraction_service import extract_skills_from_text
from app.utils.text_normalization import deduplicate_strings, normalize_text


DOMAIN_SKILLS = {
    "FRONTEND": {"React", "Angular", "Vue", "JavaScript", "TypeScript", "HTML", "CSS"},
    "BACKEND": {"Node.js", "Express.js", "Java", "Spring Boot", "FastAPI", "Django", "Laravel"},
    "DATA_AI": {"Machine Learning", "NLP", "RAG", "LangChain", "LangGraph", "Pandas", "NumPy"},
    "DEVOPS": {"Docker", "Kubernetes", "CI/CD", "AWS", "Azure", "Jenkins", "Linux"},
    "MOBILE": {"Flutter", "Dart", "React Native", "Android", "iOS"},
    "QA": {"Selenium", "Cypress", "Playwright", "Postman", "Unit Testing", "Integration Testing"},
}


def detect_language(text: str) -> str:
    normalized = normalize_text(text)
    french = sum(token in normalized.split() for token in ("le", "la", "les", "une", "avec", "competences"))
    english = sum(token in normalized.split() for token in ("the", "and", "with", "skills", "experience"))
    return "fr" if french >= english else "en"


def detect_domain(skills: list[str]) -> str:
    skill_set = set(skills)
    scores = {domain: len(skill_set & values) for domain, values in DOMAIN_SKILLS.items()}
    best = max(scores, key=scores.get) if scores else "GENERAL"
    return best if scores.get(best, 0) else "GENERAL"


def enrich_metadata(text: str, document_type: str, metadata: dict | None = None) -> dict:
    base = dict(metadata or {})
    extraction = extract_skills_from_text(text or "")
    extracted = extraction.get("skills", []) if isinstance(extraction, dict) else extraction
    supplied = base.get("skills") if isinstance(base.get("skills"), list) else []
    skills = deduplicate_strings([*supplied, *extracted])
    return {
        **base,
        "documentType": document_type,
        "sourceType": base.get("sourceType") or document_type,
        "language": base.get("language") or detect_language(text),
        "skills": skills,
        "domain": base.get("domain") or detect_domain(skills),
        "tags": deduplicate_strings(base.get("tags") or []),
        "accessScope": base.get("accessScope") or "PRIVATE",
    }
