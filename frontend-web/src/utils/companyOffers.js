import { formatDate, toArray } from './formatters.js';
import { offerStatusLabels } from './companyDashboard.js';

export const offerStatuses = ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'];

export const normalizeCompanyOffer = (offer) => {
  if (!offer) {
    return null;
  }

  const applicationsCount = Number(offer.applicationsCount ?? offer._count?.applications);

  return {
    ...offer,
    id: offer.id,
    title: offer.title || 'Offre sans titre',
    description: offer.description || '',
    location: offer.location || '',
    duration: offer.duration || '',
    startDate: offer.startDate || null,
    requiredSkills: toArray(offer.requiredSkills ?? offer.requiredSkillsJson),
    optionalSkills: toArray(offer.optionalSkills ?? offer.optionalSkillsJson),
    status: offer.status || 'DRAFT',
    statusLabel: offerStatusLabels[offer.status] || offer.status || 'Statut inconnu',
    createdAt: offer.createdAt || null,
    updatedAt: offer.updatedAt || null,
    applicationsCount: Number.isFinite(applicationsCount) ? applicationsCount : null,
  };
};

export const buildOfferFormValues = (offer) => ({
  title: offer?.title || '',
  description: offer?.description || '',
  location: offer?.location || '',
  duration: offer?.duration || '',
  startDate: offer?.startDate ? new Date(offer.startDate).toISOString().slice(0, 10) : '',
  requiredSkills: offer?.requiredSkills || [],
  optionalSkills: offer?.optionalSkills || [],
  status: offer?.status || 'DRAFT',
});

const cleanNullable = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  return trimmed === '' ? null : trimmed;
};

const uniqueSkills = (skills) => {
  const seen = new Set();

  return skills
    .map((skill) => skill.trim())
    .filter(Boolean)
    .filter((skill) => {
      const key = skill.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

export const buildOfferPayload = (values, statusOverride) => ({
  title: values.title.trim(),
  description: values.description.trim(),
  location: cleanNullable(values.location),
  duration: cleanNullable(values.duration),
  startDate: values.startDate ? values.startDate : null,
  requiredSkills: uniqueSkills(values.requiredSkills),
  optionalSkills: uniqueSkills(values.optionalSkills),
  status: statusOverride || values.status,
});

export const validateOfferForm = (values) => {
  const errors = {};
  const requiredSkills = uniqueSkills(values.requiredSkills);
  const optionalSkills = uniqueSkills(values.optionalSkills);
  const requiredSet = new Set(requiredSkills.map((skill) => skill.toLowerCase()));
  const duplicateAcrossGroups = optionalSkills.find((skill) => requiredSet.has(skill.toLowerCase()));

  if (!values.title.trim()) {
    errors.title = 'Le titre est obligatoire.';
  }

  if (values.title.trim().length > 180) {
    errors.title = 'Le titre ne doit pas depasser 180 caracteres.';
  }

  if (!values.description.trim()) {
    errors.description = 'La description est obligatoire.';
  }

  if (values.description.trim().length > 2000) {
    errors.description = 'La description ne doit pas depasser 2000 caracteres.';
  }

  if (values.location.trim().length > 160) {
    errors.location = 'La localisation ne doit pas depasser 160 caracteres.';
  }

  if (values.duration.trim().length > 120) {
    errors.duration = 'La duree ne doit pas depasser 120 caracteres.';
  }

  if (values.startDate && Number.isNaN(new Date(values.startDate).getTime())) {
    errors.startDate = 'La date de debut doit etre valide.';
  }

  if (!offerStatuses.includes(values.status)) {
    errors.status = 'Statut invalide.';
  }

  if (duplicateAcrossGroups) {
    errors.optionalSkills = `${duplicateAcrossGroups} est deja dans les competences requises.`;
  }

  return errors;
};

export const getOfferSearchText = (offer) => [
  offer.title,
  offer.description,
  offer.location,
  offer.duration,
  ...offer.requiredSkills,
  ...offer.optionalSkills,
].filter(Boolean).join(' ').toLowerCase();

export const filterAndSortCompanyOffers = (offers, filters) => {
  const query = filters.query.trim().toLowerCase();

  return offers
    .filter((offer) => {
      if (filters.status !== 'ALL' && offer.status !== filters.status) return false;
      if (filters.location && offer.location !== filters.location) return false;
      if (filters.duration && offer.duration !== filters.duration) return false;
      if (query && !getOfferSearchText(offer).includes(query)) return false;
      return true;
    })
    .sort((first, second) => {
      if (filters.sort === 'oldest') return new Date(first.createdAt || 0) - new Date(second.createdAt || 0);
      if (filters.sort === 'title') return first.title.localeCompare(second.title);
      if (filters.sort === 'status') return first.status.localeCompare(second.status);
      return new Date(second.updatedAt || second.createdAt || 0) - new Date(first.updatedAt || first.createdAt || 0);
    });
};

export const getOfferStatusCounts = (offers = []) => ({
  total: offers.length,
  DRAFT: offers.filter((offer) => offer.status === 'DRAFT').length,
  PUBLISHED: offers.filter((offer) => offer.status === 'PUBLISHED').length,
  ARCHIVED: offers.filter((offer) => offer.status === 'ARCHIVED').length,
  CLOSED: offers.filter((offer) => offer.status === 'CLOSED').length,
});

export const getUniqueOfferValues = (offers, field) => [...new Set(offers.map((offer) => offer[field]).filter(Boolean))].sort();

export const getReadableOfferError = (error, fallback = 'L offre n a pas pu etre enregistree. Verifiez les informations saisies.') => {
  if (error.response?.status === 403) return 'FORBIDDEN';
  if (!error.response) return 'Impossible de contacter le serveur. Verifiez que le backend est demarre.';
  if (error.response.status === 404) return 'Cette offre est introuvable.';
  if (error.response.status === 400) return error.response.data?.message || 'Certaines donnees sont invalides.';
  if (error.response.status === 409) return 'Conflit detecte pendant l operation.';
  return error.response.data?.message || fallback;
};

export const formatOfferDate = (value) => (value ? formatDate(value) : 'Non renseignee');
