import { apiRequest } from '@/core/api/apiClient';
import { normalizeOfferMatch, type OfferMatch } from '@/features/offers/models/offerMatch';
import type { AiMatchResult } from '../models/aiMatchResult';
import { normalizeAiMatchResult } from '../utils/normalizeAiMatchResult';

type MatchResponse = { matching?: unknown };
export type AiAnalysisResponse = { analysis: AiMatchResult; offerMatch: OfferMatch };

export const aiInsightsApi = {
  async analyzeOffer(offerId: string): Promise<AiAnalysisResponse> {
    const response = await apiRequest<MatchResponse>(`/offers/${encodeURIComponent(offerId)}/match`, { timeoutMs: 60_000 });
    return { analysis: normalizeAiMatchResult(response.matching), offerMatch: normalizeOfferMatch(response.matching) };
  },
};
