from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    OrchestratorRequest,
    OrchestratorResponse,
    OrchestratorV2Request,
    OrchestratorV2Response,
)
from app.orchestration.orchestrator_v2 import orchestrate_v2
from app.services.orchestrator_service import orchestrate

router = APIRouter(prefix="/ai", tags=["Agent Orchestrator"])


@router.post("/orchestrate", response_model=OrchestratorResponse)
def orchestrate_endpoint(payload: OrchestratorRequest):
    try:
        return orchestrate(payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.post("/orchestrate/v2", response_model=OrchestratorV2Response)
def orchestrate_v2_endpoint(payload: OrchestratorV2Request):
    try:
        return orchestrate_v2(payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
