export type CareerReadinessLevel = 'READY' | 'ALMOST_READY' | 'NEEDS_TARGETED_WORK' | 'NEEDS_MAJOR_WORK' | 'INSUFFICIENT_DATA' | string;
export type CareerQuestionIntent = 'FULL_ANALYSIS' | 'SKILL_GAPS' | 'PROJECT_IDEAS' | 'CV_IMPROVEMENT' | 'INTERVIEW_PREP' | 'STRENGTHS' | 'LEARNING_PLAN' | 'READINESS' | 'SPECIFIC_SKILL' | 'CUSTOM_QUESTION' | string;

export type CareerPriority = { skill?: string | null; priority?: string | null; gapType?: string | null; reason?: string | null; impactOnMatching?: string | null; currentEvidence: string[]; suggestedActions: string[] };
export type LearningRoadmapStep = { period?: string | null; objective?: string | null; actions: string[]; targetSkills: string[]; expectedOutcome?: string | null };
export type CareerProject = { title?: string | null; skillsCovered: string[]; difficulty?: string | null; estimatedTime?: string | null; description?: string | null; deliverables: string[]; portfolioValue?: string | null };
export type InterviewPreparationTip = { topic?: string | null; tip?: string | null; basedOn?: string | null };
export type CareerRagSource = { title?: string | null; sourceType?: string | null; ownerType?: string | null; score?: number; snippet?: string | null };

export type CareerAdviceResult = {
  profileSummary?: string | null;
  matchingScore?: number;
  strengths: string[];
  finalAdvice?: string | null;
  readinessLevel?: CareerReadinessLevel | null;
  confidence?: string | null;
  decisionLabel?: string | null;
  questionIntent?: CareerQuestionIntent | null;
  answeredQuestion?: string | null;
  directAnswer?: string | null;
  priorityFocus: CareerPriority[];
  criticalGaps: CareerPriority[];
  learningRoadmap: LearningRoadmapStep[];
  cvImprovementTips: string[];
  recommendedProjects: CareerProject[];
  interviewPreparationTips: InterviewPreparationTip[];
  warnings: string[];
  ragWarnings: string[];
  sources: CareerRagSource[];
  ragContextUsed: boolean;
};

export type CareerAnswer = { id: string; question: string; answer?: string | null; intent?: CareerQuestionIntent | null; createdAt: string };
