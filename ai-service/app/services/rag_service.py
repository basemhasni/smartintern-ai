from app.rag.embedding_service import generate_simple_embedding
from app.rag.retrieval_service import search_similar_documents
from app.rag.text_chunking_service import chunk_text


def prepare_document_for_indexing(ownerType, ownerId, title, content, metadata=None) -> dict:
    return {
        "ownerType": ownerType,
        "ownerId": ownerId,
        "title": title,
        "content": content,
        "chunks": chunk_text(content),
        "embedding": generate_simple_embedding(content),
        "metadata": metadata or {},
    }


def generate_query_embedding(query: str) -> list[int]:
    return generate_simple_embedding(query)


def retrieve_similar_documents(query: str, documents: list[dict], top_k: int = 5) -> list[dict]:
    query_embedding = generate_query_embedding(query)
    prepared_documents = []

    for document in documents:
        content = document.get("content", "")
        prepared_documents.append(
            {
                **document,
                "embedding": document.get("embedding") or generate_simple_embedding(content),
            }
        )

    return search_similar_documents(query_embedding, prepared_documents, top_k)
