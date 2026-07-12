import { apiRequest } from '@/core/api/apiClient';
import type { CareerAdviceResult } from '../models/careerAdvice';
import { normalizeCareerAdvice } from '../utils/normalizeCareerAdvice';

export const careerAssistantApi = {
  async generate(offerId: string, question?: string): Promise<CareerAdviceResult> {
    const response = await apiRequest<unknown>('/students/career-assistant', { method: 'POST', body: JSON.stringify({ offerId, ...(question ? { question } : {}) }), timeoutMs: 30_000 });
    return normalizeCareerAdvice(response);
  },
};
