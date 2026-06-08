import axiosClient from './axiosClient.js';

export const generateMotivationLetter = async (applicationId, payload = {}) => {
  const response = await axiosClient.post(`/api/applications/${applicationId}/generate-letter`, payload);
  return response.data.motivationLetter;
};

export const getMotivationLetter = async (applicationId) => {
  const response = await axiosClient.get(`/api/applications/${applicationId}/motivation-letter`);
  return response.data.motivationLetter;
};

export const updateMotivationLetter = async (applicationId, payload) => {
  const response = await axiosClient.put(`/api/applications/${applicationId}/motivation-letter`, payload);
  return response.data.motivationLetter;
};
