import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { generateCareerAdvice } from '../../api/careerAssistantApi.js';
import { getPublishedOffers, getStudentRecommendations } from '../../api/offersApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import CareerAdviceResult from '../../components/student/career/CareerAdviceResult.jsx';
import CareerAssistantEmptyState from '../../components/student/career/CareerAssistantEmptyState.jsx';
import CareerAssistantHeader from '../../components/student/career/CareerAssistantHeader.jsx';
import CareerOfferSelector from '../../components/student/career/CareerOfferSelector.jsx';
import CareerQuestionForm from '../../components/student/career/CareerQuestionForm.jsx';
import {
  buildCareerOfferOptions,
  getCareerAssistantError,
  normalizeCareerAdviceResponse,
} from '../../utils/careerAssistant.js';

function CareerGenerationState() {
  const steps = [
    'Analyse du profil',
    'Comparaison avec l offre',
    'Preparation du plan d action',
  ];

  return (
    <section className="rounded-stitch border border-ai/10 bg-aiSoft/50 p-6 shadow-panel" aria-live="polite">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Generation</p>
      <h2 className="mt-2 text-xl font-black text-ink">SmartIntern AI analyse votre demande</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step} className="rounded-stitch border border-white/70 bg-white p-4 shadow-panel">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-black text-white">{index + 1}</span>
            <p className="mt-3 text-sm font-black text-ink">{step}</p>
            <p className="mt-1 text-xs leading-5 text-muted">Etape indicative, sans pourcentage artificiel.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StudentCareerAssistantPage() {
  const [searchParams] = useSearchParams();
  const queryOfferId = searchParams.get('offerId');
  const [offers, setOffers] = useState([]);
  const [recommendedOffers, setRecommendedOffers] = useState([]);
  const [selectedOfferId, setSelectedOfferId] = useState(queryOfferId || '');
  const [question, setQuestion] = useState('');
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const [advice, setAdvice] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const questionRef = useRef(null);
  const resultRef = useRef(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    setNotice('');

    const [offersResult, recommendationsResult] = await Promise.allSettled([
      getPublishedOffers(),
      getStudentRecommendations({ limit: 10, minScore: 0 }),
    ]);

    if (offersResult.status === 'fulfilled') {
      setOffers(Array.isArray(offersResult.value) ? offersResult.value : []);
    } else {
      setOffers([]);
      setLoadError('Impossible de charger les offres publiees. Verifiez que le backend est demarre.');
    }

    if (recommendationsResult.status === 'fulfilled') {
      setRecommendedOffers(recommendationsResult.value.recommendations || []);
    } else {
      setRecommendedOffers([]);
      setNotice('Les recommandations personnalisees sont indisponibles pour le moment. Les offres publiques restent utilisables.');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const offerOptions = useMemo(() => buildCareerOfferOptions({
    offers,
    recommendations: recommendedOffers,
    selectedOfferId: queryOfferId,
  }), [offers, queryOfferId, recommendedOffers]);

  useEffect(() => {
    if (!offerOptions.length) {
      setSelectedOfferId('');
      return;
    }

    const hasSelectedOffer = offerOptions.some((offer) => String(offer.id) === String(selectedOfferId));
    const urlOffer = queryOfferId && offerOptions.find((offer) => String(offer.id) === String(queryOfferId));

    if (urlOffer) {
      setSelectedOfferId(urlOffer.id);
      return;
    }

    if (queryOfferId && !urlOffer) {
      setNotice('L offre transmise dans l URL n est pas disponible. Choisissez une autre offre.');
    }

    if (!hasSelectedOffer) {
      setSelectedOfferId(offerOptions[0].id);
    }
  }, [offerOptions, queryOfferId, selectedOfferId]);

  const selectedOffer = useMemo(
    () => offerOptions.find((offer) => String(offer.id) === String(selectedOfferId)),
    [offerOptions, selectedOfferId],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedOfferId) {
      setFormError('Selectionnez une offre valide.');
      return;
    }

    setIsGenerating(true);
    setFormError('');
    setAdvice(null);

    try {
      const trimmedQuestion = question.trim();
      const payload = { offerId: selectedOfferId };

      if (trimmedQuestion) {
        payload.question = trimmedQuestion;
      }

      const response = await generateCareerAdvice(payload);
      const normalizedAdvice = normalizeCareerAdviceResponse(response);
      setSubmittedQuestion(trimmedQuestion);
      setAdvice(normalizedAdvice);
      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } catch (error) {
      setFormError(getCareerAssistantError(error));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAskAnother = () => {
    questionRef.current?.focus();
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <CareerAssistantHeader />

      {loadError ? (
        <ErrorState title="Offres indisponibles" message={loadError} onRetry={loadData} />
      ) : null}

      {notice ? (
        <div className="rounded-stitch border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-bold leading-6 text-amber-800" aria-live="polite">
          {notice}
        </div>
      ) : null}

      {offerOptions.length ? (
        <div className="space-y-7">
          <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <CareerOfferSelector
              offers={offerOptions}
              selectedOfferId={selectedOfferId}
              onSelectOffer={(offerId) => {
                setSelectedOfferId(offerId);
                setAdvice(null);
                setSubmittedQuestion('');
                setFormError('');
              }}
            />
            <CareerQuestionForm
              ref={questionRef}
              question={question}
              selectedOfferId={selectedOfferId}
              isSubmitting={isGenerating}
              error={formError}
              onQuestionChange={(value) => {
                setQuestion(value);
                setFormError('');
              }}
              onSubmit={handleSubmit}
            />
          </div>
          <div className="space-y-6 scroll-mt-24" ref={resultRef}>
            {isGenerating ? <CareerGenerationState /> : null}
            {!isGenerating && advice ? (
              <CareerAdviceResult advice={advice} offer={selectedOffer} question={submittedQuestion} onAskAnother={handleAskAnother} />
            ) : null}
            {!isGenerating && !advice ? <CareerAssistantEmptyState /> : null}
          </div>
        </div>
      ) : (
        <CareerAssistantEmptyState
          variant="no-offers"
          action={(
            <Link className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-black text-white shadow-panel" to="/student/offers">
              Voir les offres
            </Link>
          )}
        />
      )}
    </div>
  );
}

export default StudentCareerAssistantPage;
