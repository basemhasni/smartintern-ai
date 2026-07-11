import { normalizeApplication, type StudentApplication } from './application';

export type ApplicationsCollection = {
  items: StudentApplication[];
  total: number;
  page: 1;
  hasMore: false;
  isComplete: true;
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? value as UnknownRecord : {};

export const normalizeApplicationsResponse = (value: unknown): ApplicationsCollection => {
  const response = asRecord(value);
  const rawApplications = Array.isArray(value)
    ? value
    : Array.isArray(response.applications)
      ? response.applications
      : [];
  const items = rawApplications.map(normalizeApplication);

  return {
    items,
    total: items.length,
    page: 1,
    hasMore: false,
    isComplete: true,
  };
};
