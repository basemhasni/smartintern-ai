import logging
import re
import time
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api import (
    career_routes,
    cv_routes,
    health_routes,
    letter_routes,
    matching_routes,
    offer_routes,
    offer_quality_routes,
    orchestrator_routes,
    rag_routes,
    skill_gap_routes,
    workflow_routes,
)
from app.core.config import settings

logger = logging.getLogger("smartintern.ai-service")
REQUEST_ID_PATTERN = re.compile(r"^[a-zA-Z0-9._:-]{8,128}$")

app = FastAPI(
    title=settings.app_name,
    version="3.0.0",
)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    provided_request_id = request.headers.get("x-request-id", "").strip()
    request_id = provided_request_id if REQUEST_ID_PATTERN.fullmatch(provided_request_id) else str(uuid4())
    request.state.request_id = request_id
    started_at = time.perf_counter()

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    logger.info(
        "ai-request requestId=%s method=%s path=%s status=%s durationMs=%s",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        round((time.perf_counter() - started_at) * 1000),
    )
    return response

if settings.allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(health_routes.router)
app.include_router(cv_routes.router)
app.include_router(offer_routes.router)
app.include_router(offer_quality_routes.router)
app.include_router(matching_routes.router)
app.include_router(letter_routes.router)
app.include_router(career_routes.router)
app.include_router(orchestrator_routes.router)
app.include_router(workflow_routes.router)
app.include_router(rag_routes.router)
app.include_router(skill_gap_routes.router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc):
    validation_errors = [
        {
            "location": [str(part) for part in error.get("loc", [])],
            "message": error.get("msg", "Invalid value"),
            "type": error.get("type", "validation_error"),
        }
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=400,
        content={
            "detail": "Invalid request payload.",
            "error": {
                "code": "AI_VALIDATION_ERROR",
                "message": "Invalid request payload.",
                **({"fields": validation_errors} if not settings.is_production else {}),
            },
            "requestId": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    code = "AI_VALIDATION_ERROR" if exc.status_code in {400, 422} else "AI_REQUEST_ERROR"
    message = str(exc.detail) if exc.status_code in {400, 422} else "AI request failed."
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": message,
            "error": {
                "code": code,
                "message": message,
            },
            "requestId": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", None)
    logger.exception(
        "ai-unhandled-error requestId=%s path=%s exception=%s",
        request_id,
        request.url.path,
        type(exc).__name__,
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal AI service error.",
            "error": {
                "code": "AI_INTERNAL_ERROR",
                "message": "Internal AI service error.",
            },
            "requestId": request_id,
        },
    )
