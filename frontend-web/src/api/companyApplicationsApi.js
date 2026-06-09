import axiosClient from './axiosClient.js';

export const getOfferApplications = async (offerId) => {
  const response = await axiosClient.get(`/api/companies/offers/${offerId}/applications`);
  return response.data.applications || [];
};

export const getOfferCandidateRanking = async (offerId, params = {}) => {
  const response = await axiosClient.get(`/api/companies/offers/${offerId}/candidates/ranking`, { params });

  return {
    offer: response.data.offer,
    count: response.data.count || 0,
    candidates: response.data.candidates || [],
  };
};
