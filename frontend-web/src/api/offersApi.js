import axiosClient from './axiosClient.js';

export const getPublishedOffers = async () => {
  const response = await axiosClient.get('/api/offers');
  return response.data.offers || [];
};

export const getOfferById = async (id) => {
  const response = await axiosClient.get(`/api/offers/${id}`);
  return response.data.offer;
};

export const getStudentRecommendations = async (params = {}) => {
  const response = await axiosClient.get('/api/students/recommendations', { params });

  return {
    count: response.data.count || 0,
    recommendations: response.data.recommendations || [],
  };
};

export const getOfferMatching = async (id) => {
  const response = await axiosClient.get(`/api/offers/${id}/match`);
  return response.data.matching;
};
