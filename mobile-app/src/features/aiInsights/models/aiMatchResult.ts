import type { CareerSignalMap } from './careerSignalMap';
import type { DecisionTraceItem } from './decisionTrace';
import type { ScoreBreakdown } from './scoreBreakdown';
import type { SkillEvidence } from './skillEvidence';

export type AiMatchResult = {
  score?: number;
  confidence?: string | null;
  decisionLabel?: string | null;
  explanation?: string | null;
  matchedSkills: string[];
  missingSkills: string[];
  optionalMatchedSkills: string[];
  criticalMissingSkills: string[];
  warnings: string[];
  scoreBreakdown: ScoreBreakdown;
  skillEvidence: SkillEvidence[];
  careerSignalMap: CareerSignalMap;
  decisionTrace: DecisionTraceItem[];
  qualityChecks: Record<string, boolean>;
  matchingMethod?: string | null;
  isAvailable: boolean;
};
