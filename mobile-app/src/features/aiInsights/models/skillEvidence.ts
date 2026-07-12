export type EvidenceLevel = 'STRONG' | 'MEDIUM' | 'WEAK' | 'MISSING' | 'UNKNOWN';

export type SkillEvidence = {
  skill: string;
  evidenceLevel: EvidenceLevel;
  evidenceType?: string | null;
  evidenceSnippets: string[];
  confidence?: number;
  reason?: string | null;
  recommendation?: string | null;
};
