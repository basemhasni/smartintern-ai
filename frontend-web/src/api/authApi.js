import axiosClient from './axiosClient.js';

export const forgotPassword = async (email) => {
  const response = await axiosClient.post('/api/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async ({ token, password, confirmPassword }) => {
  const response = await axiosClient.post('/api/auth/reset-password', {
    token,
    password,
    confirmPassword,
  });
  return response.data;
};

