import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axiosClient from '../api/axiosClient.js';
import { clearSession, getDashboardPathByRole, readStoredUser, saveSession } from '../utils/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  const setSession = useCallback((nextUser) => {
    saveSession({ user: nextUser });
    setUser(nextUser);
  }, []);

  const resetSession = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await axiosClient.get('/api/auth/me', { skipAuthRedirect: true });
    const nextUser = response.data.user;
    setSession(nextUser);
    return nextUser;
  }, [setSession]);

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
    setSession(nextUser);
    return nextUser;
  }, [setSession]);

  const register = useCallback(async (formData) => {
    const response = await axiosClient.post('/api/auth/register', formData);
    const nextUser = response.data.user;
    setSession(nextUser);
    return nextUser;
  }, [setSession]);

  const logout = useCallback(async () => {
    try {
      await axiosClient.post('/api/auth/logout', null, { skipAuthRedirect: true });
    } catch (error) {
      // Local cleanup still happens if the backend is unreachable.
    } finally {
      resetSession();
      navigate('/login', { replace: true });
    }
  }, [navigate, resetSession]);

  const value = useMemo(() => ({
    user,
    token: null,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    getDashboardPath: () => getDashboardPathByRole(user?.role),
  }), [isLoading, login, logout, refreshUser, register, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
