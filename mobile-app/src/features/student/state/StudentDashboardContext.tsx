import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { useApplications } from '@/features/applications/state/ApplicationsContext';
import type { CvDocument } from '@/features/profile/models/cvDocument';
import { useStudentProfile } from '@/features/profile/state/StudentProfileContext';
import {
  getProfileCompletion,
  type ProfileCompletion,
  type StudentProfile,
} from '../models/studentProfile';

type StudentDashboardContextValue = {
  profile: StudentProfile | null;
  latestCv: CvDocument | null;
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
  const { profile, latestCv, isLoading, error, refresh: refreshStudentProfile } = useStudentProfile();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refreshStudentProfile(), refreshApplications()]);
    setIsRefreshing(false);
  }, [refreshApplications, refreshStudentProfile]);
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
