import axiosClient from './axiosClient.js';

export const getCompanyOffers = async () => {
  const response = await axiosClient.get('/api/companies/offers');
  return response.data.offers || [];
};

export const getCompanyOfferById = async (id) => {
  const response = await axiosClient.get(`/api/companies/offers/${id}`);
  return response.data.offer;
};

export const createCompanyOffer = async (payload) => {
  const response = await axiosClient.post('/api/companies/offers', payload);
  return {
    message: response.data.message,
    offer: response.data.offer,
  };
};

export const updateCompanyOffer = async (id, payload) => {
  const response = await axiosClient.put(`/api/companies/offers/${id}`, payload);
  return {
    message: response.data.message,
    offer: response.data.offer,
  };
};

export const deleteOrArchiveCompanyOffer = async (id) => {
  const response = await axiosClient.delete(`/api/companies/offers/${id}`);
  return response.data;
};
