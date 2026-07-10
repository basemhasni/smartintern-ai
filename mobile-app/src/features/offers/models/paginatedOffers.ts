import type { Offer } from './offer';

export type PaginatedOffers = {
  offers: Offer[];
  page: number;
  hasMore: boolean;
  total: number;
};

export const createUnpaginatedOffers = (offers: Offer[]): PaginatedOffers => ({
  offers,
  page: 1,
  hasMore: false,
  total: offers.length,
});
