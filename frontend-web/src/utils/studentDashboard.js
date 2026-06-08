import { normalizeJsonField, normalizeScore, toArray } from './formatters.js';

const profileFields = [
  ['phone', 'Telephone'],
  ['location', 'Localisation'],
  ['educationLevel', "Niveau d'etudes"],
  ['targetJob', 'Objectif metier'],
  ['bio', 'Bio'],
  ['availabilityDate', 'Disponibilite'],
];

const isFilled = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return true;
};

export const calculateProfileCompletion = (student) => {
  const filledFields = profileFields.filter(([field]) => isFilled(student?.[field])).map(([, label]) => label);
  const missingFields = profileFields.filter(([field]) => !isFilled(student?.[field])).map(([, label]) => label);
  const percentage = Math.round((filledFields.length / profileFields.length) * 100);

  return {
    percentage,
    filledFields,
    missingFields,
  };
};

export const getLatestCv = (cvs = []) => {
  if (!cvs.length) {
    return null;
  }

  return [...cvs].sort((first, second) => new Date(second.uploadedAt) - new Date(first.uploadedAt))[0];
};

export const getCvAnalysis = (cv) => {
  const analysis = normalizeJsonField(cv?.analysisJson);
  return analysis && typeof analysis === 'object' ? analysis : null;
};

export const getCvSkills = (cv) => toArray(getCvAnalysis(cv)?.skills);

export const hasValidCvAnalysis = (cv) => {
  const analysis = getCvAnalysis(cv);
  return Boolean(analysis && !analysis.error && (toArray(analysis.skills).length || analysis.summary || analysis.experienceLevel));
};

export const getExperienceLevelLabel = (level) => {
  const labels = {
    junior: 'Junior',
    intermediate: 'Intermediaire',
    senior: 'Confirme',
  };

  return labels[String(level || '').toLowerCase()] || level || 'Non estime';
};

export const getParsedTextPreview = (text, limit = 500) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit)}...`;
};

export const getRecommendationScore = (recommendation) => (
  normalizeScore(recommendation?.matching?.score ?? recommendation?.score)
);

export const getBestRecommendationScore = (recommendations = []) => {
  const scores = recommendations.map(getRecommendationScore).filter((score) => score !== null);

  if (!scores.length) {
    return null;
  }

  return Math.max(...scores);
};

export const getMissingSkillsFromRecommendations = (recommendations = []) => {
  const counts = new Map();

  recommendations.forEach((recommendation) => {
    toArray(recommendation?.matching?.missingSkills).forEach((skill) => {
      counts.set(skill, (counts.get(skill) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, 5)
    .map(([skill]) => skill);
};
