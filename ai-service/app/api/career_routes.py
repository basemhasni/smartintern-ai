from fastapi import APIRouter, HTTPException

from app.models.schemas import CareerAdviceRequest, CareerAdviceResponse
from app.services.career_advice_service import generate_career_advice

router = APIRouter(prefix="/ai", tags=["Career Assistant"])


@router.post("/career-advice", response_model=CareerAdviceResponse)
def career_advice_endpoint(payload: CareerAdviceRequest):
    try:
        return generate_career_advice(payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
