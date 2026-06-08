import { useCallback, useEffect, useMemo, useState } from 'react';

import { getStudentApplications } from '../../api/applicationsApi.js';
import { getPublishedOffers, getStudentRecommendations } from '../../api/offersApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import OfferList from '../../components/student/offers/OfferList.jsx';
import OffersEmptyState from '../../components/student/offers/OffersEmptyState.jsx';
import OffersFilters from '../../components/student/offers/OffersFilters.jsx';
import OffersHero from '../../components/student/offers/OffersHero.jsx';
import OffersResultsHeader from '../../components/student/offers/OffersResultsHeader.jsx';
import OffersSearchBar from '../../components/student/offers/OffersSearchBar.jsx';
import { buildOfferViewModels, filterAndSortOffers, getUniqueValues, isNoCvRecommendationError } from '../../utils/offers.js';

const defaultFilters = {
  query: '',
  view: 'all',
  location: '',
  duration: '',
  minScore: '0',
  sort: 'score',
};

const getErrorMessage = (error) => {
  if (!error.response) {
    return 'Impossible de charger cette section. Verifiez que le backend est demarre.';
  }

  return error.response.data?.message || 'Cette section est temporairement indisponible.';
};

function StudentOffersPage() {
  const [offers, setOffers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);

  const loadOffers = useCallback(async () => {
    setIsLoading(true);
    setErrors({});

    const [offersResult, recommendationsResult, applicationsResult] = await Promise.allSettled([
      getPublishedOffers(),
      getStudentRecommendations({ limit: 50, minScore: 0 }),
      getStudentApplications(),
    ]);

    if (offersResult.status === 'fulfilled') {
      setOffers(offersResult.value);
    } else {
      setOffers([]);
      setErrors((current) => ({ ...current, offers: getErrorMessage(offersResult.reason) }));
    }

    if (recommendationsResult.status === 'fulfilled') {
      setRecommendations(recommendationsResult.value.recommendations);
    } else {
      setRecommendations([]);
      const message = getErrorMessage(recommendationsResult.reason);
      setErrors((current) => ({
        ...current,
        recommendations: message,
        noCv: isNoCvRecommendationError(message),
      }));
    }

    if (applicationsResult.status === 'fulfilled') {
      setApplications(applicationsResult.value);
    } else {
      setApplications([]);
      setErrors((current) => ({ ...current, applications: getErrorMessage(applicationsResult.reason) }));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const offerViewModels = useMemo(() => buildOfferViewModels({ offers, recommendations, applications }), [applications, offers, recommendations]);
  const locations = useMemo(() => getUniqueValues(offerViewModels, 'location'), [offerViewModels]);
  const durations = useMemo(() => getUniqueValues(offerViewModels, 'duration'), [offerViewModels]);
  const filteredOffers = useMemo(() => filterAndSortOffers(offerViewModels, filters), [filters, offerViewModels]);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const resetFilters = () => setFilters(defaultFilters);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (errors.offers) {
    return <ErrorState title="Offres indisponibles" message={errors.offers} onRetry={loadOffers} />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <OffersHero recommendationsError={errors.noCv ? errors.recommendations : ''} />

      {errors.recommendations && !errors.noCv ? (
        <ErrorState title="Recommandations indisponibles" message={errors.recommendations} onRetry={loadOffers} />
      ) : null}
      {errors.applications ? (
        <div className="rounded-stitch border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          Impossible de verifier vos candidatures existantes. Les offres restent consultables.
        </div>
      ) : null}

      <div className="space-y-4">
        <OffersSearchBar value={filters.query} onChange={(value) => handleFilterChange('query', value)} />
        <OffersFilters
          filters={filters}
          locations={locations}
          durations={durations}
          onChange={handleFilterChange}
          onReset={resetFilters}
        />
      </div>

      <OffersResultsHeader count={filteredOffers.length} total={offerViewModels.length} />

      {!offerViewModels.length ? (
        <OffersEmptyState variant="no-offers" />
      ) : filteredOffers.length ? (
        <OfferList offers={filteredOffers} />
      ) : (
        <OffersEmptyState onReset={resetFilters} />
      )}
    </div>
  );
}

export default StudentOffersPage;
