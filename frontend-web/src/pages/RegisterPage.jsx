import { Mail, User } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import AuthFeedback from '../components/auth/AuthFeedback.jsx';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import FormField from '../components/auth/FormField.jsx';
import PasswordField from '../components/auth/PasswordField.jsx';
import RoleSelector from '../components/auth/RoleSelector.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { getDashboardPathByRole } from '../utils/auth.js';

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getRegisterErrorMessage = (error) => {
  if (!error.response) {
    return 'Impossible de contacter le serveur. Verifiez que le backend est demarre.';
  }

  if (error.response.status === 400 || error.response.status === 409) {
    return 'Un compte existe deja avec cette adresse email.';
  }

  return 'Une erreur est survenue. Veuillez reessayer.';
};

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, register, role } = useAuth();
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
  });
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

  const updateRole = (nextRole) => {
    setValues((current) => ({ ...current, role: nextRole }));
    setFieldErrors((current) => ({ ...current, role: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    const email = values.email.trim();

    if (!values.firstName.trim()) nextErrors.firstName = 'Prenom obligatoire.';
    if (!values.lastName.trim()) nextErrors.lastName = 'Nom obligatoire.';
    if (!email) nextErrors.email = 'Email obligatoire.';
    else if (!isValidEmail(email)) nextErrors.email = 'Adresse email invalide.';
    if (values.password.length < 8) nextErrors.password = 'Le mot de passe doit contenir au moins 8 caracteres.';
    if (values.confirmPassword !== values.password) nextErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    if (!['STUDENT', 'COMPANY'].includes(values.role)) nextErrors.role = 'Choisissez un type de compte.';

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
      const user = await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      });
      navigate(getDashboardPathByRole(user.role), { replace: true });
    } catch (error) {
      setGlobalError(getRegisterErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordHint = values.password.length === 0
    ? '8 caracteres minimum.'
    : values.password.length < 8
      ? `${values.password.length}/8 caracteres.`
      : 'Longueur suffisante.';

  return (
    <AuthLayout
      title="Construisez la suite de votre parcours"
      subtitle="Creez votre espace etudiant ou entreprise et laissez SmartIntern AI transformer les candidatures en correspondances utiles."
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <AuthFeedback message={globalError} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            autoComplete="given-name"
            autoFocus
            error={fieldErrors.firstName}
            icon={User}
            id="register-first-name"
            label="Prenom"
            name="firstName"
            onChange={updateValue}
            placeholder="Hasni"
            value={values.firstName}
          />
          <FormField
            autoComplete="family-name"
            error={fieldErrors.lastName}
            icon={User}
            id="register-last-name"
            label="Nom"
            name="lastName"
            onChange={updateValue}
            placeholder="Badis"
            value={values.lastName}
          />
        </div>
        <FormField
          autoComplete="email"
          error={fieldErrors.email}
          icon={Mail}
          id="register-email"
          label="Email"
          name="email"
          onChange={updateValue}
          placeholder="votre@email.com"
          type="email"
          value={values.email}
        />
        <PasswordField
          autoComplete="new-password"
          error={fieldErrors.password}
          id="register-password"
          label="Mot de passe"
          name="password"
          onChange={updateValue}
          placeholder="8 caracteres minimum"
          value={values.password}
        />
        <div className="h-2 overflow-hidden rounded-full bg-primarySoft" aria-hidden="true">
          <span
            className="block h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min((values.password.length / 8) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs font-semibold text-muted">{passwordHint}</p>
        <PasswordField
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
          id="register-confirm-password"
          label="Confirmer le mot de passe"
          name="confirmPassword"
          onChange={updateValue}
          placeholder="Repetez votre mot de passe"
          value={values.confirmPassword}
        />
        <RoleSelector error={fieldErrors.role} onChange={updateRole} value={values.role} />
        <button
          className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-extrabold text-white shadow-panel transition hover:bg-[#0b4fc4] disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creation...' : 'Creer mon compte'}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Vous avez deja un compte ?{' '}
        <Link className="font-bold text-primary hover:underline" to="/login">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
}

export default RegisterPage;
