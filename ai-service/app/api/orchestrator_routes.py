from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.models.schemas import OrchestratorRequest, OrchestratorResponse
from app.services.orchestrator_service import orchestrate

router = APIRouter(prefix="/ai", tags=["Agent Orchestrator"])


@router.post("/orchestrate", response_model=OrchestratorResponse)
def orchestrate_endpoint(payload: OrchestratorRequest):
    try:
        return orchestrate(payload)
    except ValueError as error:
        return JSONResponse(
            status_code=400,
            content={
                "message": str(error),
            },
        )
