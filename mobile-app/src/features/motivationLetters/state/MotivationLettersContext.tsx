import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { normalizeApiError } from '@/core/api/apiError';
import { motivationLettersApi } from '../api/motivationLettersApi';
import type { MotivationLetter, MotivationLetterTone } from '../models/motivationLetter';

type MotivationLettersContextValue = {
  letters: MotivationLetter[];
  isLoadingLetters: boolean;
  isLoadingLetter: boolean;
  isGenerating: boolean;
  isUpdating: boolean;
  error: string | null;
  generationError: string | null;
  loadLetters: (refresh?: boolean) => Promise<void>;
  loadLetter: (applicationId: string, refresh?: boolean) => Promise<MotivationLetter | null>;
  generateLetter: (applicationId: string, tone: MotivationLetterTone) => Promise<MotivationLetter | null>;
  updateLetter: (applicationId: string, content: string) => Promise<MotivationLetter | null>;
  findByApplication: (applicationId: string) => MotivationLetter | undefined;
  findByOffer: (offerId: string) => MotivationLetter | undefined;
  clearError: () => void;
};

const MotivationLettersContext = createContext<MotivationLettersContextValue | null>(null);

export function MotivationLettersProvider({ children }: { children: ReactNode }) {
  const [letters, setLetters] = useState<MotivationLetter[]>([]);
  const [isLoadingLetters, setIsLoadingLetters] = useState(false);
  const [isLoadingLetter, setIsLoadingLetter] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const loaded = useRef(false);
  const generating = useRef(false);
  const updating = useRef(false);

  const mergeLetter = useCallback((letter: MotivationLetter) => {
    setLetters((current) => [
      letter,
      ...current.filter((item) => item.id !== letter.id && item.applicationId !== letter.applicationId),
    ]);
    return letter;
  }, []);

  const loadLetters = useCallback(async (refresh = false) => {
    if (loaded.current && !refresh) return;
    setIsLoadingLetters(true);
    setError(null);
    try {
      const result = await motivationLettersApi.getMyLetters();
      setLetters(result);
      loaded.current = true;
    } catch (requestError) {
      setError(normalizeApiError(requestError));
    } finally {
      setIsLoadingLetters(false);
    }
  }, []);

  const loadLetter = useCallback(async (applicationId: string, refresh = false) => {
    const cached = letters.find((item) => item.applicationId === applicationId);
    if (cached && !refresh) return cached;
    setIsLoadingLetter(true);
    setError(null);
    try {
      return mergeLetter(await motivationLettersApi.getForApplication(applicationId));
    } catch (requestError) {
      setError(normalizeApiError(requestError));
      return null;
    } finally {
      setIsLoadingLetter(false);
    }
  }, [letters, mergeLetter]);

  const generateLetter = useCallback(async (applicationId: string, tone: MotivationLetterTone) => {
    if (generating.current) return null;
    generating.current = true;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      return mergeLetter(await motivationLettersApi.generate(applicationId, tone));
    } catch (requestError) {
      setGenerationError(normalizeApiError(requestError));
      return null;
    } finally {
      generating.current = false;
      setIsGenerating(false);
    }
  }, [mergeLetter]);

  const updateLetter = useCallback(async (applicationId: string, content: string) => {
    if (updating.current) return null;
    updating.current = true;
    setIsUpdating(true);
    setError(null);
    try {
      return mergeLetter(await motivationLettersApi.update(applicationId, content));
    } catch (requestError) {
      setError(normalizeApiError(requestError));
      return null;
    } finally {
      updating.current = false;
      setIsUpdating(false);
    }
  }, [mergeLetter]);

  const findByApplication = useCallback(
    (applicationId: string) => letters.find((item) => item.applicationId === applicationId),
    [letters],
  );
  const findByOffer = useCallback(
    (offerId: string) => letters.find((item) => item.offerId === offerId || item.offer?.id === offerId),
    [letters],
  );
  const clearError = useCallback(() => {
    setError(null);
    setGenerationError(null);
  }, []);

  const value = useMemo<MotivationLettersContextValue>(() => ({
    letters,
    isLoadingLetters,
    isLoadingLetter,
    isGenerating,
    isUpdating,
    error,
    generationError,
    loadLetters,
    loadLetter,
    generateLetter,
    updateLetter,
    findByApplication,
    findByOffer,
    clearError,
  }), [letters, isLoadingLetters, isLoadingLetter, isGenerating, isUpdating, error, generationError, loadLetters, loadLetter, generateLetter, updateLetter, findByApplication, findByOffer, clearError]);

  return <MotivationLettersContext.Provider value={value}>{children}</MotivationLettersContext.Provider>;
}

export const useMotivationLetters = () => {
  const context = useContext(MotivationLettersContext);
  if (!context) throw new Error('useMotivationLetters must be used inside MotivationLettersProvider');
  return context;
};

