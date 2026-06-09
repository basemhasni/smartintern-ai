import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getOfferApplications, getOfferCandidateRanking } from '../../api/companyApplicationsApi.js';
import { getCompanyProfile } from '../../api/companyApi.js';
import { getCompanyOffers } from '../../api/companyOffersApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import CompanyApplicationsOverview from '../../components/company/CompanyApplicationsOverview.jsx';
import CompanyOffersPreview from '../../components/company/CompanyOffersPreview.jsx';
import CompanyProfileSummary from '../../components/company/CompanyProfileSummary.jsx';
import CompanyQuickActions from '../../components/company/CompanyQuickActions.jsx';
import CompanyStatsGrid from '../../components/company/CompanyStatsGrid.jsx';
import CompanyTopCandidates from '../../components/company/CompanyTopCandidates.jsx';
import {
  getApplicationStatusCounts,
  getCompanyDashboardGreeting,
  getOfferStatusCounts,
  normalizeApplication,
  normalizeCandidateRanking,
  normalizeCompanyOffer,
  normalizeCompanyProfile,
  selectApplicationSampleOffers,
  selectRankingOffer,
} from '../../utils/companyDashboard.js';

function CompanyDashboardPage() {
  const [company, setCompany] = useState(null);
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicationsByOffer, setApplicationsByOffer] = useState({});
  const [rankingOffer, setRankingOffer] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [offersError, setOffersError] = useState('');
  const [applicationsError, setApplicationsError] = useState('');
  const [rankingError, setRankingError] = useState('');
  const [isApplicationsPartial, setIsApplicationsPartial] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setProfileError('');
    setOffersError('');
    setApplicationsError('');
    setRankingError('');

    const [profileResult, offersResult] = await Promise.allSettled([
      getCompanyProfile(),
      getCompanyOffers(),
    ]);

    if (profileResult.status === 'fulfilled') {
      setCompany(normalizeCompanyProfile(profileResult.value));
    } else {
      setCompany(null);
      setProfileError('Impossible de charger le profil entreprise.');
    }

    let normalizedOffers = [];

    if (offersResult.status === 'fulfilled') {
      normalizedOffers = (offersResult.value || []).map(normalizeCompanyOffer).filter(Boolean);
      setOffers(normalizedOffers);
    } else {
      setOffers([]);
      setOffersError('Impossible de charger vos offres.');
    }

    const sampleOffers = selectApplicationSampleOffers(normalizedOffers);
    setIsApplicationsPartial(sampleOffers.length < normalizedOffers.filter((offer) => offer.status === 'PUBLISHED').length);

    const applicationResults = await Promise.allSettled(
      sampleOffers.map((offer) => getOfferApplications(offer.id).then((items) => ({
        offer,
        applications: (items || []).map((application) => normalizeApplication(application, offer)).filter(Boolean),
      }))),
    );

    const nextApplicationsByOffer = {};
    const nextApplications = [];
    let hasApplicationError = false;

    applicationResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        nextApplicationsByOffer[result.value.offer.id] = result.value.applications;
        nextApplications.push(...result.value.applications);
      } else {
        hasApplicationError = true;
      }
    });

    setApplicationsByOffer(nextApplicationsByOffer);
    setApplications(nextApplications.sort((first, second) => new Date(second.appliedAt || 0) - new Date(first.appliedAt || 0)));

    if (hasApplicationError) {
      setApplicationsError('Certaines candidatures n ont pas pu etre chargees.');
    }

    const selectedRankingOffer = selectRankingOffer(normalizedOffers, nextApplicationsByOffer);
    setRankingOffer(selectedRankingOffer);

    if (selectedRankingOffer) {
      try {
        const ranking = await getOfferCandidateRanking(selectedRankingOffer.id, {
          minScore: 0,
          includeWithoutCV: true,
        });
        setCandidates((ranking.candidates || []).map(normalizeCandidateRanking).filter(Boolean).slice(0, 3));
      } catch (error) {
        setCandidates([]);
        setRankingError('Le classement IA est temporairement indisponible.');
      }
    } else {
      setCandidates([]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const offerCounts = useMemo(() => getOfferStatusCounts(offers), [offers]);
  const applicationCounts = useMemo(() => getApplicationStatusCounts(applications), [applications]);
  const applicationScopeLabel = isApplicationsPartial
    ? 'Apercu limite aux 5 offres publiees les plus recentes.'
    : 'Total calcule depuis les offres chargees.';

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (profileError && !company) {
    return <ErrorState title="Profil indisponible" message={profileError} onRetry={loadDashboard} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Dashboard entreprise</p>
            <h1 className="mt-2 text-2xl font-black leading-tight text-ink md:text-3xl">
              {getCompanyDashboardGreeting(company)}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              Gerez vos offres, suivez les candidatures et identifiez les profils les plus compatibles.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link className="rounded-lg bg-primary px-5 py-3 text-center text-sm font-black text-white shadow-panel" to="/company/offers">
              Creer une offre
            </Link>
            <Link className="rounded-lg border border-line bg-white px-5 py-3 text-center text-sm font-black text-ink shadow-panel" to="/company/offers">
              Voir mes offres
            </Link>
          </div>
        </div>
      </section>

      {offersError ? <ErrorState title="Offres indisponibles" message={offersError} onRetry={loadDashboard} /> : null}
      {applicationsError ? <ErrorState title="Candidatures partielles" message={applicationsError} onRetry={loadDashboard} /> : null}

      <CompanyStatsGrid
        offerCounts={offerCounts}
        applicationsCount={applications.length}
        applicationScopeLabel={applicationScopeLabel}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <CompanyOffersPreview offers={offers} />
          <CompanyApplicationsOverview
            applications={applications}
            counts={applicationCounts}
            isPartial={isApplicationsPartial}
          />
        </div>
        <div className="space-y-6">
          <CompanyProfileSummary company={company} />
          <CompanyTopCandidates candidates={candidates} offer={rankingOffer} error={rankingError} />
        </div>
      </div>

      <CompanyQuickActions />
    </div>
  );
}

export default CompanyDashboardPage;
