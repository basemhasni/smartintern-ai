from typing import Any


def _as_list(value: Any) -> list:
    if isinstance(value, list):
        return [item for item in value if isinstance(item, str) and item.strip()]
    return []


def _collect_document_skills(document: dict) -> list[str]:
    metadata = document.get("metadata") or {}
    skills = []

    for field in ("skills", "requiredSkills", "optionalSkills", "matchedSkills"):
        skills.extend(_as_list(metadata.get(field)))

    seen = set()
    unique_skills = []

    for skill in skills:
        key = skill.lower()
        if key not in seen:
            seen.add(key)
            unique_skills.append(skill)

    return unique_skills


def _format_document_line(document: dict) -> str:
    title = document.get("title") or "Document indexe"
    owner_type = document.get("ownerType") or "DOCUMENT"
    score = document.get("score")
    score_text = f" avec un score de similarite de {score}" if score is not None else ""

    return f"- {title} ({owner_type}){score_text}."


def generate_rag_answer(question: str, context_documents: list[dict]) -> dict:
    if not isinstance(question, str) or not question.strip():
        raise ValueError("question is required")

    if not context_documents:
        return {
            "answer": (
                "Je n'ai pas trouve de document suffisamment pertinent dans les documents indexes. "
                "Cette reponse est basee uniquement sur la base RAG disponible actuellement ; vous pouvez "
                "indexer plus de CV ou d'offres, puis relancer la recherche."
            ),
            "usedDocuments": [],
        }

    selected_documents = context_documents[:3]
    document_lines = [_format_document_line(document) for document in selected_documents]
    skills = []

    for document in selected_documents:
        skills.extend(_collect_document_skills(document))

    unique_skills = []
    seen_skills = set()

    for skill in skills:
        key = skill.lower()
        if key not in seen_skills:
            seen_skills.add(key)
            unique_skills.append(skill)

    if unique_skills:
        skill_sentence = (
            "Les elements techniques explicitement presents dans ces documents sont : "
            f"{', '.join(unique_skills)}."
        )
    else:
        skill_sentence = (
            "Les documents retrouves ne contiennent pas assez de competences structurees pour tirer "
            "une conclusion technique precise."
        )

    answer = "\n".join(
        [
            "J'ai trouve plusieurs elements pertinents dans les documents indexes.",
            "",
            "Documents les plus pertinents :",
            *document_lines,
            "",
            skill_sentence,
            (
                "Cette reponse reste prudente : elle est basee sur les documents indexes et doit etre "
                "verifiee avec les details complets du CV, de l'offre ou de l'entreprise. Elle ne garantit "
                "pas l'obtention d'un stage."
            ),
        ]
    )

    used_documents = [
        {
            "id": document.get("id"),
            "title": document.get("title"),
            "score": document.get("score"),
        }
        for document in selected_documents
    ]

    return {
        "answer": answer,
        "usedDocuments": used_documents,
    }
