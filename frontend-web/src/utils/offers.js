import { normalizeScore, toArray } from './formatters.js';
import { normalizeAiMatchResult } from './ai.js';

export const normalizeMatching = (matching) => {
  const normalized = normalizeAiMatchResult(matching);
  return normalized ? { ...normalized, score: normalizeScore(normalized.score) } : null;
};

export const normalizeOffer = (offer, extras = {}) => {
  if (!offer) {
    return null;
  }

  return {
    ...offer,
    id: offer.id,
    title: offer.title || 'Offre sans titre',
    description: offer.description || '',
    location: offer.location || '',
    duration: offer.duration || '',
    startDate: offer.startDate || null,
    company: offer.company || null,
    requiredSkills: toArray(offer.requiredSkills ?? offer.requiredSkillsJson),
    optionalSkills: toArray(offer.optionalSkills ?? offer.optionalSkillsJson),
    createdAt: offer.createdAt || null,
    isRecommended: Boolean(extras.isRecommended),
    hasApplied: Boolean(extras.hasApplied),
    matching: normalizeMatching(extras.matching),
  };
};

export const getAppliedOfferIds = (applications = []) => new Set(
  applications
    .map((application) => application.offer?.id ?? application.offerId)
    .filter((id) => id !== undefined && id !== null),
);

export const buildOfferViewModels = ({ offers = [], recommendations = [], applications = [] }) => {
  const appliedOfferIds = getAppliedOfferIds(applications);
  const byId = new Map();

  offers.forEach((offer) => {
    const normalized = normalizeOffer(offer, {
      hasApplied: appliedOfferIds.has(offer.id),
    });

    if (normalized) {
      byId.set(normalized.id, normalized);
    }
  });

  recommendations.forEach((recommendation) => {
    const recommendedOffer = recommendation.offer;
    const existing = byId.get(recommendedOffer?.id);
    const normalized = normalizeOffer(
      {
        ...(existing || {}),
        ...(recommendedOffer || {}),
        company: existing?.company || recommendedOffer?.company || null,
        requiredSkills: existing?.requiredSkills || recommendedOffer?.requiredSkills,
        optionalSkills: existing?.optionalSkills || recommendedOffer?.optionalSkills,
      },
      {
        isRecommended: true,
        hasApplied: appliedOfferIds.has(recommendedOffer?.id),
        matching: recommendation.matching,
      },
    );

    if (normalized) {
      byId.set(normalized.id, normalized);
    }
  });

  return [...byId.values()].sort((first, second) => {
    if (first.isRecommended !== second.isRecommended) {
      return first.isRecommended ? -1 : 1;
    }

    return (second.matching?.score || 0) - (first.matching?.score || 0);
  });
};

export const getOfferSearchText = (offer) => [
  offer.title,
  offer.description,
  offer.location,
  offer.duration,
  offer.company?.companyName,
  offer.company?.sector,
  ...offer.requiredSkills,
  ...offer.optionalSkills,
].filter(Boolean).join(' ').toLowerCase();

export const filterAndSortOffers = (offers, filters) => {
  const query = filters.query.trim().toLowerCase();
  const minScore = Number(filters.minScore);

  return offers
    .filter((offer) => {
      if (filters.view === 'recommended' && !offer.isRecommended) {
        return false;
      }

      if (filters.location && offer.location !== filters.location) {
        return false;
      }

      if (filters.duration && offer.duration !== filters.duration) {
        return false;
      }

      if (minScore > 0 && (offer.matching?.score === null || offer.matching?.score === undefined || offer.matching.score < minScore)) {
        return false;
      }

      if (query && !getOfferSearchText(offer).includes(query)) {
        return false;
      }

      return true;
    })
    .sort((first, second) => {
      if (filters.sort === 'score') {
        return (second.matching?.score || -1) - (first.matching?.score || -1);
      }

      if (filters.sort === 'title') {
        return first.title.localeCompare(second.title);
      }

      return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
    });
};

export const getUniqueValues = (offers, field) => (
  [...new Set(offers.map((offer) => offer[field]).filter(Boolean))].sort()
);

export const isNoCvRecommendationError = (message = '') => (
  message.includes('No analyzed CV') || message.includes('No candidate skills')
);

export const getApplicationForOffer = (applications = [], offerId) => (
  applications.find((application) => (application.offer?.id ?? application.offerId) === offerId)
);
