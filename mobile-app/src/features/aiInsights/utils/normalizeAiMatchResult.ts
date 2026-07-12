import type { AiMatchResult } from '../models/aiMatchResult';
import type { CareerSignalCategory, CareerSignalMap } from '../models/careerSignalMap';
import type { DecisionTraceItem } from '../models/decisionTrace';
import type { EvidenceLevel, SkillEvidence } from '../models/skillEvidence';

type UnknownRecord = Record<string, unknown>;
const asRecord = (value: unknown): UnknownRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {};
const asList = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const asStrings = (value: unknown): string[] => asList(value).filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
const asString = (value: unknown) => typeof value === 'string' && value.trim() ? value : null;
const asNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : undefined;
const score = (value: unknown) => {
  const parsed = asNumber(value);
  return parsed === undefined ? undefined : Math.max(0, Math.min(100, parsed));
};
const numberRecord = (value: unknown) => Object.fromEntries(Object.entries(asRecord(value)).filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1])));
const booleanRecord = (value: unknown) => Object.fromEntries(Object.entries(asRecord(value)).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'));
const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

const evidenceLevels = new Set(['STRONG', 'MEDIUM', 'WEAK', 'MISSING']);
const normalizeEvidence = (value: unknown, skillKey: string): SkillEvidence => {
  const item = asRecord(value);
  const level = String(item.evidenceLevel ?? '').toUpperCase();
  return {
    skill: asString(item.skill) ?? skillKey,
    evidenceLevel: (evidenceLevels.has(level) ? level : 'UNKNOWN') as EvidenceLevel,
    evidenceType: asString(item.evidenceType),
    evidenceSnippets: asStrings(item.evidenceSnippets ?? item.snippets).map((snippet) => snippet.slice(0, 220)),
    confidence: asNumber(item.confidence),
    reason: asString(item.reason ?? item.remarks),
    recommendation: asString(item.recommendation),
  };
};

const normalizeCareerMap = (value: unknown): CareerSignalMap => {
  const map = asRecord(value);
  const categories: CareerSignalCategory[] = asList(map.categories).map((raw) => {
    const item = asRecord(raw);
    return {
      category: asString(item.category) ?? 'Categorie',
      score: score(item.score),
      level: asString(item.level),
      evidenceQuality: asString(item.evidenceQuality),
      matchedSkills: asStrings(item.matchedSkills),
      weakSkills: asStrings(item.weakSkills),
      missingSkills: asStrings(item.missingSkills),
      explanation: asString(item.explanation),
    };
  });
  const global = asRecord(map.globalSignals);
  return { categories, globalSignals: { dominantDomains: asStrings(global.dominantDomains), weakDomains: asStrings(global.weakDomains), bestEvidenceCategory: asString(global.bestEvidenceCategory), lowestEvidenceCategory: asString(global.lowestEvidenceCategory), profileType: asString(global.profileType), signalConfidence: asString(global.signalConfidence) } };
};

const normalizeTrace = (value: unknown): DecisionTraceItem[] => asList(value).map((raw) => {
  const item = asRecord(raw);
  return { step: asString(item.step), title: asString(item.title), status: asString(item.status), summary: asString(item.summary ?? item.description), details: asStrings(item.details ?? item.evidence) };
});

export const normalizeAiMatchResult = (value: unknown): AiMatchResult => {
  const root = asRecord(value);
  const source = asRecord(root.data ?? root.matching ?? root.result ?? value);
  const v3 = asRecord(source.v3);
  const explainability = asRecord(source.explainability);
  const evidenceMap = asRecord(explainability.skillEvidenceMap ?? source.skillEvidenceMap);
  const rawScore = score(source.score);
  const warnings = unique([...asStrings(source.warnings), ...asStrings(v3.warnings), ...asStrings(explainability.warnings)]);

  return {
    score: rawScore,
    confidence: asString(source.confidence),
    decisionLabel: asString(source.decisionLabel),
    explanation: asString(source.explanation),
    matchedSkills: asStrings(source.matchedSkills),
    missingSkills: asStrings(source.missingSkills ?? v3.missingRequiredSkills),
    optionalMatchedSkills: asStrings(source.optionalMatchedSkills),
    criticalMissingSkills: asStrings(source.criticalMissingSkills ?? v3.criticalMissingSkills),
    warnings,
    scoreBreakdown: numberRecord(source.scoreBreakdown ?? v3.scoreBreakdown),
    skillEvidence: Object.entries(evidenceMap).map(([skillKey, item]) => normalizeEvidence(item, skillKey)),
    careerSignalMap: normalizeCareerMap(explainability.careerSignalMap ?? source.careerSignalMap),
    decisionTrace: normalizeTrace(explainability.decisionTrace ?? source.decisionTrace),
    qualityChecks: booleanRecord(source.qualityChecks ?? v3.qualityChecks),
    matchingMethod: asString(source.matchingMethod ?? v3.scoringMethod),
    isAvailable: rawScore !== undefined || Boolean(asString(source.decisionLabel)) || Object.keys(explainability).length > 0,
  };
};
