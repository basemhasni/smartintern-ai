import type {
  LetterEvidence,
  LetterQualityCheck,
  MotivationLetter,
  MotivationLetterOffer,
  MotivationLetterTone,
  MotivationLetterV2,
} from '../models/motivationLetter';

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {};
const asString = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null;
const asStringArray = (value: unknown) => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim())
  : [];
const asBoolean = (value: unknown) => typeof value === 'boolean' ? value : null;
const asNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : null;

const qualityLabels: Record<string, string> = {
  mentionsCompany: 'Entreprise mentionnee',
  mentionsOffer: 'Offre mentionnee',
  usesOnlyVerifiedSkills: 'Competences verifiees uniquement',
  doesNotClaimMissingSkills: 'Aucune competence manquante revendiquee',
  hasProfessionalTone: 'Ton professionnel',
  hasClearStructure: 'Structure claire',
  lengthOk: 'Longueur adaptee',
};

const normalizeTone = (value: unknown): MotivationLetterTone =>
  value === 'DYNAMIC' || value === 'SIMPLE' ? value : 'PROFESSIONAL';

const normalizeEvidence = (value: unknown): LetterEvidence[] =>
  Array.isArray(value) ? value.map((item) => {
    if (typeof item === 'string') return { text: item };
    const evidence = asRecord(item);
    return {
      skill: asString(evidence.skill),
      level: asString(evidence.level),
      type: asString(evidence.type),
      text: asString(evidence.text),
    };
  }).filter((item) => item.skill || item.text) : [];

const normalizeQualityChecks = (value: unknown): LetterQualityCheck[] => {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      const check = asRecord(item);
      const code = asString(check.code) ?? `check-${index}`;
      return {
        code,
        label: asString(check.label) ?? qualityLabels[code] ?? code,
        passed: check.passed === true,
        detail: asString(check.message ?? check.details),
      };
    });
  }

  const checks = asRecord(value);
  const wordCount = asNumber(checks.wordCount);
  const expected = asRecord(checks.expectedRange);
  const rangeDetail = wordCount === null
    ? null
    : `${wordCount} mots${asNumber(expected.min) !== null && asNumber(expected.max) !== null ? `, cible ${expected.min}-${expected.max}` : ''}`;

  return Object.entries(qualityLabels).flatMap(([code, label]) => {
    const passed = asBoolean(checks[code]);
    if (passed === null) return [];
    return [{ code, label, passed, detail: code === 'lengthOk' ? rangeDetail : null }];
  });
};

const normalizeOffer = (value: unknown): MotivationLetterOffer | null => {
  const offer = asRecord(value);
  if (!Object.keys(offer).length) return null;
  const company = asRecord(offer.company);
  return {
    id: String(offer.id ?? ''),
    title: asString(offer.title) ?? 'Offre indisponible',
    location: asString(offer.location),
    status: asString(offer.status),
    company: {
      id: asString(company.id),
      companyName: asString(company.companyName) ?? 'Entreprise non renseignee',
      sector: asString(company.sector),
    },
  };
};

const normalizeV2 = (value: unknown, generatedAt?: unknown): MotivationLetterV2 | null => {
  const v2 = asRecord(value);
  if (!Object.keys(v2).length) return null;
  return {
    generationMethod: asString(v2.generationMethod),
    language: asString(v2.language),
    usedEvidence: normalizeEvidence(v2.usedEvidence),
    usedSkills: asStringArray(v2.usedSkills),
    avoidedClaims: asStringArray(v2.avoidedClaims),
    missingSkillsHandled: asStringArray(v2.missingSkillsHandled),
    qualityChecks: normalizeQualityChecks(v2.qualityChecks),
    personalizationScore: asNumber(v2.personalizationScore),
    warnings: asStringArray(v2.warnings),
    ragContextUsed: asBoolean(v2.ragContextUsed ?? v2.usedRagContext),
    generatedAt: asString(v2.generatedAt ?? generatedAt),
  };
};

export const normalizeMotivationLetter = (value: unknown): MotivationLetter => {
  const envelope = asRecord(value);
  const raw = asRecord(envelope.motivationLetter ?? envelope.letter ?? value);
  const application = asRecord(raw.application);
  const content = asString(raw.content ?? raw.generatedLetter ?? raw.letter) ?? '';

  return {
    id: String(raw.id ?? ''),
    applicationId: String(raw.applicationId ?? application.id ?? ''),
    studentId: asString(raw.studentId),
    offerId: asString(raw.offerId),
    tone: normalizeTone(raw.tone),
    content,
    generatedByAI: raw.generatedByAI !== false,
    createdAt: asString(raw.createdAt),
    updatedAt: asString(raw.updatedAt),
    offer: normalizeOffer(raw.offer),
    applicationStatus: asString(application.status),
    v2: normalizeV2(raw.v2, raw.generatedAt),
  };
};

export const normalizeMotivationLettersResponse = (value: unknown): MotivationLetter[] => {
  const response = asRecord(value);
  const items = Array.isArray(response.motivationLetters)
    ? response.motivationLetters
    : Array.isArray(response.items) ? response.items : Array.isArray(value) ? value : [];
  return items.map(normalizeMotivationLetter).filter((letter) => letter.id && letter.applicationId);
};

