export const applicationStatuses = [
  'SENT',
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'CANCELLED',
] as const;

export type KnownApplicationStatus = typeof applicationStatuses[number];
export type ApplicationStatus = KnownApplicationStatus | 'UNKNOWN';
export type ApplicationStatusFilter = 'ALL' | KnownApplicationStatus;

export const normalizeApplicationStatus = (value: unknown): ApplicationStatus =>
  typeof value === 'string' && applicationStatuses.includes(value as KnownApplicationStatus)
    ? value as KnownApplicationStatus
    : 'UNKNOWN';
