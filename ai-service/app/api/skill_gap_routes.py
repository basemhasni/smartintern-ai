from fastapi import APIRouter, HTTPException

from app.models.schemas import SkillGapSimulationRequest, SkillGapSimulationResponse
from app.services.skill_gap_simulator_service import simulate_skill_gap_impact


router = APIRouter(prefix="/ai", tags=["Skill Gap Simulator"])


@router.post("/skill-gap-simulator", response_model=SkillGapSimulationResponse)
def simulate_skill_gap(payload: SkillGapSimulationRequest):
    try:
        return simulate_skill_gap_impact(payload.matchingResult, payload.selectedSkills, payload.options)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
