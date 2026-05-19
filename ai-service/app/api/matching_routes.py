from fastapi import APIRouter, HTTPException

from app.models.schemas import MatchingRequest, MatchingResponse
from app.services.matching_service import match_candidate

router = APIRouter(prefix="/ai", tags=["Matching"])


@router.post("/match", response_model=MatchingResponse)
def match_endpoint(payload: MatchingRequest):
    try:
        return match_candidate(payload.candidateSkills, payload.requiredSkills, payload.optionalSkills)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

