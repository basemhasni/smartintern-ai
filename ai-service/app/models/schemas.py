from typing import List, Optional

from pydantic import BaseModel, Field


class CVAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1)


class CVAnalysisResponse(BaseModel):
    skills: List[str]
    experienceLevel: str
    summary: str


class OfferAnalysisRequest(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)


class OfferAnalysisResponse(BaseModel):
    requiredSkills: List[str]
    optionalSkills: List[str]
    domain: str
    summary: str


class MatchingRequest(BaseModel):
    candidateSkills: List[str]
    requiredSkills: List[str]
    optionalSkills: Optional[List[str]] = []


class MatchingResponse(BaseModel):
    score: int
    matchedSkills: List[str]
    missingSkills: List[str]
    optionalMatchedSkills: List[str]
    explanation: str

