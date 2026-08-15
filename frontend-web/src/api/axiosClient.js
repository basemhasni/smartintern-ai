import axios from 'axios';

import { attachCsrfHeader, clearCsrfToken, isMutatingMethod } from './csrfService.js';
import { clearSession } from '../utils/auth.js';
import { normalizeApiError } from './apiError.js';

const apiTimeout = Number.parseInt(import.meta.env.VITE_API_TIMEOUT_MS, 10) || 15000;
const createRequestId = () => globalThis.crypto?.randomUUID?.() || `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: apiTimeout,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => attachCsrfHeader({
  ...config,
  headers: {
    ...(config.headers || {}),
    'X-Request-ID': config.headers?.['X-Request-ID'] || createRequestId(),
  },
}));

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    error.normalized = normalizeApiError(error);
    const originalRequest = error.config || {};

    if (
      error.response?.status === 403
      && isMutatingMethod(originalRequest.method)
      && !originalRequest.skipCsrf
      && !originalRequest._csrfRetry
      && String(error.response.data?.message || '').toLowerCase().includes('csrf')
    ) {
      clearCsrfToken();
      const retryRequest = await attachCsrfHeader({
        ...originalRequest,
        _csrfRetry: true,
      }, { forceRefresh: true });
      return axiosClient(retryRequest);
    }

    if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
      clearSession();
      clearCsrfToken();

      const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(window.location.pathname);

      if (!isAuthPage) {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
