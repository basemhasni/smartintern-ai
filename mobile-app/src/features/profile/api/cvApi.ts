import { apiRequest } from '@/core/api/apiClient';
import type { CvDocument, CvUploadResult, SelectedCvFile } from '../models/cvDocument';
import { normalizeCvDocument, normalizeCvList } from '../utils/normalizeCvDocument';
import { getCvMimeType } from '../utils/validateCvFile';

export const cvApi = {
  async getMyCvs(): Promise<CvDocument[]> {
    return normalizeCvList(await apiRequest<unknown>('/students/cv'));
  },

  async getById(cvId: string): Promise<CvDocument> {
    const response = await apiRequest<{ cv?: unknown }>(`/students/cv/${encodeURIComponent(cvId)}`);
    return normalizeCvDocument(response.cv);
  },

  async upload(file: SelectedCvFile): Promise<CvUploadResult> {
    const formData = new FormData();
    if (file.file) {
      formData.append('cv', file.file, file.name);
    } else {
      formData.append('cv', {
        uri: file.uri,
        name: file.name,
        type: getCvMimeType(file),
      } as unknown as Blob);
    }
    const response = await apiRequest<{ message?: string; cv?: unknown; ragIndexed?: boolean }>('/students/cv/upload', {
      method: 'POST',
      body: formData,
      timeoutMs: 120_000,
    });
    const cv = normalizeCvDocument(response.cv);
    return {
      cv,
      message: response.message ?? 'CV envoye avec succes.',
      analysisFailed: cv.status === 'ANALYSIS_FAILED',
      ragIndexed: response.ragIndexed === true,
    };
  },

  async delete(cvId: string): Promise<void> {
    await apiRequest(`/students/cv/${encodeURIComponent(cvId)}`, { method: 'DELETE' });
  },
};
