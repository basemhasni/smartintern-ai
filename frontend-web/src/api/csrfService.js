import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

let csrfToken = null;
let csrfRequest = null;

const csrfClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

export const isMutatingMethod = (method) => MUTATING_METHODS.has(String(method || 'get').toLowerCase());

export const clearCsrfToken = () => {
  csrfToken = null;
  csrfRequest = null;
};

export const getCsrfToken = async ({ forceRefresh = false } = {}) => {
  if (csrfToken && !forceRefresh) {
    return csrfToken;
  }

  if (!csrfRequest || forceRefresh) {
    csrfRequest = csrfClient.get('/api/auth/csrf-token').then((response) => {
      csrfToken = response.data.csrfToken;
      return csrfToken;
    }).finally(() => {
      csrfRequest = null;
    });
  }

  return csrfRequest;
};

export const attachCsrfHeader = async (config, { forceRefresh = false } = {}) => {
  if (!isMutatingMethod(config.method) || config.skipCsrf) {
    return config;
  }

  const nextToken = await getCsrfToken({ forceRefresh });

  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      [CSRF_HEADER_NAME]: nextToken,
    },
  };
};

