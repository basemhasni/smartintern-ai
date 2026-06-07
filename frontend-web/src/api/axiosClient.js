import axios from 'axios';

import { clearSession, TOKEN_STORAGE_KEY } from '../utils/auth.js';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();

      const isAuthPage = ['/login', '/register'].includes(window.location.pathname);

      if (!isAuthPage) {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
