import type { AuthUser, UserRole } from './userModel';

export type AuthResponse = {
  message?: string;
  user?: AuthUser;
  accessToken?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
};

export type ForgotPasswordResponse = {
  message?: string;
  devResetLink?: string;
  devNotice?: string;
};
