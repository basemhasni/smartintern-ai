import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ApiError, normalizeApiError } from '@/core/api/apiError';
import { setUnauthorizedHandler } from '@/core/api/mobileApiClient';
import {
  clearAuthStorage,
  getAccessToken,
  saveAccessToken,
  saveUserRole,
} from '@/core/storage/secureStorage';
import { authApi } from '../api/authApi';
import type { RegisterPayload } from '../models/authResponse';
import type { AuthUser } from '../models/userModel';

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoringSession: boolean;
  errorMessage: string | null;
  restoreSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<string>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ensureMobileToken = (accessToken?: string) => {
  if (!accessToken) {
    throw new ApiError('Le backend ne retourne pas encore de token mobile.', 500);
  }

  return accessToken;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const persistSession = useCallback(async (token: string, nextUser: AuthUser) => {
    await Promise.all([
      saveAccessToken(token),
      saveUserRole(nextUser.role),
    ]);
    setAccessToken(token);
    setUser(nextUser);
  }, []);

  const restoreSession = useCallback(async () => {
    setIsRestoringSession(true);
    setErrorMessage(null);

    try {
      const token = await getAccessToken();

      if (!token) {
        setAccessToken(null);
        setUser(null);
        return;
      }

      const response = await authApi.me();

      if (!response.user) {
        await clearAuthStorage();
        setAccessToken(null);
        setUser(null);
        return;
      }

      setAccessToken(token);
      setUser(response.user);
      await saveUserRole(response.user.role);
    } catch {
      await clearAuthStorage();
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsRestoringSession(false);
    }
  }, []);

  useEffect(() => {
    const runRestoreSession = async () => {
      await restoreSession();
    };

    void runRestoreSession();
  }, [restoreSession]);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await clearAuthStorage();
      setAccessToken(null);
      setUser(null);
      setErrorMessage('Votre session a expire. Reconnectez-vous.');
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApi.login(email, password);
      const token = ensureMobileToken(response.accessToken);

      if (!response.user) {
        throw new ApiError('Utilisateur introuvable dans la reponse auth.', 500);
      }

      await persistSession(token, response.user);
    } catch (error) {
      const message = normalizeApiError(error);
      setErrorMessage(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApi.register(payload);

      if (response.accessToken && response.user) {
        await persistSession(response.accessToken, response.user);
        return true;
      }

      return false;
    } catch (error) {
      const message = normalizeApiError(error);
      setErrorMessage(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApi.forgotPassword(email);
      return response.message || 'Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.';
    } catch (error) {
      const message = normalizeApiError(error);
      setErrorMessage(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authApi.logout();
    } catch {
      // The local session must still be cleared if the network call fails.
    } finally {
      await clearAuthStorage();
      setAccessToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken),
    isLoading,
    isRestoringSession,
    errorMessage,
    restoreSession,
    login,
    register,
    forgotPassword,
    logout,
    clearError,
  }), [
    user,
    accessToken,
    isLoading,
    isRestoringSession,
    errorMessage,
    restoreSession,
    login,
    register,
    forgotPassword,
    logout,
    clearError,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
