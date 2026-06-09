import { formatDate, normalizeScore, toArray } from './formatters.js';

export const companyStatusLabels = {
  PENDING: 'En attente de validation',
  VALIDATED: 'Validee',
  REJECTED: 'Refusee',
  SUSPENDED: 'Suspendue',
};

export const offerStatusLabels = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publiee',
  ARCHIVED: 'Archivee',
  CLOSED: 'Fermee',
};

export const applicationStatusLabels = {
  SENT: 'Recue',
  PENDING: 'En cours d examen',
  ACCEPTED: 'Acceptee',
  REJECTED: 'Refusee',
  CANCELLED: 'Annulee',
};

export const normalizeCompanyProfile = (company) => {
  if (!company) {
    return null;
  }

  return {
    ...company,
    companyName: company.companyName || '',
    sector: company.sector || '',
    description: company.description || '',
    website: company.website || '',
    address: company.address || '',
    status: company.status || 'PENDING',
    statusLabel: companyStatusLabels[company.status] || company.status || 'Statut inconnu',
    user: company.user || null,
  };
};

export const calculateCompanyProfileCompletion = (company) => {
  const fields = ['companyName', 'sector', 'description', 'website', 'address'];
  const filled = fields.filter((field) => String(company?.[field] || '').trim()).length;

  return Math.round((filled / fields.length) * 100);
};

export const normalizeCompanyOffer = (offer) => {
  if (!offer) {
    return null;
  }

  return {
    ...offer,
    id: offer.id,
    title: offer.title || 'Offre sans titre',
    description: offer.description || '',
    location: offer.location || '',
    duration: offer.duration || '',
    startDate: offer.startDate || null,
    createdAt: offer.createdAt || null,
    status: offer.status || 'DRAFT',
    statusLabel: offerStatusLabels[offer.status] || offer.status || 'Statut inconnu',
    requiredSkills: toArray(offer.requiredSkills ?? offer.requiredSkillsJson),
    optionalSkills: toArray(offer.optionalSkills ?? offer.optionalSkillsJson),
    company: offer.company || null,
  };
};

export const normalizeApplication = (application, offer) => {
  if (!application) {
    return null;
  }

  const student = application.student || {};
  const user = student.user || {};

  return {
    ...application,
    id: application.id,
    offerId: application.offerId || offer?.id,
    offerTitle: offer?.title || application.offer?.title || 'Offre',
    status: application.status || 'SENT',
    statusLabel: applicationStatusLabels[application.status] || application.status || 'Statut inconnu',
    appliedAt: application.appliedAt || null,
    updatedAt: application.updatedAt || null,
    message: application.message || '',
    student: {
      id: student.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: student.phone || '',
      location: student.location || '',
      educationLevel: student.educationLevel || '',
      targetJob: student.targetJob || '',
    },
  };
};

export const normalizeCandidateRanking = (candidate) => {
  if (!candidate) {
    return null;
  }

  return {
    rank: candidate.rank,
    applicationId: candidate.applicationId,
    applicationStatus: candidate.applicationStatus,
    applicationStatusLabel: applicationStatusLabels[candidate.applicationStatus] || candidate.applicationStatus || 'Statut inconnu',
    appliedAt: candidate.appliedAt,
    student: candidate.student || {},
    matching: {
      score: normalizeScore(candidate.matching?.score),
      matchedSkills: toArray(candidate.matching?.matchedSkills),
      missingSkills: toArray(candidate.matching?.missingSkills),
      optionalMatchedSkills: toArray(candidate.matching?.optionalMatchedSkills),
      explanation: candidate.matching?.explanation || '',
    },
  };
};

export const getOfferStatusCounts = (offers = []) => offers.reduce((counts, offer) => {
  counts.total += 1;
  counts[offer.status] = (counts[offer.status] || 0) + 1;
  return counts;
}, {
  total: 0,
  DRAFT: 0,
  PUBLISHED: 0,
  ARCHIVED: 0,
  CLOSED: 0,
});

export const getApplicationStatusCounts = (applications = []) => applications.reduce((counts, application) => {
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

export const calculateAverageCandidateScore = (candidates = []) => {
  const scores = candidates.map((candidate) => candidate.matching?.score).filter((score) => Number.isFinite(score));

  if (!scores.length) {
    return null;
  }

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};

export const selectApplicationSampleOffers = (offers = []) => (
  offers
    .filter((offer) => offer.status === 'PUBLISHED')
    .slice(0, 5)
);

export const selectRankingOffer = (offers = [], applicationsByOffer = {}) => {
  const publishedOffers = offers.filter((offer) => offer.status === 'PUBLISHED');
  const withApplications = publishedOffers.find((offer) => (applicationsByOffer[offer.id] || []).length > 0);

  return withApplications || publishedOffers[0] || null;
};

export const getCompanyDashboardGreeting = (company) => (
  company?.companyName
    ? `Bonjour ${company.companyName}, pret a rencontrer vos prochains talents ?`
    : 'Bienvenue dans votre espace entreprise'
);

export const formatNullableDate = (value) => (value ? formatDate(value) : 'Non renseignee');
