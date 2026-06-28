export const TOKEN_STORAGE_KEY = 'smartintern_token';
export const USER_STORAGE_KEY = 'smartintern_user';
const LEGACY_TOKEN_KEYS = [TOKEN_STORAGE_KEY, 'token', 'authToken'];

export const getDashboardPathByRole = (role) => {
  switch (role) {
    case 'STUDENT':
      return '/student/dashboard';
    case 'COMPANY':
      return '/company/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/login';
  }
};

export const saveSession = ({ user }) => {
  LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const readStoredUser = () => {
  const value = localStorage.getItem(USER_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    clearSession();
    return null;
  }
};
