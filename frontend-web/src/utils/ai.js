import { normalizeScore, toArray } from './formatters.js';

const asObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});
const asList = (value) => (Array.isArray(value) ? value : []);

export const normalizeAiMatchResult = (result) => {
  if (!result) return null;

  const source = result.data || result.matching || result;
  const v3 = asObject(source.v3);
  const explainability = asObject(source.explainability);

  return {
    score: normalizeScore(source.score),
    confidence: source.confidence || 'LOW',
    decisionLabel: source.decisionLabel || 'INSUFFICIENT_DATA',
    explanation: source.explanation || '',
    matchedSkills: toArray(source.matchedSkills),
    missingSkills: toArray(source.missingSkills),
    optionalMatchedSkills: toArray(source.optionalMatchedSkills),
    strengths: toArray(source.strengths),
    risks: toArray(source.risks),
    recommendations: toArray(source.recommendations),
    warnings: toArray(v3.warnings || source.warnings),
    v3: {
      ...v3,
      scoreBreakdown: asObject(v3.scoreBreakdown || source.scoreBreakdown),
      criticalMissingSkills: toArray(v3.criticalMissingSkills || source.criticalMissingSkills),
      missingRequiredSkills: toArray(v3.missingRequiredSkills || source.missingRequiredSkills || source.missingSkills),
      missingOptionalSkills: toArray(v3.missingOptionalSkills || source.missingOptionalSkills),
      partialMatchedSkills: asList(v3.partialMatchedSkills || source.partialMatchedSkills),
      coverageMatrix: asList(v3.coverageMatrix),
      evidenceSummary: asObject(v3.evidenceSummary),
    },
    explainability: {
      ...explainability,
      skillEvidenceMap: asObject(explainability.skillEvidenceMap),
      careerSignalMap: asObject(explainability.careerSignalMap),
      decisionTrace: asList(explainability.decisionTrace),
      warnings: toArray(explainability.warnings),
    },
  };
};

export const normalizeSkillGapSimulation = (result) => {
  const source = asObject(result?.data || result);
  return {
    currentScore: normalizeScore(source.currentScore),
    potentialBestScore: normalizeScore(source.potentialBestScore),
    potentialDecisionLabel: source.potentialDecisionLabel || '',
    scoreGain: Math.max(0, Number(source.scoreGain) || 0),
    simulationMode: source.simulationMode || 'REALISTIC',
    highImpactGaps: asList(source.highImpactGaps),
    singleSkillSimulations: asList(source.singleSkillSimulations),
    combinationSimulations: asList(source.combinationSimulations),
    recommendedPath: asList(source.recommendedPath),
    recommendedProjects: asList(source.recommendedProjects),
    scoreCapsApplied: asList(source.scoreCapsApplied),
    decisionTrace: asList(source.decisionTrace),
    summary: source.summary || '',
    warnings: toArray(source.warnings),
    assumptions: toArray(source.assumptions),
  };
};

export const normalizeOfferQuality = (result) => {
  const source = asObject(result?.data || result);
  return {
    qualityScore: normalizeScore(source.qualityScore),
    qualityLevel: source.qualityLevel || 'VERY_LOW',
    matchingReadiness: source.matchingReadiness || 'INSUFFICIENT',
    summary: source.summary || '',
    dimensionScores: asObject(source.dimensionScores),
    strengths: toArray(source.strengths),
    issues: asList(source.issues),
    recommendations: toArray(source.recommendations),
    improvedOfferDraft: asObject(source.improvedOfferDraft),
    decisionTrace: asList(source.decisionTrace),
    warnings: toArray(source.warnings),
  };
};

export const getAiErrorMessage = (error, fallback) => {
  if (!error?.response) return 'Impossible de contacter le serveur IA. Reessayez lorsque les services sont disponibles.';
  if (error.response.status === 403) return 'Vous n etes pas autorise a utiliser cette analyse.';
  if (error.response.status === 400) return error.response.data?.message || 'Les donnees transmises sont invalides.';
  return error.response.data?.message || fallback;
};

export const aiLabels = {
  confidence: { HIGH: 'Confiance elevee', MEDIUM: 'Confiance moyenne', LOW: 'Confiance faible' },
  decision: {
    STRONG_MATCH: 'Compatibilite forte',
    GOOD_MATCH: 'Bonne compatibilite',
    PARTIAL_MATCH: 'Compatibilite partielle',
    LOW_MATCH: 'Compatibilite limitee',
    VERY_LOW_MATCH: 'Compatibilite tres limitee',
    INSUFFICIENT_DATA: 'Donnees insuffisantes',
  },
  evidence: { STRONG: 'Preuve forte', MEDIUM: 'Preuve moyenne', WEAK: 'Preuve faible', MISSING: 'Preuve absente' },
};
