import { useCallback, useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { getAdminCompanies, updateAdminCompanyStatus } from '../../api/adminApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import AdminCompaniesFilters from '../../components/admin/AdminCompaniesFilters.jsx';
import AdminCompaniesList from '../../components/admin/AdminCompaniesList.jsx';
import AdminPagination from '../../components/admin/AdminPagination.jsx';
import CompanyStatusHistoryInfo from '../../components/admin/CompanyStatusHistoryInfo.jsx';
import CompanyValidationDialog from '../../components/admin/CompanyValidationDialog.jsx';
import { getAdminErrorMessage, normalizeAdminCompany, normalizePagination } from '../../utils/admin.js';

const initialFilters = {
  search: '',
  status: '',
};

function AdminCompaniesPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({ ...initialFilters, status: searchParams.get('status') || '' });
  const [page, setPage] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [targetCompany, setTargetCompany] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [shouldRedirectDenied, setShouldRedirectDenied] = useState(false);

  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getAdminCompanies({ ...filters, page, limit: 20 });
      setCompanies((response.companies || []).map(normalizeAdminCompany));
      setPagination(normalizePagination(response.pagination));
    } catch (loadError) {
      const readableError = getAdminErrorMessage(loadError, 'Impossible de charger les entreprises.');
      if (readableError === 'FORBIDDEN') setShouldRedirectDenied(true);
      else setError(readableError);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const handleStatusUpdate = async (status) => {
    if (!targetCompany) return;
    setIsUpdating(true);
    setDialogError('');
    try {
      const response = await updateAdminCompanyStatus(targetCompany.id, status);
      const updatedCompany = normalizeAdminCompany(response.company);
      setCompanies((current) => current.map((company) => (company.id === updatedCompany.id ? updatedCompany : company)));
      setTargetCompany(null);
      setTargetStatus('');
      setSuccessMessage('Statut entreprise mis a jour avec succes.');
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
        <h1 className="mt-3 text-3xl font-black tracking-tight text-ink md:text-4xl">Entreprises</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Validez, refusez ou suspendez les profils entreprise a partir des informations declarees.
        </p>
      </section>

      {successMessage ? <p className="rounded-stitch border border-green-100 bg-green-50 px-5 py-4 text-sm font-bold text-success" aria-live="polite">{successMessage}</p> : null}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <AdminCompaniesFilters filters={filters} onChange={handleFilterChange} onReset={() => { setFilters(initialFilters); setPage(1); }} />
          {error ? <ErrorState title="Entreprises indisponibles" message={error} onRetry={loadCompanies} /> : null}
          {isLoading ? <LoadingSkeleton /> : <AdminCompaniesList companies={companies} onChangeStatus={(company, status) => { setTargetCompany(company); setTargetStatus(status); setDialogError(''); }} />}
          <AdminPagination pagination={pagination} onPageChange={setPage} />
        </div>
        <CompanyStatusHistoryInfo />
      </div>
      <CompanyValidationDialog company={targetCompany} status={targetStatus} isUpdating={isUpdating} error={dialogError} onCancel={() => { setTargetCompany(null); setTargetStatus(''); }} onConfirm={handleStatusUpdate} />
    </div>
  );
}

export default AdminCompaniesPage;
