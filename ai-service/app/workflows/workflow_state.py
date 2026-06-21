from typing import Optional, TypedDict


class MatchingWorkflowState(TypedDict):
    candidateSkills: list[str]
    requiredSkills: list[str]
    optionalSkills: list[str]
    candidateAnalysis: dict
    offerAnalysis: dict
    candidateText: Optional[str]
    offerText: Optional[str]
    debug: bool
    preparedCandidateProfile: Optional[dict]
    preparedOfferRequirements: Optional[dict]
    evidenceProfile: Optional[dict]
    coverageMatrix: Optional[list[dict]]
    hybridScore: Optional[dict]
    qualityChecks: Optional[dict]
    result: Optional[dict]
    error: Optional[str]


class MotivationLetterWorkflowState(TypedDict):
    student: dict
    candidateSkills: list[str]
    offer: dict
    company: dict
    matching: dict
    tone: str
    preparedStudentProfile: Optional[dict]
    preparedOfferContext: Optional[dict]
    missingSkills: list[str]
    generatedLetter: Optional[str]
    qualityChecks: Optional[dict]
    result: Optional[dict]
    error: Optional[str]
