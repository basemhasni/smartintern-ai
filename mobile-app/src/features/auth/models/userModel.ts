export type UserRole = 'STUDENT' | 'COMPANY' | 'ADMIN';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  student?: Record<string, unknown> | null;
  studentProfile?: Record<string, unknown> | null;
  company?: Record<string, unknown> | null;
  companyProfile?: Record<string, unknown> | null;
};

export const getUserDisplayName = (user: AuthUser | null) => {
  if (!user) return 'Etudiant';

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return user.name || fullName || user.email;
};

export const getUserInitials = (user: AuthUser | null) => {
  const displayName = getUserDisplayName(user);
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'SI';
};
