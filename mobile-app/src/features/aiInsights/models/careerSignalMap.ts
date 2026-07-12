export type CareerSignalCategory = {
  category: string;
  score?: number;
  level?: string | null;
  evidenceQuality?: string | null;
  matchedSkills: string[];
  weakSkills: string[];
  missingSkills: string[];
  explanation?: string | null;
};

export type CareerGlobalSignals = {
  dominantDomains: string[];
  weakDomains: string[];
  bestEvidenceCategory?: string | null;
  lowestEvidenceCategory?: string | null;
  profileType?: string | null;
  signalConfidence?: string | null;
};

export type CareerSignalMap = {
  categories: CareerSignalCategory[];
  globalSignals: CareerGlobalSignals;
};
