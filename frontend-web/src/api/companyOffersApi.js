import axiosClient from './axiosClient.js';

export const getCompanyOffers = async () => {
  const response = await axiosClient.get('/api/companies/offers');
  return response.data.offers || [];
};

export const getCompanyOfferById = async (id) => {
  const response = await axiosClient.get(`/api/companies/offers/${id}`);
  return response.data.offer;
};
