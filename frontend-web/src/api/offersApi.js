import axiosClient from './axiosClient.js';

const matchingRequests = new Map();
const recommendationRequests = new Map();
const asArray = (value) => (Array.isArray(value) ? value : []);

export const getPublishedOffers = async () => {
  const response = await axiosClient.get('/api/offers');
  return asArray(response.data?.offers);
};

export const getOfferById = async (id) => {
  const response = await axiosClient.get(`/api/offers/${id}`);
  return response.data?.offer && typeof response.data.offer === 'object' ? response.data.offer : null;
};

export const getStudentRecommendations = async (params = {}) => {
  const key = JSON.stringify(params);
  if (recommendationRequests.has(key)) return recommendationRequests.get(key);

  const request = axiosClient.get('/api/students/recommendations', { params })
    .then((response) => ({
      count: Number(response.data?.count) || 0,
      recommendations: asArray(response.data?.recommendations),
    }))
    .finally(() => {
      globalThis.setTimeout(() => recommendationRequests.delete(key), 0);
    });

  recommendationRequests.set(key, request);
  return request;
};

export const getOfferMatching = async (id) => {
  const key = String(id || '');
  if (matchingRequests.has(key)) return matchingRequests.get(key);

  const request = axiosClient.get(`/api/offers/${id}/match`)
    .then((response) => response.data?.matching || null)
    .finally(() => {
      globalThis.setTimeout(() => matchingRequests.delete(key), 0);
    });

  matchingRequests.set(key, request);
  return request;
};
