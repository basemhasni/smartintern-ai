import { apiRequest } from '@/core/api/apiClient';
import {
  normalizeStudentCv,
  normalizeStudentProfile,
  type StudentCvSummary,
  type StudentProfile,
} from '../models/studentProfile';

type ProfileResponse = { student?: unknown };
type CvsResponse = { cvs?: unknown[] };
type ApplicationsResponse = { applications?: unknown[] };

export const studentApi = {
  async getCurrentStudentProfile(): Promise<StudentProfile> {
    const response = await apiRequest<ProfileResponse>('/students/profile');
    return normalizeStudentProfile(response.student);
  },

  async getStudentCvs(): Promise<StudentCvSummary[]> {
    const response = await apiRequest<CvsResponse>('/students/cv');
    return Array.isArray(response.cvs) ? response.cvs.map(normalizeStudentCv) : [];
  },

  async getActiveApplicationCount(): Promise<number> {
    const response = await apiRequest<ApplicationsResponse>('/students/applications');
    if (!Array.isArray(response.applications)) return 0;

    return response.applications.filter((item) => {
      if (!item || typeof item !== 'object') return false;
      const status = (item as { status?: unknown }).status;
      return status === 'SENT' || status === 'PENDING';
    }).length;
  },
};
