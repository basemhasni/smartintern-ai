import { useCallback, useMemo, useRef, useState } from 'react';

import { ApiError, normalizeApiError } from '@/core/api/apiError';
import { useOffers } from '@/features/offers/state/OffersContext';
import { useStudentDashboard } from '@/features/student/state/StudentDashboardContext';
import { aiInsightsApi } from '../api/aiInsightsApi';
import type { AiMatchResult } from '../models/aiMatchResult';
import { normalizeAiMatchResult } from '../utils/normalizeAiMatchResult';

const matchError = (error: unknown) => {
  if (error instanceof ApiError && error.status === 400 && /cv|candidate skills/i.test(error.message)) return 'Ajoutez et analysez votre CV avant de lancer cette analyse.';
  if (error instanceof ApiError && error.status === 500 && /ai service/i.test(error.message)) return 'Le service IA est temporairement indisponible. Vos offres restent consultables.';
  return normalizeApiError(error);
};

export function useAiInsights(initialOfferId?: string) {
  const { offers, recommendedOffers, findOffer, cacheOfferMatch } = useOffers();
  const { latestCv, profile } = useStudentDashboard();
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(initialOfferId ?? null);
  const [analyses, setAnalyses] = useState<Record<string, AiMatchResult>>({});
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);
  const selectedOffer = selectedOfferId ? findOffer(selectedOfferId) : undefined;
  const cachedAnalysis = selectedOffer?.match?.isAvailable ? normalizeAiMatchResult(selectedOffer.match) : undefined;
  const analysis = selectedOfferId ? analyses[selectedOfferId] ?? cachedAnalysis : undefined;

  const selectOffer = useCallback((offerId: string) => { setSelectedOfferId(offerId); setError(null); }, []);
  const analyze = useCallback(async () => {
    if (!selectedOfferId || running.current) return;
    if (!latestCv || latestCv.status !== 'ANALYZED') { setError('Ajoutez et analysez votre CV avant de lancer cette analyse.'); return; }
    running.current = true; setIsAnalyzing(true); setError(null);
    try {
      const result = await aiInsightsApi.analyzeOffer(selectedOfferId);
      setAnalyses((current) => ({ ...current, [selectedOfferId]: result.analysis }));
      setLastAnalyzedAt((current) => ({ ...current, [selectedOfferId]: new Date().toISOString() }));
      cacheOfferMatch(selectedOfferId, result.offerMatch);
    } catch (requestError) { setError(matchError(requestError)); }
    finally { running.current = false; setIsAnalyzing(false); }
  }, [cacheOfferMatch, latestCv, selectedOfferId]);

  return useMemo(() => ({ offers, recommendedOffers, selectedOfferId, selectedOffer, analysis, latestCv, profile, canAnalyze: latestCv?.status === 'ANALYZED', isAnalyzing, error, lastAnalyzedAt: selectedOfferId ? lastAnalyzedAt[selectedOfferId] : undefined, selectOffer, analyze, clearError: () => setError(null) }), [offers, recommendedOffers, selectedOfferId, selectedOffer, analysis, latestCv, profile, isAnalyzing, error, lastAnalyzedAt, selectOffer, analyze]);
}
