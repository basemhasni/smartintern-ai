from typing import Any, Dict, List, Optional

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


class LetterStudent(BaseModel):
    firstName: str
    lastName: str
    educationLevel: Optional[str] = None
    targetJob: Optional[str] = None
    bio: Optional[str] = None


class LetterOffer(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    duration: Optional[str] = None
    requiredSkills: Optional[List[str]] = []


class LetterCompany(BaseModel):
    companyName: str
    sector: Optional[str] = None


class LetterMatching(BaseModel):
    score: Optional[int] = None
    matchedSkills: Optional[List[str]] = []
    missingSkills: Optional[List[str]] = []


class MotivationLetterRequest(BaseModel):
    student: LetterStudent
    candidateSkills: List[str] = []
    offer: LetterOffer
    company: LetterCompany
    matching: Optional[LetterMatching] = None
    tone: str = "PROFESSIONAL"


class MotivationLetterResponse(BaseModel):
    content: str


class CareerStudent(BaseModel):
    firstName: str
    lastName: str
    educationLevel: Optional[str] = None
    targetJob: Optional[str] = None
    bio: Optional[str] = None


class CareerOffer(BaseModel):
    id: str
    title: str
    description: str
    requiredSkills: List[str]
    optionalSkills: Optional[List[str]] = []
    companyName: str


class CareerMatching(BaseModel):
    score: int
    matchedSkills: List[str]
    missingSkills: List[str]


class CareerAdviceRequest(BaseModel):
    student: CareerStudent
    candidateSkills: List[str] = []
    offer: CareerOffer
    matching: CareerMatching
    question: Optional[str] = None


class SkillImprovement(BaseModel):
    skill: str
    priority: str
    reason: str
    actions: List[str]


class ActionPlanItem(BaseModel):
    period: str
    objective: str


class CareerAdviceResponse(BaseModel):
    profileSummary: str
    matchingScore: int
    strengths: List[str]
    skillsToImprove: List[SkillImprovement]
    actionPlan: List[ActionPlanItem]
    finalAdvice: str


class OrchestratorRequest(BaseModel):
    intent: Optional[str] = None
    payload: Dict[str, Any] = {}


class OrchestratorResponse(BaseModel):
    intent: str
    agent: str
    result: Dict[str, Any]

