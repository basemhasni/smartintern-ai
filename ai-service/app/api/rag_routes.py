from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    RAGAnswerRequest,
    RAGChunkRequest,
    RAGEmbedRequest,
    RAGSearchDemoRequest,
    RAGV2AnswerRequest,
    RAGV2DocumentRequest,
    RAGV2RetrieveRequest,
)
from app.rag.chunking_service_v2 import chunk_document
from app.rag.embedding_service_v2 import generate_embedding, generate_embeddings, get_embedding_backend, get_embedding_dimension
from app.rag.grounded_answer_service_v2 import generate_grounded_answer
from app.rag.hybrid_retrieval_service_v2 import hybrid_search
from app.services.rag_service import retrieve_similar_documents

router = APIRouter(prefix="/ai/rag", tags=["RAG"])


@router.post("/embed")
def embed_endpoint(payload: RAGEmbedRequest):
    embedding = generate_embedding(payload.text)

    return {
        "embedding": embedding,
        "dimension": len(embedding),
        "embeddingBackend": get_embedding_backend(),
        "warnings": [] if get_embedding_backend() == "sentence-transformers" else ["Local deterministic embedding fallback is active."],
    }


@router.post("/chunk")
def chunk_endpoint(payload: RAGChunkRequest):
    prepared = chunk_document(payload.text)
    chunks = [chunk["text"] for chunk in prepared["chunks"]]

    return {
        "chunks": chunks,
        "count": len(chunks),
    }


@router.post("/search-demo")
def search_demo_endpoint(payload: RAGSearchDemoRequest):
    if payload.topK <= 0:
        raise HTTPException(status_code=400, detail="topK must be positive")

    results = retrieve_similar_documents(
        payload.query,
        [document.model_dump() for document in payload.documents],
        payload.topK,
    )

    return {
        "results": results,
    }


@router.post("/answer")
def answer_endpoint(payload: RAGAnswerRequest):
    try:
        return generate_grounded_answer(
            payload.question,
            [{**document.model_dump(), "text": document.contentPreview} for document in payload.documents],
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.post("/v2/index-document")
def index_document_v2(payload: RAGV2DocumentRequest):
    prepared = chunk_document(payload.text, payload.documentType, payload.metadata)
    embeddings = generate_embeddings([chunk["text"] for chunk in prepared["chunks"]])
    return {
        **prepared,
        "embeddings": embeddings,
        "embeddingBackend": get_embedding_backend(),
        "dimension": get_embedding_dimension(),
        "warnings": [] if get_embedding_backend() == "sentence-transformers" else ["Local deterministic embedding fallback is active."],
    }


@router.post("/v2/embed")
def embed_v2(payload: RAGEmbedRequest):
    return embed_endpoint(payload)


@router.post("/v2/chunk")
def chunk_v2(payload: RAGV2DocumentRequest):
    return chunk_document(payload.text, payload.documentType, payload.metadata)


@router.post("/v2/retrieve")
def retrieve_v2(payload: RAGV2RetrieveRequest):
    return hybrid_search(payload.query, payload.documents, payload.filters, payload.options)


@router.post("/v2/answer")
def answer_v2(payload: RAGV2AnswerRequest):
    try:
        return generate_grounded_answer(payload.question, payload.contexts, payload.answerMode)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
