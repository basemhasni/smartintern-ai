import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axiosClient from '../api/axiosClient.js';
import { clearSession, getDashboardPathByRole, readStoredUser, saveSession, TOKEN_STORAGE_KEY } from '../utils/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  const setSession = useCallback((nextToken, nextUser) => {
    saveSession({ token: nextToken, user: nextUser });
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const resetSession = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      resetSession();
      return null;
    }

    const response = await axiosClient.get('/api/auth/me');
    const nextUser = response.data.user;
    setSession(storedToken, nextUser);
    return nextUser;
  }, [resetSession, setSession]);

  useEffect(() => {
    let isMounted = true;

    const restore = async () => {
      try {
        await refreshUser();
      } catch (error) {
        resetSession();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restore();

    return () => {
      isMounted = false;
    };
  }, [refreshUser, resetSession]);

  const login = useCallback(async (email, password) => {
    const response = await axiosClient.post('/api/auth/login', { email, password });
    const nextUser = response.data.user;
    const nextToken = response.data.token;
    setSession(nextToken, nextUser);
    return nextUser;
  }, [setSession]);

  const register = useCallback(async (formData) => {
    const response = await axiosClient.post('/api/auth/register', formData);
    const nextUser = response.data.user;
    const nextToken = response.data.token;
    setSession(nextToken, nextUser);
    return nextUser;
  }, [setSession]);

  const logout = useCallback(() => {
    resetSession();
    navigate('/login', { replace: true });
  }, [navigate, resetSession]);

  const value = useMemo(() => ({
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    getDashboardPath: () => getDashboardPathByRole(user?.role),
  }), [isLoading, login, logout, refreshUser, register, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
