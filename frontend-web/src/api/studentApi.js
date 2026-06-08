import axiosClient from './axiosClient.js';

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
  return response.data.cvs || [];
};

export const getStudentApplications = async () => {
  const response = await axiosClient.get('/api/students/applications');
  return response.data.applications || [];
};

export const getStudentRecommendations = async (params = {}) => {
  const response = await axiosClient.get('/api/students/recommendations', { params });

  return {
    count: response.data.count || 0,
    recommendations: response.data.recommendations || [],
  };
};
