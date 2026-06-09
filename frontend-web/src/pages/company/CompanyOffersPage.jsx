import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { deleteOrArchiveCompanyOffer, getCompanyOffers } from '../../api/companyOffersApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import CompanyOffersFilters from '../../components/company/offers/CompanyOffersFilters.jsx';
import CompanyOffersHeader from '../../components/company/offers/CompanyOffersHeader.jsx';
import CompanyOffersList from '../../components/company/offers/CompanyOffersList.jsx';
import CompanyOffersStats from '../../components/company/offers/CompanyOffersStats.jsx';
import OfferArchiveDialog from '../../components/company/offers/OfferArchiveDialog.jsx';
import {
  filterAndSortCompanyOffers,
  getOfferStatusCounts,
  getReadableOfferError,
  getUniqueOfferValues,
  normalizeCompanyOffer,
} from '../../utils/companyOffers.js';

const initialFilters = {
  query: '',
  status: 'ALL',
  location: '',
  duration: '',
  sort: 'recent',
};

function CompanyOffersPage() {
  const [offers, setOffers] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [shouldRedirectDenied, setShouldRedirectDenied] = useState(false);

  const loadOffers = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const nextOffers = (await getCompanyOffers()).map(normalizeCompanyOffer).filter(Boolean);
      setOffers(nextOffers);
    } catch (error) {
      const readableError = getReadableOfferError(error, 'Impossible de charger vos offres.');
      if (readableError === 'FORBIDDEN') setShouldRedirectDenied(true);
      else setApiError(readableError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const filteredOffers = useMemo(() => filterAndSortCompanyOffers(offers, filters), [filters, offers]);
  const counts = useMemo(() => getOfferStatusCounts(offers), [offers]);
  const locations = useMemo(() => getUniqueOfferValues(offers, 'location'), [offers]);
  const durations = useMemo(() => getUniqueOfferValues(offers, 'duration'), [offers]);

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setIsArchiving(true);
    setApiError('');
    try {
      await deleteOrArchiveCompanyOffer(archiveTarget.id);
      setArchiveTarget(null);
      setSuccessMessage('Offre archivee avec succes.');
      await loadOffers();
    } catch (error) {
      setApiError(getReadableOfferError(error, 'L archivage a echoue.'));
    } finally {
      setIsArchiving(false);
    }
  };

  if (shouldRedirectDenied) return <Navigate to="/access-denied" replace />;
  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <CompanyOffersHeader />
      {apiError ? <ErrorState title="Offres indisponibles" message={apiError} onRetry={loadOffers} /> : null}
      {successMessage ? <p className="rounded-stitch border border-green-100 bg-green-50 px-5 py-4 text-sm font-bold text-success" aria-live="polite">{successMessage}</p> : null}
      <CompanyOffersStats counts={counts} />
      <CompanyOffersFilters
        filters={filters}
        locations={locations}
        durations={durations}
        resultsCount={filteredOffers.length}
        onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
        onReset={() => setFilters(initialFilters)}
      />
      <CompanyOffersList
        offers={filteredOffers}
        hasAnyOffer={offers.length > 0}
        onArchive={setArchiveTarget}
        onResetFilters={() => setFilters(initialFilters)}
      />
      <OfferArchiveDialog offer={archiveTarget} isArchiving={isArchiving} onCancel={() => setArchiveTarget(null)} onConfirm={handleArchive} />
    </div>
  );
}

export default CompanyOffersPage;
