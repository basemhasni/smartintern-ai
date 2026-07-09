import { apiRequest } from '@/core/api/apiClient';
import type {
  AuthResponse,
  ForgotPasswordResponse,
  RegisterPayload,
} from '../models/authResponse';

export const authApi = {
  login(email: string, password: string) {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
  },

  register(payload: RegisterPayload) {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({
        ...payload,
        email: payload.email.trim().toLowerCase(),
      }),
    });
  },

  forgotPassword(email: string) {
    return apiRequest<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
  },

  me() {
    return apiRequest<AuthResponse>('/auth/me');
  },

  logout() {
    return apiRequest<{ message?: string }>('/auth/logout', {
      method: 'POST',
    });
  },
};
