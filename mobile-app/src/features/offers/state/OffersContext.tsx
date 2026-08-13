import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { toApiError, normalizeApiError } from '@/core/api/apiError';
import { offersApi } from '../api/offersApi';
import type { Offer } from '../models/offer';
import type { OfferMatch } from '../models/offerMatch';
import { useStudentProfile } from '@/features/profile/state/StudentProfileContext';

type OffersContextValue = {
  offers: Offer[];
  recommendedOffers: Offer[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  recommendationsMessage: string | null;
  refresh: () => Promise<void>;
  findOffer: (id: string) => Offer | undefined;
  cacheOfferMatch: (id: string, match: OfferMatch) => void;
};

const OffersContext = createContext<OffersContextValue | null>(null);

const recommendationMessage = (error: unknown) => {
  const apiError = toApiError(error);
  if (
    apiError.status === 400 &&
    /analyzed cv|candidate skills|upload a cv/i.test(apiError.message)
  ) {
    return 'Analyse disponible après ajout et analyse de votre CV.';
  }

  return normalizeApiError(error);
};

export function OffersProvider({ children }: { children: ReactNode }) {
  const { revision } = useStudentProfile();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [recommendedOffers, setRecommendedOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendationsMessage, setRecommendationsMessage] = useState<string | null>(null);
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async (refreshing: boolean) => {
    const currentRequest = ++requestId.current;
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    setRecommendationsMessage(null);

    const [offersResult, recommendationsResult] = await Promise.allSettled([
      offersApi.getPublishedOffers(),
      offersApi.getRecommendedOffers(10),
    ]);

    if (!mounted.current || currentRequest !== requestId.current) return;

    if (offersResult.status === 'rejected') {
      setOffers([]);
      setRecommendedOffers([]);
      setError(normalizeApiError(offersResult.reason));
    } else {
      const publishedOffers = offersResult.value;
      const recommended = recommendationsResult.status === 'fulfilled'
        ? recommendationsResult.value
        : [];
      const matches = new Map(
        recommended
          .filter((offer) => offer.id && offer.match?.isAvailable)
          .map((offer) => [offer.id, offer.match]),
      );
      const mergedOffers = publishedOffers.map((offer) => ({
        ...offer,
        match: matches.get(offer.id),
      }));
      const mergedById = new Map(mergedOffers.map((offer) => [offer.id, offer]));

      setOffers(mergedOffers);
      setRecommendedOffers(
        recommended
          .filter((offer) => offer.match?.isAvailable)
          .map((offer) => mergedById.get(offer.id) ?? offer),
      );

      if (recommendationsResult.status === 'rejected') {
        setRecommendationsMessage(recommendationMessage(recommendationsResult.reason));
      }
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [load, revision]);

  const refresh = useCallback(() => load(true), [load]);
  const findOffer = useCallback(
    (id: string) => offers.find((offer) => offer.id === id),
    [offers],
  );
  const cacheOfferMatch = useCallback((id: string, match: OfferMatch) => {
    const addMatch = (offer: Offer) => offer.id === id ? { ...offer, match } : offer;
    setOffers((current) => current.map(addMatch));
    setRecommendedOffers((current) => current.map(addMatch));
  }, []);
  const value = useMemo<OffersContextValue>(() => ({
    offers,
    recommendedOffers,
    isLoading,
    isRefreshing,
    error,
    recommendationsMessage,
    refresh,
    findOffer,
    cacheOfferMatch,
  }), [
    offers,
    recommendedOffers,
    isLoading,
    isRefreshing,
    error,
    recommendationsMessage,
    refresh,
    findOffer,
    cacheOfferMatch,
  ]);

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
}

export const useOffers = () => {
  const context = useContext(OffersContext);
  if (!context) throw new Error('useOffers must be used inside OffersProvider');
  return context;
};
