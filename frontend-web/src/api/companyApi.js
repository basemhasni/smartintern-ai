import axiosClient from './axiosClient.js';

export const getCompanyProfile = async () => {
  const response = await axiosClient.get('/api/companies/profile');
  return response.data.company;
};
