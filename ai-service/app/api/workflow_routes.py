from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.models.schemas import MatchingWorkflowRequest
from app.services.workflow_service import run_matching_workflow

router = APIRouter(prefix="/ai/workflows", tags=["LangGraph Workflows"])


@router.post("/match")
def match_workflow_endpoint(payload: MatchingWorkflowRequest):
    try:
        return run_matching_workflow(payload)
    except ValueError as error:
        return JSONResponse(
            status_code=400,
            content={
                "message": str(error),
            },
        )
