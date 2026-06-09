import axiosClient from './axiosClient.js';

export const getCompanyProfile = async () => {
  const response = await axiosClient.get('/api/companies/profile');
  return response.data.company;
};

export const updateCompanyProfile = async (payload) => {
  const response = await axiosClient.put('/api/companies/profile', payload);
  return response.data.company;
};
