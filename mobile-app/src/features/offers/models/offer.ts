import type { OfferMatch } from './offerMatch';

export type OfferStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'CLOSED' | string;

export type OfferCompany = {
  id?: string | null;
  companyName: string;
  sector?: string | null;
};

export type Offer = {
  id: string;
  companyId?: string | null;
  title: string;
  description?: string | null;
  location?: string | null;
  duration?: string | null;
  startDate?: string | null;
  requiredSkills: string[];
  optionalSkills: string[];
  status?: OfferStatus | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  company: OfferCompany;
  match?: OfferMatch;
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? value as UnknownRecord : {};

const asOptionalString = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value : null;

export const normalizeSkills = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
  }

  if (typeof value === 'string') {
    try {
      return normalizeSkills(JSON.parse(value));
    } catch {
      return [];
    }
  }

  return [];
};

export const normalizeOffer = (value: unknown): Offer => {
  const offer = asRecord(value);
  const company = asRecord(offer.company);

  return {
    id: String(offer.id ?? ''),
    companyId: asOptionalString(offer.companyId),
    title: String(offer.title ?? 'Offre sans titre'),
    description: asOptionalString(offer.description),
    location: asOptionalString(offer.location),
    duration: asOptionalString(offer.duration),
    startDate: asOptionalString(offer.startDate),
    requiredSkills: normalizeSkills(offer.requiredSkills ?? offer.requiredSkillsJson),
    optionalSkills: normalizeSkills(offer.optionalSkills ?? offer.optionalSkillsJson),
    status: asOptionalString(offer.status),
    createdAt: asOptionalString(offer.createdAt),
    updatedAt: asOptionalString(offer.updatedAt),
    company: {
      id: asOptionalString(company.id),
      companyName: String(company.companyName ?? 'Entreprise non renseignée'),
      sector: asOptionalString(company.sector),
    },
  };
};
