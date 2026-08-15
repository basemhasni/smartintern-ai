import { getApplicationStatusCounts, getApplicationStatusLabel, normalizeScore, toArray } from './formatters.js';

export const applicationStatuses = ['SENT', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];

export const normalizeApplication = (application) => {
  const offer = application.offer || {};

  return {
    id: application.id,
    status: application.status || 'SENT',
    statusLabel: getApplicationStatusLabel(application.status),
    message: application.message || '',
    appliedAt: application.appliedAt || null,
    updatedAt: application.updatedAt || null,
    compatibilityScore: normalizeScore(application.compatibilityScore ?? application.matching?.score),
    offer: {
      id: offer.id ?? application.offerId,
      title: offer.title || 'Offre indisponible',
      location: offer.location || '',
      duration: offer.duration || '',
      startDate: offer.startDate || null,
      status: offer.status || '',
      requiredSkills: toArray(offer.requiredSkills ?? offer.requiredSkillsJson),
      optionalSkills: toArray(offer.optionalSkills ?? offer.optionalSkillsJson),
      company: {
        id: offer.company?.id || null,
        companyName: offer.company?.companyName || 'Entreprise non renseignee',
        sector: offer.company?.sector || '',
      },
    },
  };
};

export const normalizeApplications = (applications = []) => (
  Array.isArray(applications) ? applications.filter(Boolean).map(normalizeApplication) : []
);

export const getApplicationStats = (applications = []) => ({
  total: applications.length,
  counts: getApplicationStatusCounts(applications),
});

export const getApplicationSearchText = (application) => [
  application.offer.title,
  application.offer.company.companyName,
  application.offer.company.sector,
  application.offer.location,
  application.message,
].filter(Boolean).join(' ').toLowerCase();

export const filterAndSortApplications = (applications, filters) => {
  const query = filters.query.trim().toLowerCase();

  return applications
    .filter((application) => {
      if (filters.status !== 'ALL' && application.status !== filters.status) {
        return false;
      }

      if (query && !getApplicationSearchText(application).includes(query)) {
        return false;
      }

      return true;
    })
    .sort((first, second) => {
      if (filters.sort === 'oldest') {
        return new Date(first.appliedAt || 0) - new Date(second.appliedAt || 0);
      }

      if (filters.sort === 'score') {
        return (second.compatibilityScore ?? -1) - (first.compatibilityScore ?? -1);
      }

      if (filters.sort === 'company') {
        return first.offer.company.companyName.localeCompare(second.offer.company.companyName);
      }

      return new Date(second.appliedAt || 0) - new Date(first.appliedAt || 0);
    });
};

export const getLetterErrorMessage = (error) => {
  if (error.response?.status === 404) {
    return 'NO_LETTER';
  }

  if (error.response?.status === 400) {
    const message = error.response.data?.message || '';

    if (message.includes('CV')) {
      return 'Un CV analyse est necessaire pour generer une lettre personnalisee.';
    }

    return message || 'La demande est invalide.';
  }

  if (error.response?.status === 403) {
    return 'Cette candidature ne vous appartient pas.';
  }

  if (!error.response) {
    return 'Impossible de contacter le serveur. Verifiez que le backend est demarre.';
  }

  if (error.response.status >= 500) {
    return 'Le service de generation est temporairement indisponible. Reessayez plus tard.';
  }

  return error.response.data?.message || 'Une erreur est survenue.';
};
