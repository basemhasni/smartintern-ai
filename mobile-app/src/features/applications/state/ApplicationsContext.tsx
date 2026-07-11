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
import type { ApplicationStatusFilter } from '../models/applicationStatus';

type ApplicationsContextValue = {
  applications: StudentApplication[];
  filteredApplications: StudentApplication[];
  searchQuery: string;
  selectedStatus: ApplicationStatusFilter;
  page: 1;
  hasMore: false;
  isLoadingMore: false;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  findForOffer: (offerId: string) => StudentApplication | undefined;
  findById: (applicationId: string) => StudentApplication | undefined;
  addApplication: (application: StudentApplication) => void;
  addOrUpdateApplication: (application: StudentApplication) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: ApplicationStatusFilter) => void;
  clearError: () => void;
};

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setStatusFilter] = useState<ApplicationStatusFilter>('ALL');
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
      const response = await applicationsApi.getMyApplications();
      if (mounted.current && currentRequest === requestId.current) {
        setApplications(response.items);
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
  const findById = useCallback(
    (applicationId: string) => applications.find((application) => application.id === applicationId),
    [applications],
  );
  const addOrUpdateApplication = useCallback((application: StudentApplication) => {
    setApplications((current) => [
      application,
      ...current.filter((item) => item.id !== application.id && item.offerId !== application.offerId),
    ]);
  }, []);
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase('fr');
  const filteredApplications = useMemo(() => applications.filter((application) => {
    if (selectedStatus !== 'ALL' && application.status !== selectedStatus) return false;
    if (!normalizedQuery) return true;
    const offer = application.offer;
    return [offer?.title, offer?.company.companyName, offer?.location, application.message]
      .some((value) => value?.toLocaleLowerCase('fr').includes(normalizedQuery));
  }), [applications, normalizedQuery, selectedStatus]);
  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<ApplicationsContextValue>(() => ({
    applications,
    filteredApplications,
    searchQuery,
    selectedStatus,
    page: 1,
    hasMore: false,
    isLoadingMore: false,
    isLoading,
    isRefreshing,
    error,
    refresh,
    findForOffer,
    findById,
    addApplication: addOrUpdateApplication,
    addOrUpdateApplication,
    setSearchQuery,
    setStatusFilter,
    clearError,
  }), [applications, filteredApplications, searchQuery, selectedStatus, isLoading, isRefreshing, error, refresh, findForOffer, findById, addOrUpdateApplication, clearError]);

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (!context) throw new Error('useApplications must be used inside ApplicationsProvider');
  return context;
};
