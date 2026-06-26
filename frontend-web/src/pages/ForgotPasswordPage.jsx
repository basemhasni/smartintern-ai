import { ArrowRight, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { forgotPassword } from '../api/authApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import AuthFeedback from '../components/auth/AuthFeedback.jsx';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import FormField from '../components/auth/FormField.jsx';
import { getDashboardPathByRole } from '../utils/auth.js';

const GENERIC_SUCCESS_MESSAGE = 'Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.';

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getForgotPasswordErrorMessage = (error) => {
  if (!error.response) {
    return 'Impossible de contacter le serveur. Verifiez que le backend est demarre.';
  }

  return error.response.data?.message || 'Une erreur est survenue. Veuillez reessayer.';
};

function ForgotPasswordPage() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devResetLink, setDevResetLink] = useState('');
  const [devNotice, setDevNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={getDashboardPathByRole(role)} replace />;
  }

  const updateEmail = (event) => {
    setEmail(event.target.value);
    setFieldError('');
    setGlobalError('');
    setSuccessMessage('');
    setDevResetLink('');
    setDevNotice('');
  };

  const validate = () => {
    const nextEmail = email.trim();

    if (!nextEmail) {
      setFieldError('Email obligatoire.');
      return false;
    }

    if (!isValidEmail(nextEmail)) {
      setFieldError('Adresse email invalide.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setGlobalError('');
    setSuccessMessage('');
    setDevResetLink('');
    setDevNotice('');

    try {
      const result = await forgotPassword(email.trim());
      setSuccessMessage(result.message || GENERIC_SUCCESS_MESSAGE);
      setDevResetLink(result.devResetLink || '');
      setDevNotice(result.devNotice || '');
    } catch (error) {
      setGlobalError(getForgotPasswordErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Mot de passe oublie"
      subtitle="Saisissez votre email. Si un compte existe, nous vous enverrons un lien de reinitialisation securise."
      variant="login"
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <AuthFeedback message={globalError} />
        {successMessage ? (
          <div
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
            role="status"
            aria-live="polite"
          >
            {successMessage}
          </div>
        ) : null}
        {devResetLink ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
            <p className="font-bold">{devNotice || 'Lien de reinitialisation disponible en mode developpement.'}</p>
            <a className="mt-2 block break-all font-semibold text-primary hover:underline" href={devResetLink}>
              Ouvrir le lien de reinitialisation
            </a>
            <p className="mt-2 break-all text-xs font-semibold text-amber-800">{devResetLink}</p>
          </div>
        ) : null}
        <FormField
          autoComplete="email"
          autoFocus
          error={fieldError}
          icon={Mail}
          id="forgot-password-email"
          label="Email"
          name="email"
          onChange={updateEmail}
          placeholder="votre@email.com"
          type="email"
          value={email}
        />
        <button
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(15,91,215,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0b4fc4] disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien'}
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Vous vous souvenez du mot de passe ?{' '}
        <Link className="font-bold text-primary hover:underline" to="/login">
          Retour a la connexion
        </Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
