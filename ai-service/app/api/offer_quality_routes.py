from fastapi import APIRouter, HTTPException

from app.models.schemas import OfferQualityRequest, OfferQualityResponse
from app.services.offer_quality_analyzer_service import analyze_offer_quality


router = APIRouter(prefix="/ai", tags=["Offer Quality"])


@router.post("/analyze-offer-quality", response_model=OfferQualityResponse)
def analyze_offer_quality_endpoint(payload: OfferQualityRequest):
    try:
        return analyze_offer_quality(payload.model_dump())
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
