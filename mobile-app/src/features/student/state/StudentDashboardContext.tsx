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

import { ApiError, normalizeApiError } from '@/core/api/apiError';
import { useApplications } from '@/features/applications/state/ApplicationsContext';
import { studentApi } from '../api/studentApi';
import {
  getProfileCompletion,
  type ProfileCompletion,
  type StudentCvSummary,
  type StudentProfile,
} from '../models/studentProfile';

type StudentDashboardContextValue = {
  profile: StudentProfile | null;
  latestCv: StudentCvSummary | null;
  profileCompletion: ProfileCompletion;
  activeApplicationCount: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const StudentDashboardContext = createContext<StudentDashboardContextValue | null>(null);

export function StudentDashboardProvider({ children }: { children: ReactNode }) {
  const { applications, refresh: refreshApplications } = useApplications();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [latestCv, setLatestCv] = useState<StudentCvSummary | null>(null);
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

    const [profileResult, cvsResult] = await Promise.allSettled([
      studentApi.getCurrentStudentProfile(),
      studentApi.getStudentCvs(),
    ]);

    if (!mounted.current || currentRequest !== requestId.current) return;

    if (profileResult.status === 'fulfilled') {
      setProfile(profileResult.value);
    } else if (profileResult.reason instanceof ApiError && profileResult.reason.status === 404) {
      setProfile(null);
    } else {
      setError(normalizeApiError(profileResult.reason));
    }

    setLatestCv(cvsResult.status === 'fulfilled' ? cvsResult.value[0] ?? null : null);
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [load]);

  const refresh = useCallback(async () => {
    await Promise.all([load(true), refreshApplications()]);
  }, [load, refreshApplications]);
  const activeApplicationCount = useMemo(
    () => applications.filter(
      (application) => application.status === 'SENT' || application.status === 'PENDING',
    ).length,
    [applications],
  );
  const profileCompletion = useMemo(
    () => getProfileCompletion(profile, latestCv),
    [latestCv, profile],
  );
  const value = useMemo<StudentDashboardContextValue>(() => ({
    profile,
    latestCv,
    profileCompletion,
    activeApplicationCount,
    isLoading,
    isRefreshing,
    error,
    refresh,
  }), [
    profile,
    latestCv,
    profileCompletion,
    activeApplicationCount,
    isLoading,
    isRefreshing,
    error,
    refresh,
  ]);

  return (
    <StudentDashboardContext.Provider value={value}>
      {children}
    </StudentDashboardContext.Provider>
  );
}

export const useStudentDashboard = () => {
  const context = useContext(StudentDashboardContext);
  if (!context) throw new Error('useStudentDashboard must be used inside StudentDashboardProvider');
  return context;
};
