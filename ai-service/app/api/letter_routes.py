from fastapi import APIRouter, HTTPException

from app.models.schemas import MotivationLetterRequest, MotivationLetterResponse
from app.services.motivation_letter_service import generate_motivation_letter

router = APIRouter(prefix="/ai", tags=["Motivation Letter"])


@router.post("/generate-letter", response_model=MotivationLetterResponse)
def generate_letter_endpoint(payload: MotivationLetterRequest):
    try:
        return generate_motivation_letter(payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
