import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { getStudentApplications, getStudentCvs, getStudentProfile, getStudentRecommendations } from '../../api/studentApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import ApplicationStatusSummary from '../../components/student/ApplicationStatusSummary.jsx';
import CvStatusCard from '../../components/student/CvStatusCard.jsx';
import ProfileCompletionCard from '../../components/student/ProfileCompletionCard.jsx';
import RecommendedOffersPreview from '../../components/student/RecommendedOffersPreview.jsx';
import SkillsOverview from '../../components/student/SkillsOverview.jsx';
import StudentQuickActions from '../../components/student/StudentQuickActions.jsx';
import StudentStatsGrid from '../../components/student/StudentStatsGrid.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getLatestCv } from '../../utils/studentDashboard.js';

const getSectionErrorMessage = (error) => {
  if (!error.response) {
    return 'Impossible de charger cette section. Verifiez que le backend est demarre.';
  }

  return error.response.data?.message || 'Cette section est temporairement indisponible.';
};

function StudentDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [errors, setErrors] = useState({});

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrors({});

    const [profileResult, cvResult, applicationResult, recommendationResult] = await Promise.allSettled([
      getStudentProfile(),
      getStudentCvs(),
      getStudentApplications(),
      getStudentRecommendations({ limit: 3, minScore: 0 }),
    ]);

    if (profileResult.status === 'fulfilled') {
      setProfile(profileResult.value);
    } else {
      setProfile(null);
      setErrors((current) => ({ ...current, profile: getSectionErrorMessage(profileResult.reason) }));
    }

    if (cvResult.status === 'fulfilled') {
      setCvs(cvResult.value);
    } else {
      setCvs([]);
      setErrors((current) => ({ ...current, cvs: getSectionErrorMessage(cvResult.reason) }));
    }

    if (applicationResult.status === 'fulfilled') {
      setApplications(applicationResult.value);
    } else {
      setApplications([]);
      setErrors((current) => ({ ...current, applications: getSectionErrorMessage(applicationResult.reason) }));
    }

    if (recommendationResult.status === 'fulfilled') {
      setRecommendations(recommendationResult.value.recommendations);
    } else {
      setRecommendations([]);
      setErrors((current) => ({ ...current, recommendations: getSectionErrorMessage(recommendationResult.reason) }));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const latestCv = useMemo(() => getLatestCv(cvs), [cvs]);
  const firstName = profile?.user?.firstName || user?.firstName;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (errors.profile || !profile) {
    return (
      <ErrorState
        title="Profil etudiant indisponible"
        message={errors.profile || 'Impossible de charger votre profil etudiant.'}
        onRetry={loadDashboard}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="overflow-hidden rounded-stitch border border-line bg-white p-6 shadow-panel">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Dashboard etudiant</p>
            <h1 className="mt-2 text-2xl font-black leading-tight text-ink md:text-3xl">
              Bonjour {firstName}, pret a faire avancer votre recherche ?
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Votre espace rassemble votre profil, vos recommandations et le suivi de vos candidatures.
            </p>
          </div>
          <Link
            className="inline-flex justify-center rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel transition hover:-translate-y-0.5"
            to={latestCv ? '/student/offers' : '/student/cv'}
          >
            {latestCv ? 'Voir mes recommandations' : 'Importer mon CV'}
          </Link>
        </div>
      </section>

      <StudentStatsGrid latestCv={latestCv} recommendations={recommendations} applications={applications} />

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <RecommendedOffersPreview
            recommendations={recommendations}
            latestCv={latestCv}
            error={errors.recommendations}
            onRetry={loadDashboard}
          />
          {errors.applications ? (
            <ErrorState title="Candidatures indisponibles" message={errors.applications} onRetry={loadDashboard} />
          ) : (
            <ApplicationStatusSummary applications={applications} />
          )}
          <StudentQuickActions />
        </div>

        <div className="space-y-5">
          <ProfileCompletionCard student={profile} />
          {errors.cvs ? (
            <ErrorState title="CV indisponibles" message={errors.cvs} onRetry={loadDashboard} />
          ) : (
            <CvStatusCard latestCv={latestCv} />
          )}
          <SkillsOverview latestCv={latestCv} recommendations={recommendations} />
        </div>
      </div>
    </div>
  );
}

export default StudentDashboardPage;
