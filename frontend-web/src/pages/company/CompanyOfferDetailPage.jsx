import { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';

import { deleteOrArchiveCompanyOffer, getCompanyOfferById } from '../../api/companyOffersApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import OfferQualityPanel from '../../components/ai/OfferQualityPanel.jsx';
import OfferArchiveDialog from '../../components/company/offers/OfferArchiveDialog.jsx';
import OfferDetailSummary from '../../components/company/offers/OfferDetailSummary.jsx';
import { getReadableOfferError, normalizeCompanyOffer } from '../../utils/companyOffers.js';

function CompanyOfferDetailPage() {
  const { offerId } = useParams();
  const location = useLocation();
  const [offer, setOffer] = useState(null);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [isLoading, setIsLoading] = useState(true);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [shouldRedirectDenied, setShouldRedirectDenied] = useState(false);

  const loadOffer = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      setOffer(normalizeCompanyOffer(await getCompanyOfferById(offerId)));
    } catch (error) {
      const readableError = getReadableOfferError(error, 'Impossible de charger cette offre.');
      if (readableError === 'FORBIDDEN') setShouldRedirectDenied(true);
      else setApiError(readableError);
    } finally {
      setIsLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    loadOffer();
  }, [loadOffer]);

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setIsArchiving(true);
    setApiError('');
    try {
      await deleteOrArchiveCompanyOffer(archiveTarget.id);
      setArchiveTarget(null);
      setSuccessMessage('Offre archivee avec succes.');
      await loadOffer();
    } catch (error) {
      setApiError(getReadableOfferError(error, 'L archivage a echoue.'));
    } finally {
      setIsArchiving(false);
    }
  };

  if (shouldRedirectDenied) return <Navigate to="/access-denied" replace />;
  if (isLoading) return <LoadingSkeleton />;
  if (!offer) return <ErrorState title="Offre indisponible" message={apiError || 'Cette offre est introuvable.'} onRetry={loadOffer} />;

  return (
    <div className="space-y-6">
      {successMessage ? <p className="rounded-stitch border border-green-100 bg-green-50 px-5 py-4 text-sm font-bold text-success" aria-live="polite">{successMessage}</p> : null}
      {apiError ? <ErrorState title="Action indisponible" message={apiError} onRetry={loadOffer} /> : null}
      <OfferDetailSummary offer={offer} onArchive={() => setArchiveTarget(offer)} />
      <OfferQualityPanel offer={offer} />
      <OfferArchiveDialog offer={archiveTarget} isArchiving={isArchiving} onCancel={() => setArchiveTarget(null)} onConfirm={handleArchive} />
    </div>
  );
}

export default CompanyOfferDetailPage;
