import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { normalizeApiError } from '@/core/api/apiError';
import { applicationsApi } from '../api/applicationsApi';
import type { StudentApplication } from '../models/application';

type ApplicationsContextValue = {
  applications: StudentApplication[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  findForOffer: (offerId: string) => StudentApplication | undefined;
  addApplication: (application: StudentApplication) => void;
};

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  const load = useCallback(async (refreshing: boolean) => {
    const currentRequest = ++requestId.current;
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const nextApplications = await applicationsApi.getMyApplications();
      if (mounted.current && currentRequest === requestId.current) {
        setApplications(nextApplications);
      }
    } catch (requestError) {
      if (mounted.current && currentRequest === requestId.current) {
        setError(normalizeApiError(requestError));
      }
    } finally {
      if (mounted.current && currentRequest === requestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void load(false), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);
  const findForOffer = useCallback(
    (offerId: string) => applications.find((application) => application.offerId === offerId),
    [applications],
  );
  const addApplication = useCallback((application: StudentApplication) => {
    setApplications((current) => [
      application,
      ...current.filter((item) => item.offerId !== application.offerId),
    ]);
  }, []);

  const value = useMemo<ApplicationsContextValue>(() => ({
    applications,
    isLoading,
    isRefreshing,
    error,
    refresh,
    findForOffer,
    addApplication,
  }), [applications, isLoading, isRefreshing, error, refresh, findForOffer, addApplication]);

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (!context) throw new Error('useApplications must be used inside ApplicationsProvider');
  return context;
};
