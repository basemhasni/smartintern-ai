export type MatchConfidence = 'LOW' | 'MEDIUM' | 'HIGH' | string;

export type OfferMatch = {
  score?: number;
  decisionLabel?: string | null;
  confidence?: MatchConfidence | null;
  matchedSkills: string[];
  missingSkills: string[];
  optionalMatchedSkills: string[];
  explanation?: string | null;
  scoreBreakdown?: Record<string, number> | null;
  criticalMissingSkills: string[];
  warnings: string[];
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

const asNumberRecord = (value: unknown): Record<string, number> =>
  Object.fromEntries(
    Object.entries(asRecord(value)).filter(
      (entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1]),
    ),
  );

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
  const scoreBreakdown = asNumberRecord(match.scoreBreakdown);
  const v3ScoreBreakdown = asNumberRecord(v3.scoreBreakdown);
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
    scoreBreakdown: Object.keys(scoreBreakdown).length
      ? scoreBreakdown
      : Object.keys(v3ScoreBreakdown).length
        ? v3ScoreBreakdown
        : null,
    criticalMissingSkills: asStringArray(
      match.criticalMissingSkills ?? v3.criticalMissingSkills,
    ),
    warnings: asStringArray(match.warnings ?? v3.warnings ?? explainability.warnings),
    v3: Object.keys(v3).length ? v3 : null,
    explainability: Object.keys(explainability).length ? explainability : null,
    isAvailable,
  };
};
