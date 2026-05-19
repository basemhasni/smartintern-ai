from fastapi import APIRouter, HTTPException

from app.models.schemas import CVAnalysisRequest, CVAnalysisResponse
from app.services.cv_analysis_service import analyze_cv

router = APIRouter(prefix="/ai", tags=["CV Analysis"])


@router.post("/analyze-cv", response_model=CVAnalysisResponse)
def analyze_cv_endpoint(payload: CVAnalysisRequest):
    try:
        return analyze_cv(payload.text)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

