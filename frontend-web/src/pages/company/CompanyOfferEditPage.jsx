import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { getCompanyOfferById, updateCompanyOffer } from '../../api/companyOffersApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import CompanyOfferForm from '../../components/company/offers/CompanyOfferForm.jsx';
import CompanyOffersHeader from '../../components/company/offers/CompanyOffersHeader.jsx';
import {
  buildOfferFormValues,
  buildOfferPayload,
  getReadableOfferError,
  normalizeCompanyOffer,
  validateOfferForm,
} from '../../utils/companyOffers.js';

function CompanyOfferEditPage() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [values, setValues] = useState(buildOfferFormValues(null));
  const [initialValues, setInitialValues] = useState(buildOfferFormValues(null));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [shouldRedirectDenied, setShouldRedirectDenied] = useState(false);

  const loadOffer = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const normalized = normalizeCompanyOffer(await getCompanyOfferById(offerId));
      const formValues = buildOfferFormValues(normalized);
      setOffer(normalized);
      setValues(formValues);
      setInitialValues(formValues);
      setErrors({});
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

  const isDirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initialValues), [initialValues, values]);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setApiError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (statusOverride) => {
    const nextValues = { ...values, status: statusOverride || values.status };
    const nextErrors = validateOfferForm(nextValues);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    setApiError('');
    try {
      const response = await updateCompanyOffer(offerId, buildOfferPayload(nextValues, statusOverride));
      const normalized = normalizeCompanyOffer(response.offer);
      const formValues = buildOfferFormValues(normalized);
      setOffer(normalized);
      setValues(formValues);
      setInitialValues(formValues);
      setSuccessMessage(statusOverride === 'PUBLISHED' ? 'Offre publiee avec succes.' : 'Offre mise a jour avec succes.');
    } catch (error) {
      const readableError = getReadableOfferError(error);
      if (readableError === 'FORBIDDEN') setShouldRedirectDenied(true);
      else setApiError(readableError);
    } finally {
      setIsSaving(false);
    }
  };

  if (shouldRedirectDenied) return <Navigate to="/access-denied" replace />;
  if (isLoading) return <LoadingSkeleton />;
  if (!offer) return <ErrorState title="Offre indisponible" message={apiError || 'Impossible de charger cette offre.'} onRetry={loadOffer} />;

  return (
    <div className="space-y-6">
      <CompanyOffersHeader title="Modifier une offre" subtitle={offer.title} action={false} />
      <CompanyOfferForm
        values={values}
        errors={errors}
        mode="edit"
        isSaving={isSaving}
        isDirty={isDirty}
        apiError={apiError}
        successMessage={successMessage}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => {
          setValues(initialValues);
          setErrors({});
          setApiError('');
          setSuccessMessage('');
        }}
      />
      <button className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" type="button" onClick={() => navigate(`/company/offers/${offerId}`)}>
        Retour au detail
      </button>
    </div>
  );
}

export default CompanyOfferEditPage;
