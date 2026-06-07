export const TOKEN_STORAGE_KEY = 'smartintern_token';
export const USER_STORAGE_KEY = 'smartintern_user';

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

export const saveSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
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
