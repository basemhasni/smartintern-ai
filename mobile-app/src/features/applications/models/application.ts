import { normalizeOffer, type Offer } from '@/features/offers/models/offer';

export type ApplicationStatus =
  | 'SENT'
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | string;

export type StudentApplication = {
  id: string;
  studentId?: string | null;
  offerId: string;
  status: ApplicationStatus;
  message?: string | null;
  compatibilityScore?: number | null;
  appliedAt?: string | null;
  updatedAt?: string | null;
  offer?: Offer | null;
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? value as UnknownRecord : {};

const asOptionalString = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value : null;

export const normalizeApplication = (value: unknown): StudentApplication => {
  const application = asRecord(value);
  const rawOffer = asRecord(application.offer);
  const offerId = String(application.offerId ?? rawOffer.id ?? '');

  return {
    id: String(application.id ?? ''),
    studentId: asOptionalString(application.studentId),
    offerId,
    status: String(application.status ?? 'SENT'),
    message: asOptionalString(application.message),
    compatibilityScore: typeof application.compatibilityScore === 'number'
      ? application.compatibilityScore
      : null,
    appliedAt: asOptionalString(application.appliedAt),
    updatedAt: asOptionalString(application.updatedAt),
    offer: Object.keys(rawOffer).length ? normalizeOffer(rawOffer) : null,
  };
};
