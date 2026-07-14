export type MotivationLetterTone = 'PROFESSIONAL' | 'DYNAMIC' | 'SIMPLE';

export type LetterEvidence = {
  skill?: string | null;
  level?: string | null;
  type?: string | null;
  text?: string | null;
};

export type LetterQualityCheck = {
  code: string;
  label: string;
  passed: boolean;
  detail?: string | null;
};

export type MotivationLetterV2 = {
  generationMethod?: string | null;
  language?: string | null;
  usedEvidence: LetterEvidence[];
  usedSkills: string[];
  avoidedClaims: string[];
  missingSkillsHandled: string[];
  qualityChecks: LetterQualityCheck[];
  personalizationScore?: number | null;
  warnings: string[];
  ragContextUsed?: boolean | null;
  generatedAt?: string | null;
};

export type MotivationLetterOffer = {
  id: string;
  title: string;
  location?: string | null;
  status?: string | null;
  company: {
    id?: string | null;
    companyName: string;
    sector?: string | null;
  };
};

export type MotivationLetter = {
  id: string;
  applicationId: string;
  studentId?: string | null;
  offerId?: string | null;
  tone: MotivationLetterTone;
  content: string;
  generatedByAI: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  offer?: MotivationLetterOffer | null;
  applicationStatus?: string | null;
  v2?: MotivationLetterV2 | null;
};

