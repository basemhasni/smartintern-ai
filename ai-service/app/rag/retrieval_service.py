from math import sqrt


def cosine_similarity(vector_a: list[float], vector_b: list[float]) -> float:
    if not vector_a or not vector_b or len(vector_a) != len(vector_b):
        return 0.0

    dot_product = sum(a * b for a, b in zip(vector_a, vector_b))
    norm_a = sqrt(sum(a * a for a in vector_a))
    norm_b = sqrt(sum(b * b for b in vector_b))

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot_product / (norm_a * norm_b)


def search_similar_documents(query_embedding: list[float], documents: list[dict], top_k: int = 5) -> list[dict]:
    scored_documents = []

    for document in documents:
        document_embedding = document.get("embedding")
        if not document_embedding:
            continue

        score = cosine_similarity(query_embedding, document_embedding)
        scored_documents.append(
            {
                "id": document.get("id"),
                "title": document.get("title"),
                "score": round(score, 4),
            }
        )

    return sorted(scored_documents, key=lambda item: item["score"], reverse=True)[:top_k]
