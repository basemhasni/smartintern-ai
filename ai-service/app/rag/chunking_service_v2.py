"""Section-aware chunking that preserves sentence boundaries and metadata."""

from __future__ import annotations

import re

from app.rag.metadata_enrichment_service import enrich_metadata

SECTION_ALIASES = {
    "summary": ("resume", "profil", "summary", "objectif"),
    "skills": ("competences", "skills", "technologies", "outils"),
    "experience": ("experiences", "experience professionnelle", "employment"),
    "projects": ("projets", "projects", "realisations"),
    "education": ("formation", "education", "diplomes"),
    "languages": ("langues", "languages"),
    "missions": ("missions", "responsabilites", "responsibilities"),
    "required_skills": ("competences requises", "profil recherche", "requirements"),
    "optional_skills": ("competences optionnelles", "atouts", "nice to have"),
}


def _clean(text: str) -> str:
    return re.sub(r"[ \t]+", " ", (text or "").replace("\r", "")).strip()


def _section_name(line: str) -> str | None:
    normalized = re.sub(r"[^a-z ]", "", line.lower()).strip()
    for name, aliases in SECTION_ALIASES.items():
        if any(normalized == alias or normalized.startswith(f"{alias} ") for alias in aliases):
            return name
    return None


def split_by_sections(text: str) -> list[dict]:
    sections = []
    current = {"section": "content", "text": ""}
    for raw_line in (text or "").split("\n"):
        line = _clean(raw_line)
        if not line:
            continue
        heading_text, separator, remainder = line.partition(":")
        heading = _section_name(heading_text if separator else line) if len(heading_text if separator else line) <= 80 else None
        if heading:
            if current["text"]:
                sections.append(current)
            current = {"section": heading, "text": remainder.strip() if separator else ""}
        else:
            current["text"] = f"{current['text']} {line}".strip()
    if current["text"]:
        sections.append(current)
    return sections or ([{"section": "content", "text": _clean(text)}] if _clean(text) else [])


def split_by_sentences(text: str) -> list[str]:
    return [part.strip() for part in re.split(r"(?<=[.!?])\s+|\n+", _clean(text)) if part.strip()]


def _build_sized_chunks(text: str, target_size: int = 700) -> list[str]:
    chunks, current = [], ""
    for sentence in split_by_sentences(text):
        if len(sentence) > target_size:
            words = sentence.split()
            for word in words:
                candidate = f"{current} {word}".strip()
                if len(candidate) > target_size and current:
                    chunks.append(current)
                    current = word
                else:
                    current = candidate
            continue
        candidate = f"{current} {sentence}".strip()
        if len(candidate) > target_size and current:
            chunks.append(current)
            current = sentence
        else:
            current = candidate
    if current:
        chunks.append(current)
    return chunks


def merge_small_chunks(chunks: list[str], minimum: int = 180, maximum: int = 900) -> list[str]:
    merged = []
    for chunk in chunks:
        if merged and len(chunk) < minimum and len(merged[-1]) + len(chunk) + 1 <= maximum:
            merged[-1] = f"{merged[-1]} {chunk}"
        else:
            merged.append(chunk)
    return merged


def add_overlap(chunks: list[str], overlap: int = 100) -> list[str]:
    if overlap <= 0:
        return chunks
    output = []
    for index, chunk in enumerate(chunks):
        if index == 0:
            output.append(chunk)
            continue
        previous_words = chunks[index - 1][-overlap:].split()
        prefix = " ".join(previous_words[1:] if len(previous_words) > 1 else previous_words)
        output.append(f"{prefix} {chunk}".strip())
    return output


def enrich_chunk_metadata(chunk: dict, metadata: dict) -> dict:
    enriched = enrich_metadata(chunk["text"], metadata.get("documentType", "DOCUMENT"), metadata)
    return {**enriched, "section": chunk["section"], "chunkIndex": chunk["chunkIndex"]}


def chunk_document(text: str, document_type: str = "DOCUMENT", metadata: dict | None = None) -> dict:
    base_metadata = {**(metadata or {}), "documentType": document_type}
    chunks = []
    for section in split_by_sections(text):
        sized = add_overlap(merge_small_chunks(_build_sized_chunks(section["text"])))
        for content in sized:
            if len(content) < 60 and not enrich_metadata(content, document_type, {}).get("skills"):
                continue
            chunks.append({"text": content, "section": section["section"]})
    output = []
    for index, chunk in enumerate(chunks):
        item = {**chunk, "chunkIndex": index, "tokenEstimate": max(1, len(chunk["text"].split()) * 4 // 3)}
        item["metadata"] = enrich_chunk_metadata(item, base_metadata)
        output.append(item)
    return {"chunks": output, "count": len(output)}
