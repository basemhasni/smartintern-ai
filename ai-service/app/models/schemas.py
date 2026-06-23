from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class CVAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1)


class CVAnalysisResponse(BaseModel):
    skills: List[str]
    experienceLevel: str
    summary: str
    detectedSkills: List[str] = []
    skillsByCategory: Dict[str, List[str]] = {}
    detectedMentions: List[Dict[str, Any]] = []
    inferredRelatedSkills: List[Dict[str, Any]] = []
    technicalSkills: List[str] = []
    softSkills: List[str] = []
    educationLevel: str = "UNKNOWN"
    experienceLevelV2: str = "UNKNOWN"
    projectSignals: List[str] = []
    domainSignals: List[str] = []
    languages: List[str] = []
    tools: List[str] = []
    rawTextQuality: Dict[str, Any] = {}
    evidenceProfile: Dict[str, Any] = {}


class OfferAnalysisRequest(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    requiredSkills: Optional[List[str]] = []
    optionalSkills: Optional[List[str]] = []


class OfferAnalysisResponse(BaseModel):
    title: str
    description: Optional[str] = None
    requiredSkills: List[str]
    optionalSkills: List[str]
    domain: str
    summary: str
    skillsByCategory: Dict[str, List[str]] = {}
    responsibilities: List[str] = []
    seniorityExpected: str = "UNKNOWN"
    keywords: List[str] = []
    criticalSkills: List[str] = []
    niceToHaveSkills: List[str] = []
    requirementItems: List[Dict[str, Any]] = []
    offerQuality: Dict[str, Any] = {}


class MatchingRequest(BaseModel):
    candidateSkills: List[str]
    requiredSkills: List[str]
    optionalSkills: Optional[List[str]] = []
    candidateAnalysis: Optional[Dict[str, Any]] = None
    offerAnalysis: Optional[Dict[str, Any]] = None
    candidateText: Optional[str] = None
    offerText: Optional[str] = None
    debug: bool = False


class MatchingResponse(BaseModel):
    score: int
    matchedSkills: List[str]
    missingSkills: List[str]
    optionalMatchedSkills: List[str]
    explanation: str
    confidence: str = "LOW"
    decisionLabel: str = "INSUFFICIENT_DATA"
    partialMatchedSkills: List[Dict[str, Any]] = []
    missingRequiredSkills: List[str] = []
    missingOptionalSkills: List[str] = []
    extraCandidateSkills: List[str] = []
    categoryScores: Dict[str, int] = {}
    scoreBreakdown: Dict[str, Any] = {}
    strengths: List[str] = []
    risks: List[str] = []
    recommendations: List[str] = []
    v3: Dict[str, Any] = {}


class MatchingWorkflowRequest(BaseModel):
    candidateSkills: List[str]
    requiredSkills: List[str]
    optionalSkills: Optional[List[str]] = []
    candidateAnalysis: Optional[Dict[str, Any]] = None
    offerAnalysis: Optional[Dict[str, Any]] = None
    candidateText: Optional[str] = None
    offerText: Optional[str] = None
    debug: bool = False


class LetterStudent(BaseModel):
    firstName: str
    lastName: str
    educationLevel: Optional[str] = None
    targetJob: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None


class LetterOffer(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    duration: Optional[str] = None
    requiredSkills: Optional[List[str]] = []
    optionalSkills: Optional[List[str]] = []


class LetterCompany(BaseModel):
    companyName: Optional[str] = None
    sector: Optional[str] = None


class LetterMatching(BaseModel):
    score: Optional[int] = None
    matchedSkills: Optional[List[str]] = []
    missingSkills: Optional[List[str]] = []
    optionalMatchedSkills: Optional[List[str]] = []
    explanation: Optional[str] = None
    confidence: Optional[str] = "LOW"
    decisionLabel: Optional[str] = "INSUFFICIENT_DATA"
    v3: Dict[str, Any] = {}


class MotivationLetterRequest(BaseModel):
    student: LetterStudent
    candidateSkills: List[str] = []
    offer: LetterOffer
    company: LetterCompany
    matching: Optional[LetterMatching] = None
    tone: str = "PROFESSIONAL"
    cvAnalysis: Dict[str, Any] = {}
    offerAnalysis: Dict[str, Any] = {}
    matchingResult: Dict[str, Any] = {}
    careerAdvice: Dict[str, Any] = {}
    applicationMessage: Optional[str] = None
    ragContextDocuments: List[Dict[str, Any]] = []


class MotivationLetterWorkflowRequest(MotivationLetterRequest):
    pass


class MotivationLetterResponse(BaseModel):
    content: str
    letter: Optional[str] = None
    generatedLetter: Optional[str] = None
    tone: str = "PROFESSIONAL"
    generatedAt: Optional[str] = None
    v2: Dict[str, Any] = {}


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
    optionalMatchedSkills: List[str] = []
    explanation: Optional[str] = None
    confidence: str = "LOW"
    decisionLabel: str = "INSUFFICIENT_DATA"
    strengths: List[str] = []
    risks: List[str] = []
    recommendations: List[str] = []
    v3: Dict[str, Any] = {}


class CareerAdviceRequest(BaseModel):
    student: CareerStudent
    candidateSkills: List[str] = []
    offer: CareerOffer
    matching: CareerMatching
    question: Optional[str] = None
    ragContextDocuments: List[Dict[str, Any]] = []


class SkillImprovement(BaseModel):
    skill: str
    priority: str
    reason: str
    actions: List[str]
    gapType: Optional[str] = None
    impactOnMatching: Optional[str] = None
    currentEvidence: List[str] = []


class ActionPlanItem(BaseModel):
    period: str
    objective: str
    actions: List[str] = []
    targetSkills: List[str] = []
    expectedOutcome: Optional[str] = None


class CareerAdviceResponse(BaseModel):
    profileSummary: str
    matchingScore: int
    strengths: List[str]
    skillsToImprove: List[SkillImprovement]
    actionPlan: List[ActionPlanItem]
    finalAdvice: str
    ragInsights: List[str] = []
    v2: Dict[str, Any] = {}


class OrchestratorRequest(BaseModel):
    intent: Optional[str] = None
    payload: Dict[str, Any] = {}


class OrchestratorResponse(BaseModel):
    intent: str
    agent: str
    result: Dict[str, Any]


class OrchestratorV2Request(BaseModel):
    intent: Optional[str] = None
    question: Optional[str] = None
    studentProfile: Dict[str, Any] = {}
    cvText: Optional[str] = None
    cvAnalysis: Dict[str, Any] = {}
    offer: Dict[str, Any] = {}
    offerAnalysis: Dict[str, Any] = {}
    matchingResult: Dict[str, Any] = {}
    careerAdvice: Dict[str, Any] = {}
    tone: str = "PROFESSIONAL"
    ragContextDocuments: List[Dict[str, Any]] = []
    contexts: List[Dict[str, Any]] = []
    applicationMessage: Optional[str] = None
    options: Dict[str, Any] = {}


class OrchestratorV2Response(BaseModel):
    intent: str
    status: str
    summary: str
    steps: List[Dict[str, Any]]
    results: Dict[str, Any]
    qualityControl: Dict[str, Any]
    recommendations: List[str] = []
    warnings: List[str] = []
    debug: Optional[Dict[str, Any]] = None


class RAGEmbedRequest(BaseModel):
    text: str = Field(..., min_length=1)


class RAGChunkRequest(BaseModel):
    text: str = Field(..., min_length=1)
    chunkSize: Optional[int] = 500


class RAGDemoDocument(BaseModel):
    id: Any
    title: Optional[str] = None
    content: str
    embedding: Optional[List[float]] = None


class RAGSearchDemoRequest(BaseModel):
    query: str = Field(..., min_length=1)
    documents: List[RAGDemoDocument]
    topK: int = 5


class RAGAnswerDocument(BaseModel):
    id: Any
    ownerType: Optional[str] = None
    ownerId: Optional[Any] = None
    title: Optional[str] = None
    contentPreview: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}
    score: Optional[float] = None


class RAGAnswerRequest(BaseModel):
    question: str = Field(..., min_length=1)
    documents: List[RAGAnswerDocument] = []


class RAGUsedDocument(BaseModel):
    id: Any
    title: Optional[str] = None
    score: Optional[float] = None


class RAGAnswerResponse(BaseModel):
    answer: str
    usedDocuments: List[RAGUsedDocument]


class RAGV2DocumentRequest(BaseModel):
    text: str = Field(..., min_length=1)
    documentType: str = "DOCUMENT"
    metadata: Dict[str, Any] = {}


class RAGV2RetrieveRequest(BaseModel):
    query: str = Field(..., min_length=1)
    documents: List[Dict[str, Any]] = []
    filters: Dict[str, Any] = {}
    options: Dict[str, Any] = {}


class RAGV2AnswerRequest(BaseModel):
    question: str = Field(..., min_length=1)
    contexts: List[Dict[str, Any]] = []
    answerMode: str = "GENERAL"

