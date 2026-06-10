import axiosClient from './axiosClient.js';

export const getCandidateRanking = async (offerId, params = {}) => {
  const response = await axiosClient.get(`/api/companies/offers/${offerId}/candidates/ranking`, {
    params,
  });

  return {
    message: response.data.message,
    offer: response.data.offer,
    count: response.data.count || 0,
    candidates: response.data.candidates || [],
  };
};
