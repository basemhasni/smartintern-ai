import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { getAdminDashboard } from '../../api/adminApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import AdminEmptyState from '../../components/admin/AdminEmptyState.jsx';
import AdminRecentCompanies from '../../components/admin/AdminRecentCompanies.jsx';
import AdminRecentOffers from '../../components/admin/AdminRecentOffers.jsx';
import AdminRecentUsers from '../../components/admin/AdminRecentUsers.jsx';
import AdminStatsGrid from '../../components/admin/AdminStatsGrid.jsx';
import { getAdminErrorMessage, normalizeAdminDashboard } from '../../utils/admin.js';

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [shouldRedirectDenied, setShouldRedirectDenied] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getAdminDashboard();
      setDashboard(normalizeAdminDashboard(response));
    } catch (loadError) {
      const readableError = getAdminErrorMessage(loadError, 'Impossible de charger le dashboard administrateur.');
      if (readableError === 'FORBIDDEN') setShouldRedirectDenied(true);
      else setError(readableError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (shouldRedirectDenied) return <Navigate to="/access-denied" replace />;
  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return <ErrorState title="Dashboard indisponible" message={error} onRetry={loadDashboard} />;
  }

  if (!dashboard) {
    return (
      <AdminEmptyState
        title="Les statistiques apparaitront apres les premieres inscriptions."
        message="Aucune donnee administrateur n est disponible pour le moment."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Pilotage plateforme</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-ink md:text-4xl">Vue d ensemble de la plateforme</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              Suivez les utilisateurs, les entreprises et l activite globale de SmartIntern AI.
            </p>
          </div>
          <Link className="rounded-lg bg-primary px-4 py-3 text-sm font-black text-white shadow-panel" to="/admin/companies?status=PENDING">
            Traiter les entreprises en attente
          </Link>
        </div>
      </section>

      <AdminStatsGrid stats={dashboard.stats} />

      <div className="grid gap-5 xl:grid-cols-3">
        <AdminRecentUsers users={dashboard.recentUsers} />
        <AdminRecentCompanies companies={dashboard.recentCompanies} />
        <AdminRecentOffers offers={dashboard.recentOffers} />
      </div>
    </div>
  );
}

export default AdminDashboardPage;
