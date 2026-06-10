import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { getCandidateRanking } from '../../api/candidateRankingApi.js';
import { updateApplicationStatus } from '../../api/companyApplicationsApi.js';
import { getCompanyOffers } from '../../api/companyOffersApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import UpdateApplicationStatusDialog from '../../components/company/applications/UpdateApplicationStatusDialog.jsx';
import CandidateRankingDetailsPanel from '../../components/company/ranking/CandidateRankingDetailsPanel.jsx';
import CandidateRankingEmptyState from '../../components/company/ranking/CandidateRankingEmptyState.jsx';
import CandidateRankingHeader from '../../components/company/ranking/CandidateRankingHeader.jsx';
import CandidateRankingList from '../../components/company/ranking/CandidateRankingList.jsx';
import RankingFilters from '../../components/company/ranking/RankingFilters.jsx';
import RankingMethodologyPanel from '../../components/company/ranking/RankingMethodologyPanel.jsx';
import RankingOfferSelector from '../../components/company/ranking/RankingOfferSelector.jsx';
import RankingSummary from '../../components/company/ranking/RankingSummary.jsx';
import { getReadableApplicationError } from '../../utils/companyApplications.js';
import { applicationStatusLabels } from '../../utils/companyDashboard.js';
import { normalizeCompanyOffer } from '../../utils/companyOffers.js';
import {
  filterAndSortRankingCandidates,
  getRankingSummary,
  getReadableRankingError,
  normalizeCandidateRankingResponse,
} from '../../utils/candidateRanking.js';

const initialFilters = {
  query: '',
  status: 'ALL',
  scoreMode: 'ALL',
  minScore: '0',
  skill: '',
  sort: 'rank',
};

const selectInitialOffer = (offers, queryOfferId) => {
  const urlOffer = queryOfferId && offers.find((offer) => String(offer.id) === String(queryOfferId));
  if (urlOffer) return urlOffer;
  return offers.find((offer) => offer.status === 'PUBLISHED') || offers[0] || null;
};

const toDialogApplication = (candidate) => ({
  id: candidate.applicationId,
  status: candidate.applicationStatus,
  statusLabel: candidate.applicationStatusLabel,
  student: candidate.student,
  offer: candidate.offer,
});

function CompanyCandidateRankingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryOfferId = searchParams.get('offerId');
  const requestIdRef = useRef(0);
  const [offers, setOffers] = useState([]);
  const [selectedOfferId, setSelectedOfferId] = useState(queryOfferId || '');
  const [ranking, setRanking] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [offersError, setOffersError] = useState('');
  const [rankingError, setRankingError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [notice, setNotice] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [shouldRedirectDenied, setShouldRedirectDenied] = useState(false);

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

  const loadRanking = useCallback(async (offer) => {
    if (!offer) {
      setRanking(null);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoadingRanking(true);
    setRankingError('');

    try {
      const response = await getCandidateRanking(offer.id, { minScore: 0, includeWithoutCV: true });
      if (requestId !== requestIdRef.current) return;
      const normalized = normalizeCandidateRankingResponse(response);
      setRanking({
        ...normalized,
        offer: {
          id: offer.id,
          title: normalized.offer.title || offer.title,
        },
      });
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const readableError = getReadableRankingError(error);
      if (readableError === 'FORBIDDEN') setShouldRedirectDenied(true);
      else setRankingError(readableError);
      setRanking(null);
    } finally {
      if (requestId === requestIdRef.current) setIsLoadingRanking(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    if (!selectedOffer) return;
    navigate(`/company/candidate-ranking?offerId=${selectedOffer.id}`, { replace: true });
    setFilters(initialFilters);
    setSelectedCandidate(null);
    loadRanking(selectedOffer);
  }, [loadRanking, navigate, selectedOffer]);

  const candidates = ranking?.candidates || [];
  const filteredCandidates = useMemo(() => filterAndSortRankingCandidates(candidates, filters), [candidates, filters]);
  const summary = useMemo(() => getRankingSummary(candidates), [candidates]);

  const handleStatusUpdate = async (nextStatus) => {
    if (!statusTarget) return;
    setIsUpdatingStatus(true);
    setStatusError('');
    try {
      const response = await updateApplicationStatus(statusTarget.applicationId, nextStatus);
      const updatedStatus = response.application?.status || nextStatus;
      const updatedLabel = applicationStatusLabels[updatedStatus] || updatedStatus;
      const updateCandidate = (candidate) => (
        candidate.applicationId === statusTarget.applicationId
          ? {
            ...candidate,
            applicationStatus: updatedStatus,
            applicationStatusLabel: updatedLabel,
          }
          : candidate
      );
      setRanking((current) => current ? { ...current, candidates: current.candidates.map(updateCandidate) } : current);
      setSelectedCandidate((current) => current ? updateCandidate(current) : current);
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
      <CandidateRankingHeader selectedOfferId={selectedOfferId} />
      {offersError ? <ErrorState title="Offres indisponibles" message={offersError} onRetry={loadOffers} /> : null}
      {notice ? <p className="rounded-stitch border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-800" aria-live="polite">{notice}</p> : null}
      {successMessage ? <p className="rounded-stitch border border-green-100 bg-green-50 px-5 py-4 text-sm font-bold text-success" aria-live="polite">{successMessage}</p> : null}

      {!offers.length ? (
        <CandidateRankingEmptyState variant="noOffers" />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <RankingOfferSelector offers={offers} selectedOfferId={selectedOfferId} onSelectOffer={setSelectedOfferId} />
          <div className="space-y-6">
            {rankingError ? <ErrorState title="Classement indisponible" message={rankingError} onRetry={() => loadRanking(selectedOffer)} /> : null}
            {isLoadingRanking ? (
              <LoadingSkeleton />
            ) : (
              <>
                <RankingSummary summary={summary} />
                <RankingFilters
                  filters={filters}
                  resultsCount={filteredCandidates.length}
                  onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
                  onReset={() => setFilters(initialFilters)}
                />
                <CandidateRankingList
                  candidates={filteredCandidates}
                  hasAnyCandidate={candidates.length > 0}
                  selectedOffer={selectedOffer}
                  onOpenDetails={setSelectedCandidate}
                  onUpdateStatus={(candidate) => {
                    setStatusTarget(candidate);
                    setStatusError('');
                  }}
                  onResetFilters={() => setFilters(initialFilters)}
                />
                <RankingMethodologyPanel />
              </>
            )}
          </div>
        </div>
      )}

      <CandidateRankingDetailsPanel
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onUpdateStatus={(candidate) => {
          setStatusTarget(candidate);
          setStatusError('');
        }}
      />
      <UpdateApplicationStatusDialog
        application={statusTarget ? toDialogApplication(statusTarget) : null}
        isUpdating={isUpdatingStatus}
        error={statusError}
        onCancel={() => setStatusTarget(null)}
        onConfirm={handleStatusUpdate}
      />
    </div>
  );
}

export default CompanyCandidateRankingPage;
