import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { getOfferCandidateRanking, getOfferApplications, updateApplicationStatus } from '../../api/companyApplicationsApi.js';
import { getCompanyOffers } from '../../api/companyOffersApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import CompanyApplicationDetailsPanel from '../../components/company/applications/CompanyApplicationDetailsPanel.jsx';
import CompanyApplicationsEmptyState from '../../components/company/applications/CompanyApplicationsEmptyState.jsx';
import CompanyApplicationsFilters from '../../components/company/applications/CompanyApplicationsFilters.jsx';
import CompanyApplicationsHeader from '../../components/company/applications/CompanyApplicationsHeader.jsx';
import CompanyApplicationsList from '../../components/company/applications/CompanyApplicationsList.jsx';
import CompanyApplicationsStats from '../../components/company/applications/CompanyApplicationsStats.jsx';
import CompanyOfferSelector from '../../components/company/applications/CompanyOfferSelector.jsx';
import UpdateApplicationStatusDialog from '../../components/company/applications/UpdateApplicationStatusDialog.jsx';
import {
  filterAndSortCompanyApplications,
  getCompanyApplicationStatusCounts,
  getReadableApplicationError,
  normalizeCompanyApplication,
} from '../../utils/companyApplications.js';
import { normalizeCompanyOffer } from '../../utils/companyOffers.js';

const initialFilters = {
  query: '',
  status: 'ALL',
  minScore: '0',
  sort: 'recent',
};

const selectInitialOffer = (offers, queryOfferId) => {
  const urlOffer = queryOfferId && offers.find((offer) => String(offer.id) === String(queryOfferId));
  if (urlOffer) return urlOffer;
  return offers.find((offer) => offer.status === 'PUBLISHED') || offers[0] || null;
};

function CompanyApplicationsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryOfferId = searchParams.get('offerId');
  const [offers, setOffers] = useState([]);
  const [selectedOfferId, setSelectedOfferId] = useState(queryOfferId || '');
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [offersError, setOffersError] = useState('');
  const [applicationsError, setApplicationsError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [shouldRedirectDenied, setShouldRedirectDenied] = useState(false);
  const requestIdRef = useRef(0);

  const selectedOffer = useMemo(
    () => offers.find((offer) => String(offer.id) === String(selectedOfferId)) || null,
    [offers, selectedOfferId],
  );

  const loadOffers = useCallback(async () => {
    setIsLoadingOffers(true);
    setOffersError('');
    setNotice('');
    try {
      const nextOffers = (await getCompanyOffers()).map(normalizeCompanyOffer).filter(Boolean);
      setOffers(nextOffers);
      const nextSelected = selectInitialOffer(nextOffers, queryOfferId);
      setSelectedOfferId(nextSelected?.id || '');
      if (queryOfferId && !nextOffers.some((offer) => String(offer.id) === String(queryOfferId))) {
        setNotice('L offre transmise dans l URL est introuvable. Une autre offre a ete selectionnee.');
      }
    } catch (error) {
      const readableError = getReadableApplicationError(error, 'Impossible de charger vos offres.');
      if (readableError === 'FORBIDDEN') setShouldRedirectDenied(true);
      else setOffersError(readableError);
    } finally {
      setIsLoadingOffers(false);
    }
  }, [queryOfferId]);

  const loadApplications = useCallback(async (offer) => {
    if (!offer) {
      setApplications([]);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoadingApplications(true);
    setApplicationsError('');

    const [applicationsResult, rankingResult] = await Promise.allSettled([
      getOfferApplications(offer.id),
      getOfferCandidateRanking(offer.id, { minScore: 0, includeWithoutCV: true }),
    ]);

    if (requestId !== requestIdRef.current) {
      return;
    }

    if (applicationsResult.status === 'rejected') {
      const readableError = getReadableApplicationError(applicationsResult.reason);
      if (readableError === 'FORBIDDEN') setShouldRedirectDenied(true);
      else setApplicationsError(readableError);
      setApplications([]);
      setIsLoadingApplications(false);
      return;
    }

    const rankingCandidates = rankingResult.status === 'fulfilled' ? rankingResult.value.candidates || [] : [];
    if (rankingResult.status === 'rejected') {
      setNotice('Le score IA est indisponible pour le moment. Les candidatures restent consultables.');
    }

    const rankingByApplicationId = new Map(rankingCandidates.map((candidate) => [candidate.applicationId, candidate]));
    const nextApplications = (applicationsResult.value || [])
      .map((application) => normalizeCompanyApplication(application, offer, rankingByApplicationId.get(application.id)))
      .filter(Boolean);

    setApplications(nextApplications);
    setIsLoadingApplications(false);
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    if (!selectedOffer) return;
    navigate(`/company/applications?offerId=${selectedOffer.id}`, { replace: true });
    setFilters(initialFilters);
    setSelectedApplication(null);
    loadApplications(selectedOffer);
  }, [loadApplications, navigate, selectedOffer]);

  const filteredApplications = useMemo(() => filterAndSortCompanyApplications(applications, filters), [applications, filters]);
  const counts = useMemo(() => getCompanyApplicationStatusCounts(applications), [applications]);

  const handleStatusUpdate = async (nextStatus) => {
    if (!statusTarget) return;
    setIsUpdatingStatus(true);
    setStatusError('');
    try {
      const response = await updateApplicationStatus(statusTarget.id, nextStatus);
      const updated = normalizeCompanyApplication(response.application, selectedOffer, statusTarget);
      setApplications((current) => current.map((application) => (application.id === updated.id ? { ...application, ...updated } : application)));
      setSelectedApplication((current) => (current?.id === updated.id ? { ...current, ...updated } : current));
      setStatusTarget(null);
      setSuccessMessage('Statut de la candidature mis a jour.');
    } catch (error) {
      const readableError = getReadableApplicationError(error, 'Le statut n a pas pu etre modifie. Veuillez reessayer.');
      if (readableError === 'FORBIDDEN') setShouldRedirectDenied(true);
      else setStatusError(readableError);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (shouldRedirectDenied) return <Navigate to="/access-denied" replace />;
  if (isLoadingOffers) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <CompanyApplicationsHeader selectedOfferId={selectedOfferId} />
      {offersError ? <ErrorState title="Offres indisponibles" message={offersError} onRetry={loadOffers} /> : null}
      {notice ? <p className="rounded-stitch border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-800" aria-live="polite">{notice}</p> : null}
      {successMessage ? <p className="rounded-stitch border border-green-100 bg-green-50 px-5 py-4 text-sm font-bold text-success" aria-live="polite">{successMessage}</p> : null}

      {!offers.length ? (
        <CompanyApplicationsEmptyState variant="no-offers" />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <CompanyOfferSelector offers={offers} selectedOfferId={selectedOfferId} onSelectOffer={setSelectedOfferId} />
          <div className="space-y-6">
            {applicationsError ? <ErrorState title="Candidatures indisponibles" message={applicationsError} onRetry={() => loadApplications(selectedOffer)} /> : null}
            {selectedOffer ? <CompanyApplicationsStats counts={counts} /> : null}
            <CompanyApplicationsFilters
              filters={filters}
              resultsCount={filteredApplications.length}
              onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
              onReset={() => setFilters(initialFilters)}
            />
            {isLoadingApplications ? (
              <LoadingSkeleton />
            ) : (
              <CompanyApplicationsList
                applications={filteredApplications}
                hasAnyApplication={applications.length > 0}
                selectedOffer={selectedOffer}
                onOpenDetails={setSelectedApplication}
                onUpdateStatus={(application) => {
                  setStatusTarget(application);
                  setStatusError('');
                }}
                onResetFilters={() => setFilters(initialFilters)}
              />
            )}
          </div>
        </div>
      )}

      <CompanyApplicationDetailsPanel
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onUpdateStatus={(application) => {
          setStatusTarget(application);
          setStatusError('');
        }}
      />
      <UpdateApplicationStatusDialog
        application={statusTarget}
        isUpdating={isUpdatingStatus}
        error={statusError}
        onCancel={() => setStatusTarget(null)}
        onConfirm={handleStatusUpdate}
      />
    </div>
  );
}

export default CompanyApplicationsPage;
