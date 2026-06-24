import { applicationStatusLabels } from './companyDashboard.js';
import { normalizeScore, toArray } from './formatters.js';
import { normalizeAiMatchResult } from './ai.js';

export const applicationStatuses = ['SENT', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];

export const normalizeCompanyApplication = (application, offer, rankingCandidate) => {
  if (!application) {
    return null;
  }

  const student = application.student || {};
  const user = student.user || {};
  const matching = rankingCandidate?.matching || application.matching || {};

  return {
    id: application.id,
    status: application.status || 'SENT',
    statusLabel: applicationStatusLabels[application.status] || application.status || 'Statut inconnu',
    message: application.message || '',
    appliedAt: application.appliedAt || null,
    updatedAt: application.updatedAt || null,
    compatibilityScore: normalizeScore(application.compatibilityScore ?? matching.score),
    matching: {
      ...normalizeAiMatchResult(matching),
      score: normalizeScore(matching.score ?? application.compatibilityScore),
    },
    student: {
      id: student.id,
      firstName: user.firstName || student.firstName || '',
      lastName: user.lastName || student.lastName || '',
      email: user.email || student.email || '',
      phone: student.phone || '',
      location: student.location || '',
      educationLevel: student.educationLevel || '',
      targetJob: student.targetJob || '',
      bio: student.bio || '',
    },
    offer: {
      id: offer?.id || application.offer?.id || application.offerId,
      title: offer?.title || application.offer?.title || 'Offre',
    },
  };
};

export const getCompanyApplicationStatusCounts = (applications = []) => applications.reduce((counts, application) => {
  counts.total += 1;
  counts[application.status] = (counts[application.status] || 0) + 1;
  return counts;
}, {
  total: 0,
  SENT: 0,
  PENDING: 0,
  ACCEPTED: 0,
  REJECTED: 0,
  CANCELLED: 0,
});

export const getApplicationSearchText = (application) => [
  application.student.firstName,
  application.student.lastName,
  application.student.email,
  application.student.location,
  application.student.educationLevel,
  application.student.targetJob,
  ...application.matching.matchedSkills,
  ...application.matching.missingSkills,
].filter(Boolean).join(' ').toLowerCase();

export const filterAndSortCompanyApplications = (applications, filters) => {
  const query = filters.query.trim().toLowerCase();
  const minScore = Number(filters.minScore);

  return applications
    .filter((application) => {
      if (filters.status !== 'ALL' && application.status !== filters.status) return false;
      if (minScore > 0 && (application.matching.score === null || application.matching.score < minScore)) return false;
      if (query && !getApplicationSearchText(application).includes(query)) return false;
      return true;
    })
    .sort((first, second) => {
      if (filters.sort === 'oldest') return new Date(first.appliedAt || 0) - new Date(second.appliedAt || 0);
      if (filters.sort === 'score') return (second.matching.score ?? -1) - (first.matching.score ?? -1);
      if (filters.sort === 'name') {
        return `${first.student.lastName} ${first.student.firstName}`.localeCompare(`${second.student.lastName} ${second.student.firstName}`);
      }
      if (filters.sort === 'status') return first.status.localeCompare(second.status);
      return new Date(second.appliedAt || 0) - new Date(first.appliedAt || 0);
    });
};

export const getReadableApplicationError = (error, fallback = 'Impossible de charger les candidatures de cette offre.') => {
  if (error.response?.status === 403) return 'FORBIDDEN';
  if (!error.response) return 'Impossible de contacter le serveur. Verifiez que le backend est demarre.';
  if (error.response.status === 404) return 'Offre ou candidature introuvable.';
  if (error.response.status === 400) return error.response.data?.message || 'Donnees invalides.';
  return error.response.data?.message || fallback;
};

export const getAvailableNextStatuses = (currentStatus) => (
  applicationStatuses.filter((status) => status !== currentStatus)
);
