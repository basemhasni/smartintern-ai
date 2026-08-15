import { normalizeScore, toArray } from './formatters.js';
import { normalizeMatching, normalizeOffer } from './offers.js';
import { normalizeSkillGapSimulation } from './ai.js';

export const promptSuggestions = [
  'Quelles competences dois-je ameliorer pour cette offre ?',
  'Quel projet pourrais-je realiser pour renforcer ma candidature ?',
  'Comment mieux presenter mon profil pour ce type de stage ?',
  'Quelles sont mes principales forces par rapport a cette offre ?',
  'Propose-moi un plan de progression sur trois semaines.',
];

export const priorityLabels = {
  HIGH: 'Priorite elevee',
  MEDIUM: 'Priorite moyenne',
  LOW: 'Priorite complementaire',
};

export const readinessLabels = {
  READY: 'Profil pret',
  ALMOST_READY: 'Presque pret',
  NEEDS_TARGETED_WORK: 'Travail cible necessaire',
  NEEDS_MAJOR_WORK: 'Progression importante necessaire',
  INSUFFICIENT_DATA: 'Donnees insuffisantes',
};

export const questionIntentLabels = {
  SKILL_GAPS: 'Competences a ameliorer',
  PROJECT_IDEAS: 'Projet recommande',
  CV_IMPROVEMENT: 'Amelioration du CV',
  INTERVIEW_PREP: 'Preparation entretien',
  STRENGTHS: 'Points forts prouves',
  LEARNING_PLAN: 'Plan de progression',
  READINESS: 'Niveau de preparation',
  SPECIFIC_SKILL: 'Analyse d une competence',
  CUSTOM_QUESTION: 'Reponse basee sur le matching',
  FULL_ANALYSIS: 'Analyse complete',
};

export const ownerTypeLabels = {
  CV: 'CV',
  OFFER: 'Offre',
  CAREER_ADVICE: 'Conseil carriere',
  MOTIVATION_LETTER: 'Lettre de motivation',
};

const normalizeSkillsToImprove = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    skill: item?.skill || 'Competence',
    priority: item?.priority || 'MEDIUM',
    priorityLabel: priorityLabels[item?.priority] || item?.priority || 'Priorite moyenne',
    reason: item?.reason || 'Cette competence peut renforcer votre candidature.',
    actions: toArray(item?.actions),
    gapType: item?.gapType || '',
    impactOnMatching: item?.impactOnMatching || '',
    currentEvidence: toArray(item?.currentEvidence),
  }));
};

const normalizeActionPlan = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => ({
    period: item?.period || `Etape ${index + 1}`,
    objective: item?.objective || '',
    actions: toArray(item?.actions),
    targetSkills: toArray(item?.targetSkills),
    expectedOutcome: item?.expectedOutcome || '',
  })).filter((item) => item.objective);
};

const normalizePriorityFocus = (items) => (Array.isArray(items) ? items : []).map((item) => ({
  skill: item?.skill || 'Competence',
  priority: item?.priority || 'MEDIUM',
  priorityLabel: priorityLabels[item?.priority] || 'Priorite moyenne',
  gapType: item?.gapType || '',
  reason: item?.reason || '',
  impactOnMatching: item?.impactOnMatching || '',
  currentEvidence: toArray(item?.currentEvidence),
  suggestedActions: toArray(item?.suggestedActions),
}));

const normalizeProjects = (items) => (Array.isArray(items) ? items : []).map((item) => ({
  title: item?.title || 'Projet pratique',
  skillsCovered: toArray(item?.skillsCovered),
  difficulty: item?.difficulty || 'BEGINNER',
  estimatedTime: item?.estimatedTime || '',
  description: item?.description || '',
  deliverables: toArray(item?.deliverables),
  portfolioValue: item?.portfolioValue || '',
}));

const normalizeInterviewTips = (items) => (Array.isArray(items) ? items : []).map((item) => ({
  topic: item?.topic || 'Preparation',
  tip: item?.tip || '',
  basedOn: item?.basedOn || '',
})).filter((item) => item.tip);

const normalizeCareerAdviceV2 = (v2) => {
  const value = v2 && typeof v2 === 'object' ? v2 : {};
  const readinessLevel = value.readinessLevel || 'INSUFFICIENT_DATA';
  const questionIntent = value.questionIntent || 'FULL_ANALYSIS';

  return {
    available: Boolean(value.adviceMethod),
    adviceMethod: value.adviceMethod || '',
    questionIntent,
    questionIntentLabel: questionIntentLabels[questionIntent] || 'Reponse personnalisee',
    answeredQuestion: value.answeredQuestion || '',
    directAnswer: value.directAnswer || '',
    specificSkillAnalysis: value.specificSkillAnalysis && typeof value.specificSkillAnalysis === 'object' ? {
      ...value.specificSkillAnalysis,
      evidence: toArray(value.specificSkillAnalysis.evidence),
    } : null,
    analysisSummary: value.analysisSummary && typeof value.analysisSummary === 'object' ? value.analysisSummary : null,
    skillEvidenceMap: value.skillEvidenceMap && typeof value.skillEvidenceMap === 'object' ? value.skillEvidenceMap : {},
    careerSignalMap: value.careerSignalMap && typeof value.careerSignalMap === 'object' ? value.careerSignalMap : {},
    decisionTrace: Array.isArray(value.decisionTrace) ? value.decisionTrace : [],
    skillGapSimulation: normalizeSkillGapSimulation(value.skillGapSimulation),
    readinessLevel,
    readinessLabel: readinessLabels[readinessLevel] || readinessLevel,
    confidence: value.confidence || 'LOW',
    decisionLabel: value.decisionLabel || 'INSUFFICIENT_DATA',
    priorityFocus: normalizePriorityFocus(value.priorityFocus),
    criticalGaps: normalizePriorityFocus(value.criticalGaps),
    requiredGaps: normalizePriorityFocus(value.requiredGaps),
    optionalImprovements: normalizePriorityFocus(value.optionalImprovements),
    evidenceBasedStrengths: (Array.isArray(value.evidenceBasedStrengths) ? value.evidenceBasedStrengths : []).filter((item) => item && typeof item === 'object'),
    weakEvidenceAreas: (Array.isArray(value.weakEvidenceAreas) ? value.weakEvidenceAreas : []).filter((item) => item && typeof item === 'object'),
    recommendedProjects: normalizeProjects(value.recommendedProjects),
    cvImprovementTips: toArray(value.cvImprovementTips),
    interviewPreparationTips: normalizeInterviewTips(value.interviewPreparationTips),
    learningRoadmap: normalizeActionPlan(value.learningRoadmap),
    estimatedPreparationEffort: value.estimatedPreparationEffort || null,
    warnings: toArray(value.warnings),
    ragContextUsed: Boolean(value.ragContextUsed),
  };
};

const normalizeRagContext = (ragContext) => {
  const documents = Array.isArray(ragContext?.documents) ? ragContext.documents : [];

  return {
    used: Boolean(ragContext?.used),
    documentsCount: Number(ragContext?.documentsCount || documents.length || 0),
    documents: documents.map((document) => ({
      id: document.id,
      ownerType: document.ownerType,
      ownerTypeLabel: ownerTypeLabels[document.ownerType] || document.ownerType || 'Document',
      title: document.title || 'Document indexe',
      score: Number.isFinite(Number(document.score)) ? Number(document.score) : null,
    })),
  };
};

export const normalizeCareerAdviceResponse = (response) => {
  const advice = response?.careerAdvice && typeof response.careerAdvice === 'object' ? response.careerAdvice : {};

  return {
    message: response?.message || '',
    profileSummary: advice.profileSummary || '',
    matchingScore: normalizeScore(advice.matchingScore),
    strengths: toArray(advice.strengths),
    skillsToImprove: normalizeSkillsToImprove(advice.skillsToImprove),
    actionPlan: normalizeActionPlan(advice.actionPlan),
    finalAdvice: advice.finalAdvice || '',
    ragInsights: toArray(advice.ragInsights),
    ragContext: normalizeRagContext(response?.ragContext),
    v2: normalizeCareerAdviceV2(advice.v2),
  };
};

export const buildCareerOfferOptions = ({ offers = [], recommendations = [], selectedOfferId }) => {
  const byId = new Map();

  (Array.isArray(offers) ? offers : []).filter(Boolean).forEach((offer) => {
    const normalized = normalizeOffer(offer);

    if (normalized?.id) {
      byId.set(normalized.id, {
        ...normalized,
        isRecommended: false,
        matching: null,
      });
    }
  });

  (Array.isArray(recommendations) ? recommendations : []).filter(Boolean).forEach((recommendation) => {
    const offer = recommendation.offer;

    if (!offer?.id) {
      return;
    }

    const existing = byId.get(offer.id) || {};
    const normalized = normalizeOffer({
      ...existing,
      ...offer,
      company: existing.company || offer.company || null,
    });

    if (!normalized) {
      return;
    }

    byId.set(normalized.id, {
      ...existing,
      ...normalized,
      isRecommended: true,
      matching: normalizeMatching(recommendation.matching) || existing.matching || null,
    });
  });

  return [...byId.values()].sort((first, second) => {
    if (String(first.id) === String(selectedOfferId)) return -1;
    if (String(second.id) === String(selectedOfferId)) return 1;
    if (first.isRecommended !== second.isRecommended) return first.isRecommended ? -1 : 1;
    return (second.matching?.score || 0) - (first.matching?.score || 0);
  });
};

export const getCareerAssistantError = (error) => {
  if (error?.normalized?.code === 'AI_SERVICE_UNAVAILABLE') {
    return 'L assistant carriere est temporairement indisponible. Reessayez dans quelques instants.';
  }

  if (['AI_SERVICE_TIMEOUT', 'TIMEOUT'].includes(error?.normalized?.code)) {
    return "L'analyse prend plus de temps que prevu. Reessayez.";
  }

  if (error?.normalized?.code === 'RATE_LIMIT') {
    return 'Trop de demandes ont ete envoyees. Reessayez dans quelques instants.';
  }

  if (!error.response) {
    return 'Le serveur est inaccessible. Verifiez que le backend est demarre.';
  }

  const message = error.response.data?.error?.message || error.response.data?.message || '';

  if (error.response.status === 400 && (message.includes('No analyzed CV') || message.includes('No candidate skills'))) {
    return 'Un CV analyse est necessaire pour generer des conseils personnalises.';
  }

  if (error.response.status === 400 && message.includes('offerId')) {
    return 'Selectionnez une offre valide.';
  }

  if (error.response.status === 404) {
    return 'Cette offre n est plus disponible.';
  }

  if (error.response.status === 503 || error.response.status >= 500) {
    return 'L assistant carriere est temporairement indisponible. Reessayez dans quelques instants.';
  }

  return message || 'Une erreur est survenue. Veuillez reessayer.';
};
