import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { getStudentProfile, updateStudentProfile } from '../../api/studentApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import ProfileCompletionDetails from '../../components/student/ProfileCompletionDetails.jsx';
import ProfileForm from '../../components/student/ProfileForm.jsx';
import ProfileSummaryCard from '../../components/student/ProfileSummaryCard.jsx';

const editableFields = ['phone', 'location', 'educationLevel', 'targetJob', 'bio', 'availabilityDate'];

const toDateInputValue = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
};

const buildFormValues = (student) => ({
  firstName: student?.user?.firstName || '',
  lastName: student?.user?.lastName || '',
  email: student?.user?.email || '',
  phone: student?.phone || '',
  location: student?.location || '',
  educationLevel: student?.educationLevel || '',
  targetJob: student?.targetJob || '',
  bio: student?.bio || '',
  availabilityDate: toDateInputValue(student?.availabilityDate),
});

const normalizePayloadValue = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  return trimmed === '' ? null : trimmed;
};

const buildUpdatePayload = (values) => ({
  phone: normalizePayloadValue(values.phone),
  location: normalizePayloadValue(values.location),
  educationLevel: normalizePayloadValue(values.educationLevel),
  targetJob: normalizePayloadValue(values.targetJob),
  bio: normalizePayloadValue(values.bio),
  availabilityDate: normalizePayloadValue(values.availabilityDate),
});

const validateProfile = (values) => {
  const errors = {};

  if (values.location.trim().length > 120) {
    errors.location = 'La localisation ne doit pas depasser 120 caracteres.';
  }

  if (values.educationLevel.trim().length > 120) {
    errors.educationLevel = "Le niveau d'etudes ne doit pas depasser 120 caracteres.";
  }

  if (values.targetJob.trim().length > 120) {
    errors.targetJob = "L'objectif metier ne doit pas depasser 120 caracteres.";
  }

  if (values.bio.trim().length > 500) {
    errors.bio = 'La bio ne doit pas depasser 500 caracteres.';
  }

  if (values.availabilityDate) {
    const date = new Date(values.availabilityDate);

    if (Number.isNaN(date.getTime())) {
      errors.availabilityDate = 'La date de disponibilite doit etre valide.';
    }
  }

  return errors;
};

const getReadableApiError = (error) => {
  if (error.response?.status === 403) {
    return 'FORBIDDEN';
  }

  if (!error.response) {
    return 'Impossible de contacter le serveur. Verifiez que le backend est demarre.';
  }

  if (error.response.status === 400) {
    return error.response.data?.message || 'Certaines donnees sont invalides.';
  }

  return error.response.data?.message || 'Une erreur est survenue. Veuillez reessayer.';
};

function StudentProfilePage() {
  const [student, setStudent] = useState(null);
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
      const nextStudent = await getStudentProfile();
      const nextValues = buildFormValues(nextStudent);
      setStudent(nextStudent);
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
    const nextErrors = validateProfile(values);

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    setApiError('');
    setSuccessMessage('');

    try {
      const updatedStudent = await updateStudentProfile(buildUpdatePayload(values));
      const nextValues = buildFormValues(updatedStudent);
      setStudent(updatedStudent);
      setValues(nextValues);
      setInitialValues(nextValues);
      setFieldErrors({});
      setSuccessMessage('Profil mis a jour avec succes.');
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

  if (!student) {
    return (
      <ErrorState
        title="Profil indisponible"
        message={apiError || 'Impossible de charger votre profil etudiant.'}
        onRetry={loadProfile}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Profil</p>
        <h1 className="mt-2 text-2xl font-black leading-tight text-ink md:text-3xl">Mon profil etudiant</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Completez vos informations pour ameliorer la qualite du matching IA.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <ProfileSummaryCard student={student} />
          <ProfileCompletionDetails student={student} />
          <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Conseil</p>
            <h2 className="mt-2 text-xl font-black text-ink">Pourquoi completer votre profil ?</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Plus votre profil est precis, plus SmartIntern AI peut proposer des offres pertinentes, expliquer les scores de compatibilite et generer des conseils adaptes.
            </p>
          </section>
        </div>

        <ProfileForm
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

export default StudentProfilePage;
