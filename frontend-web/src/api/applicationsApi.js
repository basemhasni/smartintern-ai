import axiosClient from './axiosClient.js';

export const applyToOffer = async (offerId, payload = {}) => {
  const response = await axiosClient.post(`/api/offers/${offerId}/apply`, payload);
  return response.data.application;
};

export const getStudentApplications = async () => {
  const response = await axiosClient.get('/api/students/applications');
  return Array.isArray(response.data?.applications) ? response.data.applications : [];
};
