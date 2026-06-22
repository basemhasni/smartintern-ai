from app.rag.chunking_service_v2 import chunk_document
from app.rag.embedding_service_v2 import generate_embedding, generate_embeddings
from app.rag.hybrid_retrieval_service_v2 import hybrid_search


def prepare_document_for_indexing(ownerType, ownerId, title, content, metadata=None) -> dict:
    prepared = chunk_document(content, ownerType, {**(metadata or {}), "ownerType": ownerType, "ownerId": ownerId, "title": title})
    chunk_texts = [chunk["text"] for chunk in prepared["chunks"]]
    return {
        "ownerType": ownerType,
        "ownerId": ownerId,
        "title": title,
        "content": content,
        "chunks": prepared["chunks"],
        "embeddings": generate_embeddings(chunk_texts),
        "embedding": generate_embedding(content),
        "metadata": metadata or {},
    }


def generate_query_embedding(query: str) -> list[float]:
    return generate_embedding(query)


def retrieve_similar_documents(query: str, documents: list[dict], top_k: int = 5) -> list[dict]:
    return hybrid_search(query, documents, options={"topK": top_k})["results"]
