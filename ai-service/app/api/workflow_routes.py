from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.models.schemas import MatchingWorkflowRequest, MotivationLetterWorkflowRequest
from app.services.workflow_service import run_matching_workflow, run_motivation_letter_workflow

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


@router.post("/generate-letter")
def motivation_letter_workflow_endpoint(payload: MotivationLetterWorkflowRequest):
    try:
        return run_motivation_letter_workflow(payload)
    except ValueError as error:
        return JSONResponse(
            status_code=400,
            content={
                "message": str(error),
            },
        )
