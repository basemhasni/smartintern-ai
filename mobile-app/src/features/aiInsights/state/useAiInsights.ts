import { useCallback, useMemo, useRef, useState } from 'react';

import { ApiError, normalizeApiError } from '@/core/api/apiError';
import { useOffers } from '@/features/offers/state/OffersContext';
import { useStudentDashboard } from '@/features/student/state/StudentDashboardContext';
import { useStudentProfile } from '@/features/profile/state/StudentProfileContext';
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
  const { revision } = useStudentProfile();
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(initialOfferId ?? null);
  const [analyses, setAnalyses] = useState<Record<string, AiMatchResult>>({});
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);
  const selectedOffer = selectedOfferId ? findOffer(selectedOfferId) : undefined;
  const cachedAnalysis = selectedOffer?.match?.isAvailable ? normalizeAiMatchResult(selectedOffer.match) : undefined;
  const analysisKey = selectedOfferId ? `${selectedOfferId}:${revision}` : null;
  const analysis = analysisKey ? analyses[analysisKey] ?? cachedAnalysis : undefined;

  const selectOffer = useCallback((offerId: string) => { setSelectedOfferId(offerId); setError(null); }, []);
  const analyze = useCallback(async () => {
    if (!selectedOfferId || running.current) return;
    if (!latestCv || latestCv.status !== 'ANALYZED') { setError('Ajoutez et analysez votre CV avant de lancer cette analyse.'); return; }
    running.current = true; setIsAnalyzing(true); setError(null);
    try {
      const result = await aiInsightsApi.analyzeOffer(selectedOfferId);
      const key = `${selectedOfferId}:${revision}`;
      setAnalyses((current) => ({ ...current, [key]: result.analysis }));
      setLastAnalyzedAt((current) => ({ ...current, [key]: new Date().toISOString() }));
      cacheOfferMatch(selectedOfferId, result.offerMatch);
    } catch (requestError) { setError(matchError(requestError)); }
    finally { running.current = false; setIsAnalyzing(false); }
  }, [cacheOfferMatch, latestCv, revision, selectedOfferId]);

  return useMemo(() => ({ offers, recommendedOffers, selectedOfferId, selectedOffer, analysis, latestCv, profile, canAnalyze: latestCv?.status === 'ANALYZED', isAnalyzing, error, lastAnalyzedAt: analysisKey ? lastAnalyzedAt[analysisKey] : undefined, selectOffer, analyze, clearError: () => setError(null) }), [offers, recommendedOffers, selectedOfferId, selectedOffer, analysis, latestCv, profile, isAnalyzing, error, lastAnalyzedAt, analysisKey, selectOffer, analyze]);
}
