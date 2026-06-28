import axios from 'axios';

import { clearSession } from '../utils/auth.js';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
      clearSession();

      const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(window.location.pathname);

      if (!isAuthPage) {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
