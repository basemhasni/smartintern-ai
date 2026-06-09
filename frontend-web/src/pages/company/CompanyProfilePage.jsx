import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { getCompanyProfile, updateCompanyProfile } from '../../api/companyApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import CompanyIdentityCard from '../../components/company/profile/CompanyIdentityCard.jsx';
import CompanyProfileForm from '../../components/company/profile/CompanyProfileForm.jsx';
import CompanyProfileHelp from '../../components/company/profile/CompanyProfileHelp.jsx';
import CompanyStatusBanner from '../../components/company/profile/CompanyStatusBanner.jsx';
import { normalizeCompanyProfile } from '../../utils/companyDashboard.js';

const editableFields = ['companyName', 'sector', 'description', 'website', 'address'];

const buildFormValues = (company) => ({
  companyName: company?.companyName || '',
  sector: company?.sector || '',
  description: company?.description || '',
  website: company?.website || '',
  address: company?.address || '',
  firstName: company?.user?.firstName || '',
  lastName: company?.user?.lastName || '',
  email: company?.user?.email || '',
  role: company?.user?.role || 'COMPANY',
  status: company?.status || '',
  statusLabel: company?.statusLabel || '',
});

const normalizePayloadValue = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  return trimmed === '' ? null : trimmed;
};

const buildUpdatePayload = (values) => ({
  companyName: values.companyName.trim(),
  sector: normalizePayloadValue(values.sector),
  description: normalizePayloadValue(values.description),
  website: normalizePayloadValue(values.website),
  address: normalizePayloadValue(values.address),
});

const isValidHttpUrl = (value) => {
  if (!value.trim()) {
    return true;
  }

  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const validateCompanyProfile = (values) => {
  const errors = {};

  if (!values.companyName.trim()) {
    errors.companyName = 'Le nom de l entreprise est obligatoire.';
  }

  if (values.companyName.trim().length > 160) {
    errors.companyName = 'Le nom de l entreprise ne doit pas depasser 160 caracteres.';
  }

  if (values.sector.trim().length > 120) {
    errors.sector = 'Le secteur ne doit pas depasser 120 caracteres.';
  }

  if (values.description.trim().length > 1000) {
    errors.description = 'La description ne doit pas depasser 1000 caracteres.';
  }

  if (!isValidHttpUrl(values.website)) {
    errors.website = 'Le site web doit etre une URL valide commencant par http ou https.';
  }

  if (values.address.trim().length > 250) {
    errors.address = 'L adresse ne doit pas depasser 250 caracteres.';
  }

  return errors;
};

const getReadableApiError = (error) => {
  if (error.response?.status === 403) {
    return 'FORBIDDEN';
  }

  if (!error.response) {
    return 'Impossible de charger le profil entreprise. Verifiez que le backend est demarre.';
  }

  if (error.response.status === 404) {
    return 'Le profil entreprise associe a ce compte est introuvable.';
  }

  if (error.response.status === 400) {
    return error.response.data?.message || 'Certaines donnees sont invalides.';
  }

  return error.response.data?.message || 'Les modifications n ont pas pu etre enregistrees. Veuillez reessayer.';
};

function CompanyProfilePage() {
  const [company, setCompany] = useState(null);
  const [values, setValues] = useState(buildFormValues(null));
  const [initialValues, setInitialValues] = useState(buildFormValues(null));
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [shouldRedirectDenied, setShouldRedirectDenied] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setApiError('');

    try {
      const profile = normalizeCompanyProfile(await getCompanyProfile());
      const nextValues = buildFormValues(profile);
      setCompany(profile);
      setValues(nextValues);
      setInitialValues(nextValues);
      setFieldErrors({});
    } catch (error) {
      const readableError = getReadableApiError(error);

      if (readableError === 'FORBIDDEN') {
        setShouldRedirectDenied(true);
      } else {
        setApiError(readableError);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setSuccessMessage(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const isDirty = useMemo(() => (
    editableFields.some((field) => values[field] !== initialValues[field])
  ), [initialValues, values]);

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: '' }));
    setApiError('');
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setValues(initialValues);
    setFieldErrors({});
    setApiError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateCompanyProfile(values);

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    setApiError('');
    setSuccessMessage('');

    try {
      const updatedCompany = normalizeCompanyProfile(await updateCompanyProfile(buildUpdatePayload(values)));
      const nextValues = buildFormValues(updatedCompany);
      setCompany(updatedCompany);
      setValues(nextValues);
      setInitialValues(nextValues);
      setFieldErrors({});
      setSuccessMessage('Profil entreprise mis a jour avec succes.');
    } catch (error) {
      const readableError = getReadableApiError(error);

      if (readableError === 'FORBIDDEN') {
        setShouldRedirectDenied(true);
      } else {
        setApiError(readableError);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (shouldRedirectDenied) {
    return <Navigate to="/access-denied" replace />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!company) {
    return (
      <ErrorState
        title="Profil indisponible"
        message={apiError || 'Impossible de charger le profil entreprise.'}
        onRetry={loadProfile}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Profil entreprise</p>
            <h1 className="mt-2 text-2xl font-black leading-tight text-ink md:text-3xl">Profil entreprise</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              Presentez clairement votre entreprise pour renforcer la confiance des candidats et ameliorer la pertinence du matching.
            </p>
          </div>
          <Link className="inline-flex justify-center rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-panel" to="/company/dashboard">
            Retour au dashboard
          </Link>
        </div>
      </section>

      <CompanyStatusBanner company={company} />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <div className="space-y-5">
          <CompanyIdentityCard company={company} />
          <CompanyProfileHelp />
        </div>
        <CompanyProfileForm
          values={values}
          errors={fieldErrors}
          isSaving={isSaving}
          isDirty={isDirty}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          globalMessage={successMessage}
          apiError={apiError}
        />
      </div>
    </div>
  );
}

export default CompanyProfilePage;
