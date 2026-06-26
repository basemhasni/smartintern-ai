import { Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import AuthFeedback from '../components/auth/AuthFeedback.jsx';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import FormField from '../components/auth/FormField.jsx';
import PasswordField from '../components/auth/PasswordField.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { getDashboardPathByRole } from '../utils/auth.js';

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getLoginErrorMessage = (error) => {
  if (!error.response) {
    return 'Impossible de contacter le serveur. Verifiez que le backend est demarre.';
  }

  if (error.response.status === 401) {
    return 'Email ou mot de passe incorrect.';
  }

  if (error.response.status === 403) {
    return "Votre compte est desactive ou n'est pas autorise.";
  }

  return 'Une erreur est survenue. Veuillez reessayer.';
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login, role } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
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
    const email = values.email.trim();

    if (!email) {
      nextErrors.email = 'Email obligatoire.';
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Adresse email invalide.';
    }

    if (!values.password) {
      nextErrors.password = 'Mot de passe obligatoire.';
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

    try {
      const user = await login(values.email.trim(), values.password);
      navigate(location.state?.from?.pathname || getDashboardPathByRole(user.role), { replace: true });
    } catch (error) {
      setGlobalError(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Bon retour parmi nous"
      subtitle="Connectez-vous pour retrouver vos recommandations, candidatures et outils IA."
      variant="login"
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <AuthFeedback message={globalError} />
        <FormField
          autoComplete="email"
          autoFocus
          error={fieldErrors.email}
          icon={Mail}
          id="login-email"
          label="Email"
          name="email"
          onChange={updateValue}
          placeholder="votre@email.com"
          type="email"
          value={values.email}
        />
        <PasswordField
          autoComplete="current-password"
          error={fieldErrors.password}
          id="login-password"
          label="Mot de passe"
          name="password"
          onChange={updateValue}
          placeholder="Votre mot de passe"
          value={values.password}
        />
        <div className="flex justify-end">
          <Link className="text-xs font-semibold text-primary hover:underline" to="/forgot-password">
            Mot de passe oublie ?
          </Link>
        </div>
        <button
          className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(15,91,215,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0b4fc4] disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Pas encore de compte ?{' '}
        <Link className="font-bold text-primary hover:underline" to="/register">
          Creer un compte
        </Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
