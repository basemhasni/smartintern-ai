export type MatchConfidence = 'LOW' | 'MEDIUM' | 'HIGH' | string;

export type OfferMatch = {
  score?: number;
  decisionLabel?: string | null;
  confidence?: MatchConfidence | null;
  matchedSkills: string[];
  missingSkills: string[];
  optionalMatchedSkills: string[];
  explanation?: string | null;
  scoreBreakdown?: Record<string, unknown> | null;
  v3?: Record<string, unknown> | null;
  explainability?: Record<string, unknown> | null;
  isAvailable: boolean;
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? value as UnknownRecord : {};

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : [];

const asOptionalString = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value : null;

export const normalizeOfferMatch = (value: unknown): OfferMatch => {
  const match = asRecord(value);
  const v3 = asRecord(match.v3);
  const explainability = asRecord(match.explainability);
  const matchedSkills = asStringArray(match.matchedSkills);
  const missingSkills = asStringArray(match.missingSkills);
  const optionalMatchedSkills = asStringArray(match.optionalMatchedSkills);
  const rawScore = typeof match.score === 'number' && Number.isFinite(match.score)
    ? Math.max(0, Math.min(100, Math.round(match.score)))
    : undefined;
  const decisionLabel = asOptionalString(match.decisionLabel);
  const confidence = asOptionalString(match.confidence);
  const hasMatchingEvidence = Boolean(
    decisionLabel || confidence || matchedSkills.length || missingSkills.length,
  );
  const isAvailable = rawScore !== undefined && (rawScore > 0 || hasMatchingEvidence);

  return {
    score: isAvailable ? rawScore : undefined,
    decisionLabel,
    confidence,
    matchedSkills,
    missingSkills,
    optionalMatchedSkills,
    explanation: asOptionalString(match.explanation),
    scoreBreakdown: Object.keys(asRecord(match.scoreBreakdown)).length
      ? asRecord(match.scoreBreakdown)
      : Object.keys(asRecord(v3.scoreBreakdown)).length
        ? asRecord(v3.scoreBreakdown)
        : null,
    v3: Object.keys(v3).length ? v3 : null,
    explainability: Object.keys(explainability).length ? explainability : null,
    isAvailable,
  };
};
