import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { createCompanyOffer } from '../../api/companyOffersApi.js';
import CompanyOfferForm from '../../components/company/offers/CompanyOfferForm.jsx';
import CompanyOffersHeader from '../../components/company/offers/CompanyOffersHeader.jsx';
import {
  buildOfferFormValues,
  buildOfferPayload,
  getReadableOfferError,
  normalizeCompanyOffer,
  validateOfferForm,
} from '../../utils/companyOffers.js';

function CompanyOfferCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(buildOfferFormValues(null));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [shouldRedirectDenied, setShouldRedirectDenied] = useState(false);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setApiError('');
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
      const response = await createCompanyOffer(buildOfferPayload(nextValues, statusOverride));
      const offer = normalizeCompanyOffer(response.offer);
      navigate(`/company/offers/${offer.id}`, { replace: true, state: { message: statusOverride === 'PUBLISHED' ? 'Offre publiee avec succes.' : 'Offre enregistree en brouillon.' } });
    } catch (error) {
      const readableError = getReadableOfferError(error);
      if (readableError === 'FORBIDDEN') setShouldRedirectDenied(true);
      else setApiError(readableError);
    } finally {
      setIsSaving(false);
    }
  };

  if (shouldRedirectDenied) return <Navigate to="/access-denied" replace />;

  return (
    <div className="space-y-6">
      <CompanyOffersHeader
        title="Creer une offre"
        subtitle="Presentez le stage et les competences recherchees pour recevoir des candidatures mieux ciblees."
        action={false}
      />
      <CompanyOfferForm
        values={values}
        errors={errors}
        mode="create"
        isSaving={isSaving}
        isDirty
        apiError={apiError}
        successMessage=""
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => {}}
      />
    </div>
  );
}

export default CompanyOfferCreatePage;
