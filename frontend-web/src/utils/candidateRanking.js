import { applicationStatusLabels } from './companyDashboard.js';
import { formatDate, normalizeScore, toArray } from './formatters.js';
import { normalizeAiMatchResult } from './ai.js';

const unavailableScorePatterns = [
  'no analyzed cv',
  'no candidate skills',
  'could not be matched',
];

const getStudentUser = (student = {}) => student.user || {};
const getFullName = (student = {}) => `${student.firstName || ''} ${student.lastName || ''}`.trim();

const isUnavailableScore = (matching = {}) => {
  const explanation = String(matching.explanation || '').toLowerCase();
  return unavailableScorePatterns.some((pattern) => explanation.includes(pattern));
};

export const normalizeRankingCandidate = (candidate, fallbackOffer, index = 0) => {
  if (!candidate) return null;

  const student = candidate.student || {};
  const user = getStudentUser(student);
  const matching = candidate.matching || {};
  const score = normalizeScore(matching.score);
  const hasAnalyzedCv = !isUnavailableScore(matching);
  const rank = Number(candidate.rank);
  const status = candidate.applicationStatus || candidate.status || 'SENT';

  return {
    originalRank: Number.isFinite(rank) ? rank : index + 1,
    rank: Number.isFinite(rank) ? rank : index + 1,
    applicationId: candidate.applicationId || candidate.id,
    applicationStatus: status,
    applicationStatusLabel: applicationStatusLabels[status] || status || 'Statut inconnu',
    appliedAt: candidate.appliedAt || null,
    hasAnalyzedCv,
    hasScore: hasAnalyzedCv && score !== null,
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
      id: fallbackOffer?.id || candidate.offer?.id || candidate.offerId,
      title: fallbackOffer?.title || candidate.offer?.title || 'Offre',
    },
    matching: { ...normalizeAiMatchResult(matching), score },
  };
};

const compareRankedCandidates = (first, second) => {
  if (first.hasScore !== second.hasScore) return first.hasScore ? -1 : 1;
  if ((second.matching.score ?? -1) !== (first.matching.score ?? -1)) {
    return (second.matching.score ?? -1) - (first.matching.score ?? -1);
  }

  const firstDate = new Date(first.appliedAt || 0).getTime();
  const secondDate = new Date(second.appliedAt || 0).getTime();
  if (firstDate !== secondDate) return firstDate - secondDate;

  return getFullName(first.student).localeCompare(getFullName(second.student));
};

export const normalizeCandidateRankingResponse = (response) => {
  const source = response?.data || response || {};
  const offer = source.offer || {};
  const candidates = (source.candidates || [])
    .map((candidate, index) => normalizeRankingCandidate(candidate, offer, index))
    .filter(Boolean)
    .sort(compareRankedCandidates)
    .map((candidate, index) => ({
      ...candidate,
      originalRank: candidate.originalRank || index + 1,
      rank: candidate.originalRank || index + 1,
    }));

  return {
    offer: {
      id: offer.id,
      title: offer.title || 'Offre',
    },
    count: Number(source.count ?? candidates.length) || candidates.length,
    candidates,
  };
};

export const getRankingSummary = (candidates = []) => {
  const scored = candidates.filter((candidate) => candidate.hasScore);
  const scores = scored.map((candidate) => candidate.matching.score).filter((score) => Number.isFinite(score));
  const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
  const best = scores.length ? Math.max(...scores) : null;

  return {
    total: candidates.length,
    withScore: scored.length,
    average,
    best,
    withoutCv: candidates.filter((candidate) => !candidate.hasAnalyzedCv).length,
  };
};

export const getCandidateSearchText = (candidate) => [
  candidate.student.firstName,
  candidate.student.lastName,
  candidate.student.email,
  candidate.student.location,
  candidate.student.educationLevel,
  candidate.student.targetJob,
  ...candidate.matching.matchedSkills,
  ...candidate.matching.missingSkills,
  ...candidate.matching.optionalMatchedSkills,
].filter(Boolean).join(' ').toLowerCase();

export const filterAndSortRankingCandidates = (candidates, filters) => {
  const query = filters.query.trim().toLowerCase();
  const skill = filters.skill.trim().toLowerCase();
  const minScore = Number(filters.minScore);

  return candidates
    .filter((candidate) => {
      if (filters.status !== 'ALL' && candidate.applicationStatus !== filters.status) return false;
      if (filters.scoreMode === 'WITH_SCORE' && !candidate.hasScore) return false;
      if (filters.scoreMode === 'WITHOUT_SCORE' && candidate.hasScore) return false;
      if (minScore > 0 && (!candidate.hasScore || candidate.matching.score < minScore)) return false;
      if (query && !getCandidateSearchText(candidate).includes(query)) return false;
      if (skill) {
        const allSkills = [...candidate.matching.matchedSkills, ...candidate.matching.missingSkills].join(' ').toLowerCase();
        if (!allSkills.includes(skill)) return false;
      }
      return true;
    })
    .sort((first, second) => {
      if (filters.sort === 'scoreAsc') return (first.matching.score ?? 101) - (second.matching.score ?? 101);
      if (filters.sort === 'scoreDesc') return (second.matching.score ?? -1) - (first.matching.score ?? -1);
      if (filters.sort === 'date') return new Date(second.appliedAt || 0) - new Date(first.appliedAt || 0);
      if (filters.sort === 'name') return getFullName(first.student).localeCompare(getFullName(second.student));
      return first.originalRank - second.originalRank;
    });
};

export const getReadableRankingError = (error, fallback = 'Le classement IA est temporairement indisponible. Les candidatures restent consultables depuis la page dediee.') => {
  if (error.response?.status === 403) return 'FORBIDDEN';
  if (!error.response) return 'Impossible de contacter le serveur. Verifiez que le backend et le service IA sont demarres.';
  if (error.response.status === 400) return 'Selectionnez une offre valide.';
  if (error.response.status === 404) return 'Cette offre n existe plus ou n est pas accessible.';
  if (error.response.status === 500 || error.response.status === 503) return fallback;
  return error.response.data?.message || fallback;
};

export const formatRankDate = (value) => (value ? formatDate(value) : 'Date non renseignee');
