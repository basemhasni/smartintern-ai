import { ApiError } from '@/core/api/apiError';
import { apiRequest } from '@/core/api/apiClient';
import type { MotivationLetter, MotivationLetterTone } from '../models/motivationLetter';
import { normalizeMotivationLetter, normalizeMotivationLettersResponse } from '../utils/normalizeMotivationLetter';

const ensureContent = (letter: MotivationLetter) => {
  if (!letter.content) throw new ApiError('La generation n a retourne aucun contenu exploitable.', 502);
  return letter;
};

export const motivationLettersApi = {
  async getMyLetters(): Promise<MotivationLetter[]> {
    return normalizeMotivationLettersResponse(await apiRequest<unknown>('/applications/motivation-letters'));
  },

  async getForApplication(applicationId: string): Promise<MotivationLetter> {
    const response = await apiRequest<unknown>(`/applications/${encodeURIComponent(applicationId)}/motivation-letter`);
    return ensureContent(normalizeMotivationLetter(response));
  },

  async generate(applicationId: string, tone: MotivationLetterTone): Promise<MotivationLetter> {
    const response = await apiRequest<unknown>(`/applications/${encodeURIComponent(applicationId)}/generate-letter`, {
      method: 'POST',
      body: JSON.stringify({ tone }),
      timeoutMs: 120_000,
    });
    return ensureContent(normalizeMotivationLetter(response));
  },

  async update(applicationId: string, content: string): Promise<MotivationLetter> {
    const response = await apiRequest<unknown>(`/applications/${encodeURIComponent(applicationId)}/motivation-letter`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    return ensureContent(normalizeMotivationLetter(response));
  },
};

