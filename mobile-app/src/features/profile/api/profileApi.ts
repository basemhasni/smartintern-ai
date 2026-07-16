import { apiRequest } from '@/core/api/apiClient';
import type { StudentProfile } from '@/features/student/models/studentProfile';
import type { StudentProfileUpdate } from '../models/profileUpdate';
import { normalizeStudentProfile } from '../utils/normalizeStudentProfile';

export const profileApi = {
  async getMyProfile(): Promise<StudentProfile> {
    const response = await apiRequest<{ student?: unknown }>('/students/profile');
    return normalizeStudentProfile(response.student);
  },

  async updateMyProfile(payload: StudentProfileUpdate): Promise<StudentProfile> {
    const response = await apiRequest<{ student?: unknown }>('/students/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeStudentProfile(response.student);
  },
};

