import { formatDate } from './formatters.js';

export const roleLabels = {
  STUDENT: 'Etudiant',
  COMPANY: 'Entreprise',
  ADMIN: 'Administrateur',
};

export const companyStatusLabels = {
  PENDING: 'En attente',
  VALIDATED: 'Validee',
  REJECTED: 'Refusee',
  SUSPENDED: 'Suspendue',
};

export const normalizeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const normalizePagination = (pagination = {}) => ({
  page: normalizeNumber(pagination.page) || 1,
  limit: normalizeNumber(pagination.limit) || 20,
  total: normalizeNumber(pagination.total),
  totalPages: normalizeNumber(pagination.totalPages) || 1,
});

export const normalizeAdminUser = (user = {}) => ({
  id: user.id,
  firstName: user.firstName || '',
  lastName: user.lastName || '',
  email: user.email || '',
  role: user.role || 'STUDENT',
  roleLabel: roleLabels[user.role] || user.role || 'Role inconnu',
  isActive: user.isActive !== false,
  statusLabel: user.isActive === false ? 'Desactive' : 'Actif',
  createdAt: user.createdAt || null,
  updatedAt: user.updatedAt || null,
});

export const normalizeAdminCompany = (company = {}) => {
  const user = company.user || {};

  return {
    id: company.id,
    companyName: company.companyName || 'Entreprise sans nom',
    sector: company.sector || '',
    description: company.description || '',
    website: company.website || '',
    address: company.address || '',
    status: company.status || 'PENDING',
    statusLabel: companyStatusLabels[company.status] || company.status || 'Statut inconnu',
    createdAt: company.createdAt || null,
    updatedAt: company.updatedAt || null,
    user: {
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      isActive: user.isActive !== false,
    },
  };
};

export const normalizeAdminDashboard = (dashboard = {}) => ({
  stats: {
    totalUsers: normalizeNumber(dashboard.stats?.totalUsers),
    totalStudents: normalizeNumber(dashboard.stats?.totalStudents),
    totalCompanies: normalizeNumber(dashboard.stats?.totalCompanies),
    totalOffers: normalizeNumber(dashboard.stats?.totalOffers),
    publishedOffers: normalizeNumber(dashboard.stats?.publishedOffers),
    totalApplications: normalizeNumber(dashboard.stats?.totalApplications),
    acceptedApplications: normalizeNumber(dashboard.stats?.acceptedApplications),
    pendingCompanies: normalizeNumber(dashboard.stats?.pendingCompanies),
    inactiveUsers: normalizeNumber(dashboard.stats?.inactiveUsers),
  },
  recentUsers: (dashboard.recentUsers || []).map(normalizeAdminUser),
  recentCompanies: (dashboard.recentCompanies || []).map(normalizeAdminCompany),
  recentOffers: (dashboard.recentOffers || []).map((offer) => ({
    id: offer.id,
    title: offer.title || 'Offre sans titre',
    status: offer.status || 'DRAFT',
    createdAt: offer.createdAt || null,
    company: offer.company || null,
  })),
});

export const getAdminErrorMessage = (error, fallback = 'La modification n a pas pu etre enregistree.') => {
  if (error.response?.status === 403) return 'FORBIDDEN';
  if (!error.response) return 'Impossible de contacter le serveur. Verifiez que le backend est demarre.';
  if (error.response.status === 404) return 'L element demande n existe plus.';
  if (error.response.status === 400) return error.response.data?.message || 'Donnees invalides.';
  return error.response.data?.message || fallback;
};

export const formatAdminDate = (value) => (value ? formatDate(value) : 'Non renseignee');
