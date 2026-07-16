import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { ApiError, normalizeApiError } from '@/core/api/apiError';
import { careerAssistantApi } from '../api/careerAssistantApi';
import type { CareerAdviceResult, CareerAnswer } from '../models/careerAdvice';
import { useStudentProfile } from '@/features/profile/state/StudentProfileContext';

type ContextValue = {
  getAdvice: (offerId: string) => CareerAdviceResult | undefined;
  getGeneratedAt: (offerId: string) => string | undefined;
  getAnswers: (offerId: string) => CareerAnswer[];
  generate: (offerId: string) => Promise<void>;
  ask: (offerId: string, question: string) => Promise<boolean>;
  isGenerating: boolean;
  isSubmittingQuestion: boolean;
  error: string | null;
  clearError: () => void;
  clearAnswers: (offerId: string) => void;
};

const CareerAssistantContext = createContext<ContextValue | null>(null);
const errorMessage = (error: unknown) => {
  if (error instanceof ApiError && error.status === 400 && /analyzed cv|candidate skills/i.test(error.message)) return 'Completez votre profil et ajoutez un CV analyse pour recevoir des conseils personnalises.';
  if (error instanceof ApiError && error.status === 413) return 'Votre question est trop longue. Limitez-la a 500 caracteres.';
  if (error instanceof ApiError && [502, 503, 504].includes(error.status ?? 0)) return 'L assistant carriere est temporairement indisponible. Reessayez plus tard.';
  return normalizeApiError(error);
};

export function CareerAssistantProvider({ children }: { children: ReactNode }) {
  const { revision } = useStudentProfile();
  const [advice, setAdvice] = useState<Record<string, CareerAdviceResult>>({});
  const [generatedAt, setGeneratedAt] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, CareerAnswer[]>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);

  const cacheKey = useCallback((offerId: string) => `${offerId}:${revision}`, [revision]);
  const request = useCallback(async (offerId: string, question?: string) => {
    if (running.current) return null;
    running.current = true;
    setError(null);
    try {
      const result = await careerAssistantApi.generate(offerId, question);
      const key = cacheKey(offerId);
      setAdvice((current) => ({ ...current, [key]: result }));
      setGeneratedAt((current) => ({ ...current, [key]: new Date().toISOString() }));
      return result;
    } catch (requestError) {
      setError(errorMessage(requestError));
      return null;
    } finally {
      running.current = false;
    }
  }, [cacheKey]);

  const generate = useCallback(async (offerId: string) => {
    setIsGenerating(true);
    await request(offerId);
    setIsGenerating(false);
  }, [request]);

  const ask = useCallback(async (offerId: string, question: string) => {
    const trimmed = question.trim();
    if (!trimmed || trimmed.length > 500) return false;
    setIsSubmittingQuestion(true);
    const result = await request(offerId, trimmed);
    setIsSubmittingQuestion(false);
    if (!result) return false;
    const answer: CareerAnswer = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, question: trimmed, answer: result.directAnswer ?? result.finalAdvice, intent: result.questionIntent, createdAt: new Date().toISOString() };
    const key = cacheKey(offerId);
    setAnswers((current) => ({ ...current, [key]: [answer, ...(current[key] ?? [])].slice(0, 10) }));
    return true;
  }, [cacheKey, request]);

  const value = useMemo<ContextValue>(() => ({ getAdvice: (offerId) => advice[cacheKey(offerId)], getGeneratedAt: (offerId) => generatedAt[cacheKey(offerId)], getAnswers: (offerId) => answers[cacheKey(offerId)] ?? [], generate, ask, isGenerating, isSubmittingQuestion, error, clearError: () => setError(null), clearAnswers: (offerId) => setAnswers((current) => ({ ...current, [cacheKey(offerId)]: [] })) }), [advice, generatedAt, answers, generate, ask, isGenerating, isSubmittingQuestion, error, cacheKey]);
  return <CareerAssistantContext.Provider value={value}>{children}</CareerAssistantContext.Provider>;
}

export const useCareerAssistant = () => {
  const context = useContext(CareerAssistantContext);
  if (!context) throw new Error('useCareerAssistant must be used inside CareerAssistantProvider');
  return context;
};
