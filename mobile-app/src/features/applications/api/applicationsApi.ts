import { apiRequest } from '@/core/api/apiClient';
import { normalizeApplication, type StudentApplication } from '../models/application';
import { normalizeApplicationsResponse, type ApplicationsCollection } from '../models/paginatedApplications';

type ApplicationsResponse = { applications?: unknown[] };
type ApplicationResponse = { application?: unknown; message?: string };

export const applicationsApi = {
  async getMyApplications(): Promise<ApplicationsCollection> {
    const response = await apiRequest<ApplicationsResponse>('/students/applications');
    return normalizeApplicationsResponse(response);
  },

  async applyToOffer(offerId: string): Promise<StudentApplication> {
    const response = await apiRequest<ApplicationResponse>(
      `/offers/${encodeURIComponent(offerId)}/apply`,
      { method: 'POST', body: JSON.stringify({}) },
    );
    return normalizeApplication(response.application);
  },
};
