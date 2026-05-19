from fastapi import APIRouter, HTTPException

from app.models.schemas import OfferAnalysisRequest, OfferAnalysisResponse
from app.services.offer_analysis_service import analyze_offer

router = APIRouter(prefix="/ai", tags=["Offer Analysis"])


@router.post("/analyze-offer", response_model=OfferAnalysisResponse)
def analyze_offer_endpoint(payload: OfferAnalysisRequest):
    try:
        return analyze_offer(payload.title, payload.description)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

