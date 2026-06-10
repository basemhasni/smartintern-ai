import axiosClient from './axiosClient.js';

export const getAdminDashboard = async () => {
  const response = await axiosClient.get('/api/admin/dashboard');
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await axiosClient.get('/api/admin/users', { params });
  return response.data;
};

export const updateAdminUserStatus = async (userId, isActive) => {
  const response = await axiosClient.patch(`/api/admin/users/${userId}/status`, { isActive });
  return {
    message: response.data.message,
    user: response.data.user,
  };
};

export const getAdminCompanies = async (params = {}) => {
  const response = await axiosClient.get('/api/admin/companies', { params });
  return response.data;
};

export const updateAdminCompanyStatus = async (companyId, status) => {
  const response = await axiosClient.patch(`/api/admin/companies/${companyId}/status`, { status });
  return {
    message: response.data.message,
    company: response.data.company,
  };
};
