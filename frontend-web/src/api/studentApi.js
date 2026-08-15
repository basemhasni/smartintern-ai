import axiosClient from './axiosClient.js';

const recommendationRequests = new Map();

export const getStudentProfile = async () => {
  const response = await axiosClient.get('/api/students/profile');
  return response.data.student;
};

export const updateStudentProfile = async (payload) => {
  const response = await axiosClient.put('/api/students/profile', payload);
  return response.data.student;
};

export const getStudentCvs = async () => {
  const response = await axiosClient.get('/api/students/cv');
  return Array.isArray(response.data?.cvs) ? response.data.cvs : [];
};

export const getStudentApplications = async () => {
  const response = await axiosClient.get('/api/students/applications');
  return Array.isArray(response.data?.applications) ? response.data.applications : [];
};

export const getStudentRecommendations = async (params = {}) => {
  const key = JSON.stringify(params);
  if (recommendationRequests.has(key)) return recommendationRequests.get(key);

  const request = axiosClient.get('/api/students/recommendations', { params })
    .then((response) => ({
      count: Number(response.data?.count) || 0,
      recommendations: Array.isArray(response.data?.recommendations) ? response.data.recommendations : [],
    }))
    .finally(() => {
      globalThis.setTimeout(() => recommendationRequests.delete(key), 0);
    });

  recommendationRequests.set(key, request);
  return request;
};
