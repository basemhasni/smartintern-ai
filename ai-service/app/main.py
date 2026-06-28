from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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

app = FastAPI(
    title=settings.app_name,
    version="3.0.0",
)

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
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={
            "detail": exc.errors() if not settings.is_production else "Invalid request payload.",
        },
    )
