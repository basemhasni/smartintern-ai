import { normalizeScore, toArray } from './formatters.js';
import { normalizeMatching, normalizeOffer } from './offers.js';

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
  }));
};

const normalizeActionPlan = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => ({
    period: item?.period || `Etape ${index + 1}`,
    objective: item?.objective || '',
  })).filter((item) => item.objective);
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
  const advice = response?.careerAdvice || {};

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
  };
};

export const buildCareerOfferOptions = ({ offers = [], recommendations = [], selectedOfferId }) => {
  const byId = new Map();

  offers.forEach((offer) => {
    const normalized = normalizeOffer(offer);

    if (normalized?.id) {
      byId.set(normalized.id, {
        ...normalized,
        isRecommended: false,
        matching: null,
      });
    }
  });

  recommendations.forEach((recommendation) => {
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
  if (!error.response) {
    return 'Impossible de contacter le serveur. Verifiez que le backend et le service IA sont demarres.';
  }

  const message = error.response.data?.message || '';

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
