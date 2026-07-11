import { apiRequest } from '@/core/api/apiClient';
import { normalizeOffer, type Offer } from '../models/offer';
import { normalizeOfferMatch, type OfferMatch } from '../models/offerMatch';

type OffersResponse = { offers?: unknown[] };
type OfferResponse = { offer?: unknown };
type RecommendationsResponse = { recommendations?: unknown[] };
type MatchResponse = { matching?: unknown };

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? value as Record<string, unknown> : {};

export const offersApi = {
  async getPublishedOffers(): Promise<Offer[]> {
    const response = await apiRequest<OffersResponse>('/offers', { skipAuth: true });
    return Array.isArray(response.offers) ? response.offers.map(normalizeOffer) : [];
  },

  async getRecommendedOffers(limit = 10): Promise<Offer[]> {
    const response = await apiRequest<RecommendationsResponse>(
      `/students/recommendations?limit=${Math.max(1, Math.min(limit, 50))}`,
    );

    if (!Array.isArray(response.recommendations)) return [];

    return response.recommendations.map((value) => {
      const recommendation = asRecord(value);
      return {
        ...normalizeOffer(recommendation.offer),
        match: normalizeOfferMatch(recommendation.matching),
      };
    });
  },

  async getOfferById(id: string): Promise<Offer> {
    const response = await apiRequest<OfferResponse>(`/offers/${encodeURIComponent(id)}`, {
      skipAuth: true,
    });
    return normalizeOffer(response.offer);
  },

  async analyzeOfferMatch(id: string): Promise<OfferMatch> {
    const response = await apiRequest<MatchResponse>(
      `/offers/${encodeURIComponent(id)}/match`,
      { timeoutMs: 60_000 },
    );
    return normalizeOfferMatch(response.matching);
  },
};
