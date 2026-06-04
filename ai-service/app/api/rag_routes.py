from fastapi import APIRouter, HTTPException

from app.models.schemas import RAGAnswerRequest, RAGChunkRequest, RAGEmbedRequest, RAGSearchDemoRequest
from app.rag.embedding_service import generate_simple_embedding
from app.rag.rag_answer_service import generate_rag_answer
from app.rag.text_chunking_service import chunk_text
from app.services.rag_service import retrieve_similar_documents

router = APIRouter(prefix="/ai/rag", tags=["RAG"])


@router.post("/embed")
def embed_endpoint(payload: RAGEmbedRequest):
    embedding = generate_simple_embedding(payload.text)

    return {
        "embedding": embedding,
        "dimension": len(embedding),
    }


@router.post("/chunk")
def chunk_endpoint(payload: RAGChunkRequest):
    chunks = chunk_text(payload.text, payload.chunkSize or 500)

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
        return generate_rag_answer(
            payload.question,
            [document.model_dump() for document in payload.documents],
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
