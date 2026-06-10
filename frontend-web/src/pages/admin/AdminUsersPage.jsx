import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { getAdminUsers, updateAdminUserStatus } from '../../api/adminApi.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import AdminPagination from '../../components/admin/AdminPagination.jsx';
import AdminUsersFilters from '../../components/admin/AdminUsersFilters.jsx';
import AdminUsersList from '../../components/admin/AdminUsersList.jsx';
import UserStatusDialog from '../../components/admin/UserStatusDialog.jsx';
import { getAdminErrorMessage, normalizeAdminUser, normalizePagination } from '../../utils/admin.js';

const initialFilters = {
  search: '',
  role: '',
  isActive: '',
};

function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [shouldRedirectDenied, setShouldRedirectDenied] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getAdminUsers({ ...filters, page, limit: 20 });
      setUsers((response.users || []).map(normalizeAdminUser));
      setPagination(normalizePagination(response.pagination));
    } catch (loadError) {
      const readableError = getAdminErrorMessage(loadError, 'Impossible de charger les utilisateurs.');
      if (readableError === 'FORBIDDEN') setShouldRedirectDenied(true);
      else setError(readableError);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const handleStatusUpdate = async (isActive) => {
    if (!targetUser) return;
    setIsUpdating(true);
    setDialogError('');
    try {
      const response = await updateAdminUserStatus(targetUser.id, isActive);
      const updatedUser = normalizeAdminUser(response.user);
      setUsers((current) => current.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
      setTargetUser(null);
      setSuccessMessage(isActive ? 'Compte reactive avec succes.' : 'Compte desactive avec succes.');
    } catch (updateError) {
      const readableError = getAdminErrorMessage(updateError);
      if (readableError === 'FORBIDDEN') setShouldRedirectDenied(true);
      else setDialogError(readableError);
    } finally {
      setIsUpdating(false);
    }
  };

  if (shouldRedirectDenied) return <Navigate to="/access-denied" replace />;

  return (
    <div className="space-y-6">
      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Administration</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-ink md:text-4xl">Utilisateurs</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Consultez les comptes, filtrez par role ou statut, puis activez ou desactivez un utilisateur sans modifier son role.
        </p>
      </section>

      {successMessage ? <p className="rounded-stitch border border-green-100 bg-green-50 px-5 py-4 text-sm font-bold text-success" aria-live="polite">{successMessage}</p> : null}
      <AdminUsersFilters filters={filters} onChange={handleFilterChange} onReset={() => { setFilters(initialFilters); setPage(1); }} />
      {error ? <ErrorState title="Utilisateurs indisponibles" message={error} onRetry={loadUsers} /> : null}
      {isLoading ? <LoadingSkeleton /> : <AdminUsersList users={users} currentUserId={currentUser?.id} onChangeStatus={(nextUser) => { setTargetUser(nextUser); setDialogError(''); }} />}
      <AdminPagination pagination={pagination} onPageChange={setPage} />
      <UserStatusDialog user={targetUser} isUpdating={isUpdating} error={dialogError} onCancel={() => setTargetUser(null)} onConfirm={handleStatusUpdate} />
    </div>
  );
}

export default AdminUsersPage;
