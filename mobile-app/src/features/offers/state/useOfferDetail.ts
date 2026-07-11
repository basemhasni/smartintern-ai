import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError, normalizeApiError } from '@/core/api/apiError';
import { applicationsApi } from '@/features/applications/api/applicationsApi';
import { useApplications } from '@/features/applications/state/ApplicationsContext';
import { useStudentDashboard } from '@/features/student/state/StudentDashboardContext';
import { offersApi } from '../api/offersApi';
import type { Offer } from '../models/offer';
import type { OfferMatch } from '../models/offerMatch';
import { useOffers } from './OffersContext';

const normalizeMatchError = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 400 && /cv|candidate skills/i.test(error.message)) {
      return 'Ajoutez et analysez votre CV avant de lancer la compatibilite IA.';
    }
    if (error.status === 500 && /ai service/i.test(error.message)) {
      return 'L analyse IA est temporairement indisponible. Vous pouvez neanmoins consulter l offre.';
    }
  }
  return normalizeApiError(error);
};

export function useOfferDetail(offerId: string) {
  const { findOffer, cacheOfferMatch } = useOffers();
  const cachedOffer = findOffer(offerId);
  const {
    findForOffer,
    addApplication,
    refresh: refreshApplications,
    isLoading: isCheckingApplication,
  } = useApplications();
  const { latestCv, profile, profileCompletion } = useStudentDashboard();
  const [offer, setOffer] = useState<Offer | null>(cachedOffer ?? null);
  const [match, setMatch] = useState<OfferMatch | undefined>(cachedOffer?.match);
  const [isLoading, setIsLoading] = useState(!cachedOffer);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const requestId = useRef(0);
  const analyzing = useRef(false);
  const applying = useRef(false);
  const mounted = useRef(true);

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  const loadOffer = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const freshOffer = await offersApi.getOfferById(offerId);
      if (!mounted.current || currentRequest !== requestId.current) return;
      const cachedMatch = findOffer(offerId)?.match;
      setOffer((current) => ({ ...freshOffer, match: current?.match ?? cachedMatch }));
      setMatch((current) => current ?? (cachedMatch?.isAvailable ? cachedMatch : undefined));
    } catch (requestError) {
      if (mounted.current && currentRequest === requestId.current) {
        setError(normalizeApiError(requestError));
      }
    } finally {
      if (mounted.current && currentRequest === requestId.current) setIsLoading(false);
    }
  }, [findOffer, offerId]);

  useEffect(() => {
    const timer = setTimeout(() => void loadOffer(), 0);
    return () => clearTimeout(timer);
  }, [loadOffer]);

  const analyze = useCallback(async () => {
    if (analyzing.current || match?.isAvailable) return;
    if (!latestCv || latestCv.status !== 'ANALYZED') {
      setMatchError('Ajoutez et analysez votre CV avant de lancer la compatibilite IA.');
      return;
    }

    analyzing.current = true;
    setIsAnalyzing(true);
    setMatchError(null);
    try {
      const result = await offersApi.analyzeOfferMatch(offerId);
      if (!result.isAvailable) {
        throw new ApiError('L analyse ne contient pas encore de score exploitable.', 422);
      }
      if (mounted.current) {
        setMatch(result);
        setOffer((current) => current ? { ...current, match: result } : current);
        cacheOfferMatch(offerId, result);
      }
    } catch (requestError) {
      if (mounted.current) setMatchError(normalizeMatchError(requestError));
    } finally {
      analyzing.current = false;
      if (mounted.current) setIsAnalyzing(false);
    }
  }, [cacheOfferMatch, latestCv, match?.isAvailable, offerId]);

  const apply = useCallback(async () => {
    if (applying.current || findForOffer(offerId)) return;
    applying.current = true;
    setIsApplying(true);
    setApplyError(null);
    setApplySuccess(false);

    try {
      const application = await applicationsApi.applyToOffer(offerId);
      if (mounted.current) {
        addApplication({ ...application, offer });
        setApplySuccess(true);
      }
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 409) {
        await refreshApplications();
        if (mounted.current) setApplyError('Vous avez deja postule a cette offre.');
      } else if (mounted.current) {
        setApplyError(normalizeApiError(requestError));
      }
    } finally {
      applying.current = false;
      if (mounted.current) setIsApplying(false);
    }
  }, [addApplication, findForOffer, offer, offerId, refreshApplications]);

  const existingApplication = findForOffer(offerId);
  const canAnalyze = latestCv?.status === 'ANALYZED';
  const isOfferAvailable = offer?.status === 'PUBLISHED';

  return {
    offer,
    match,
    existingApplication,
    latestCv,
    profile,
    profileCompletion,
    isLoading,
    isAnalyzing,
    isApplying,
    isCheckingApplication,
    isOfferAvailable,
    canAnalyze,
    error,
    matchError,
    applyError,
    applySuccess,
    refresh: loadOffer,
    analyze,
    apply,
    clearApplyError: () => setApplyError(null),
  };
}
