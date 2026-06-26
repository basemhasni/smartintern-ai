import { CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';

import { resetPassword } from '../api/authApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import AuthFeedback from '../components/auth/AuthFeedback.jsx';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import PasswordField from '../components/auth/PasswordField.jsx';
import { getDashboardPathByRole } from '../utils/auth.js';

const getResetPasswordErrorMessage = (error) => {
  if (!error.response) {
    return 'Impossible de contacter le serveur. Verifiez que le backend est demarre.';
  }

  return error.response.data?.message || 'Une erreur est survenue. Veuillez reessayer.';
};

function ResetPasswordPage() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [values, setValues] = useState({ password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={getDashboardPathByRole(role)} replace />;
  }

  const updateValue = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
    setGlobalError('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!token) {
      setGlobalError('Lien invalide ou incomplet.');
      return false;
    }

    if (values.password.length < 8) {
      nextErrors.password = 'Le mot de passe doit contenir au moins 8 caracteres.';
    } else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) {
      nextErrors.password = 'Ajoutez au moins une lettre et un chiffre.';
    }

    if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setGlobalError('');
    setSuccessMessage('');

    try {
      const result = await resetPassword({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      setSuccessMessage(result.message || 'Votre mot de passe a ete reinitialise avec succes.');
      setValues({ password: '', confirmPassword: '' });
    } catch (error) {
      setGlobalError(getResetPasswordErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordHint = values.password.length === 0
    ? '8 caracteres minimum, avec au moins une lettre et un chiffre.'
    : values.password.length < 8
      ? `${values.password.length}/8 caracteres.`
      : 'Longueur suffisante.';

  return (
    <AuthLayout
      title="Reinitialiser le mot de passe"
      subtitle="Choisissez un nouveau mot de passe securise pour retrouver votre espace SmartIntern AI."
      variant="login"
    >
      {!token ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800" role="alert">
          Lien invalide ou incomplet. Demandez un nouveau lien de reinitialisation.
        </div>
      ) : (
        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          <AuthFeedback message={globalError} />
          {successMessage ? (
            <div
              className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
              <span>{successMessage}</span>
            </div>
          ) : null}
          <PasswordField
            autoComplete="new-password"
            error={fieldErrors.password}
            id="reset-password"
            label="Nouveau mot de passe"
            name="password"
            onChange={updateValue}
            placeholder="8 caracteres minimum"
            value={values.password}
          />
          <p className="text-xs font-semibold text-muted">{passwordHint}</p>
          <PasswordField
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
            id="reset-confirm-password"
            label="Confirmer le mot de passe"
            name="confirmPassword"
            onChange={updateValue}
            placeholder="Repetez votre mot de passe"
            value={values.confirmPassword}
          />
          <button
            className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(15,91,215,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0b4fc4] disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isSubmitting || Boolean(successMessage)}
          >
            {isSubmitting ? 'Reinitialisation...' : 'Reinitialiser mon mot de passe'}
          </button>
        </form>
      )}
      <p className="mt-8 text-center text-sm text-muted">
        <Link className="font-bold text-primary hover:underline" to="/login">
          Retour a la connexion
        </Link>
      </p>
    </AuthLayout>
  );
}

export default ResetPasswordPage;

