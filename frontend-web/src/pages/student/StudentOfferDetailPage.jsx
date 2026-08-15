import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { applyToOffer, getStudentApplications } from '../../api/applicationsApi.js';
import { generateMotivationLetter, getMotivationLetter, updateMotivationLetter } from '../../api/motivationLettersApi.js';
import { getOfferById, getOfferMatching } from '../../api/offersApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import CareerSignalMap from '../../components/ai/CareerSignalMap.jsx';
import DecisionTraceTimeline from '../../components/ai/DecisionTraceTimeline.jsx';
import MissingSkillsPanel from '../../components/ai/MissingSkillsPanel.jsx';
import ScoreBreakdownCard from '../../components/ai/ScoreBreakdownCard.jsx';
import SkillEvidenceMap from '../../components/ai/SkillEvidenceMap.jsx';
import SkillGapSimulatorPanel from '../../components/ai/SkillGapSimulatorPanel.jsx';
import AiErrorBoundary from '../../components/ai/AiErrorBoundary.jsx';
import ApplyDialog from '../../components/student/offers/ApplyDialog.jsx';
import MatchingExplanation from '../../components/student/offers/MatchingExplanation.jsx';
import MotivationLetterDialog from '../../components/student/applications/MotivationLetterDialog.jsx';
import OfferDescription from '../../components/student/offers/OfferDescription.jsx';
import OfferDetailHeader from '../../components/student/offers/OfferDetailHeader.jsx';
import OfferSkills from '../../components/student/offers/OfferSkills.jsx';
import { getApplicationForOffer, normalizeMatching, normalizeOffer } from '../../utils/offers.js';
import { getLetterErrorMessage, normalizeApplication, normalizeApplications } from '../../utils/applications.js';

const getReadableError = (error) => {
  if (error.response?.status === 403) return 'FORBIDDEN';
  if (error.response?.status === 404) return 'Cette offre est introuvable ou n’est plus publiee.';
  if (!error.response) return 'Impossible de contacter le serveur. Verifiez que le backend est demarre.';
  return error.response.data?.error?.message || error.response.data?.message || 'Une erreur est survenue.';
};

const getMatchingError = (error) => {
  const message = getReadableError(error);
  const code = error?.normalized?.code || error?.response?.data?.error?.code;

  if (message.includes('No analyzed CV') || message.includes('No candidate skills')) {
    return 'Importez et analysez votre CV pour calculer le score personnalise de cette offre.';
  }

  if (['AI_SERVICE_UNAVAILABLE', 'AI_SERVICE_TIMEOUT', 'TIMEOUT'].includes(code) || message.includes('AI service')) {
    return 'Le service IA est indisponible. L’offre reste consultable et vous pouvez revenir plus tard pour le score.';
  }

  return message;
};

function StudentOfferDetailPage() {
  const { offerId } = useParams();
  const [offer, setOffer] = useState(null);
  const [matching, setMatching] = useState(null);
  const [matchingError, setMatchingError] = useState('');
  const [applications, setApplications] = useState([]);
  const [pageError, setPageError] = useState('');
  const [applyError, setApplyError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [shouldRedirectDenied, setShouldRedirectDenied] = useState(false);
  const [letterApplication, setLetterApplication] = useState(null);
  const [letter, setLetter] = useState(null);
  const [letterStatus, setLetterStatus] = useState('idle');
  const [letterError, setLetterError] = useState('');
  const [letterMessage, setLetterMessage] = useState('');
  const [tone, setTone] = useState('PROFESSIONAL');
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [isSavingLetter, setIsSavingLetter] = useState(false);
  const [duplicateDetected, setDuplicateDetected] = useState(false);
  const loadRequestRef = useRef(0);

  const loadDetail = useCallback(async () => {
    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;
    setIsLoading(true);
    setPageError('');
    setMatchingError('');
    setDuplicateDetected(false);

    try {
      const [offerResult, matchingResult, applicationsResult] = await Promise.allSettled([
        getOfferById(offerId),
        getOfferMatching(offerId),
        getStudentApplications(),
      ]);

      if (requestId !== loadRequestRef.current) return;

      if (offerResult.status === 'fulfilled') {
        setOffer(normalizeOffer(offerResult.value));
      } else {
        const readable = getReadableError(offerResult.reason);
        if (readable === 'FORBIDDEN') setShouldRedirectDenied(true);
        else setPageError(readable);
      }

      if (matchingResult.status === 'fulfilled') {
        setMatching(normalizeMatching(matchingResult.value));
      } else {
        setMatching(null);
        setMatchingError(getMatchingError(matchingResult.reason));
      }

      if (applicationsResult.status === 'fulfilled') {
        setApplications(normalizeApplications(applicationsResult.value));
      }
    } finally {
      if (requestId === loadRequestRef.current) setIsLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    loadDetail();
    return () => {
      loadRequestRef.current += 1;
    };
  }, [loadDetail]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timeout = window.setTimeout(() => setSuccessMessage(''), 4000);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  useEffect(() => {
    if (!letterMessage) return undefined;
    const timeout = window.setTimeout(() => setLetterMessage(''), 4000);
    return () => window.clearTimeout(timeout);
  }, [letterMessage]);

  const application = useMemo(() => getApplicationForOffer(applications, offer?.id), [applications, offer?.id]);
  const hasApplied = Boolean(application || duplicateDetected);

  const handleApply = async (payload) => {
    setIsApplying(true);
    setApplyError('');

    try {
      const createdApplication = await applyToOffer(offer.id, payload);
      setApplications((current) => [normalizeApplication({ ...createdApplication, offer }), ...current]);
      setIsApplyDialogOpen(false);
      setSuccessMessage('Votre candidature a ete envoyee.');
    } catch (error) {
      if (error.response?.status === 409) {
        try {
          setApplications(normalizeApplications(await getStudentApplications()));
        } catch {
          setDuplicateDetected(true);
        }
        setIsApplyDialogOpen(false);
        setSuccessMessage('Vous avez deja postule a cette offre.');
      } else if (error.response?.status === 403) {
        setShouldRedirectDenied(true);
      } else if (!error.response) {
        setApplyError('Impossible d’envoyer la candidature. Verifiez que le backend est demarre.');
      } else {
        setApplyError(error.response.data?.message || 'Impossible d’envoyer la candidature.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const openLetter = async () => {
    if (!application?.id) return;

    setLetterApplication(application);
    setLetter(null);
    setLetterError('');
    setLetterMessage('');
    setLetterStatus('loading');

    try {
      const nextLetter = await getMotivationLetter(application.id);
      setLetter(nextLetter);
      setTone(nextLetter.tone || 'PROFESSIONAL');
      setLetterStatus('ready');
    } catch (error) {
      const readable = getLetterErrorMessage(error);
      if (readable === 'NO_LETTER') {
        setLetterStatus('empty');
      } else {
        setLetterStatus('error');
        setLetterError(readable);
      }
    }
  };

  const generateLetter = async () => {
    if (!letterApplication?.id) return;

    setIsGeneratingLetter(true);
    setLetterError('');
    setLetterMessage('');

    try {
      const generated = await generateMotivationLetter(letterApplication.id, { tone });
      setLetter(generated);
      setLetterStatus('ready');
      setLetterMessage('Lettre generee avec succes.');
    } catch (error) {
      setLetterStatus(letter ? 'ready' : 'error');
      setLetterError(getLetterErrorMessage(error));
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const saveLetter = async (content) => {
    if (!letterApplication?.id) return;

    setIsSavingLetter(true);
    setLetterError('');
    setLetterMessage('');

    try {
      const updated = await updateMotivationLetter(letterApplication.id, { content });
      setLetter(updated);
      setLetterStatus('ready');
      setLetterMessage('Lettre mise a jour avec succes.');
    } catch (error) {
      setLetterError(getLetterErrorMessage(error));
    } finally {
      setIsSavingLetter(false);
    }
  };

  const closeLetter = () => {
    setLetterApplication(null);
    setLetter(null);
    setLetterStatus('idle');
    setLetterError('');
    setLetterMessage('');
  };

  if (shouldRedirectDenied) {
    return <Navigate to="/access-denied" replace />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (pageError || !offer) {
    return <ErrorState title="Offre indisponible" message={pageError || 'Impossible de charger cette offre.'} onRetry={loadDetail} />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {successMessage ? (
        <div className="rounded-stitch border border-green-100 bg-green-50 p-4 text-sm font-bold text-success" aria-live="polite">
          {successMessage} <Link className="underline" to="/student/applications">Voir mes candidatures</Link>
        </div>
      ) : null}

      <OfferDetailHeader offer={offer} hasApplied={hasApplied} onApply={() => setIsApplyDialogOpen(true)} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <OfferDescription description={offer.description} />
          <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Competences</p>
            <h2 className="mt-2 text-xl font-black text-ink">Ce que l’offre demande</h2>
            <div className="mt-5">
              <OfferSkills requiredSkills={offer.requiredSkills} optionalSkills={offer.optionalSkills} />
            </div>
          </section>
        </div>
        <div className="space-y-5">
          <AiErrorBoundary title="Compatibilite IA indisponible" resetKey={matching?.score ?? matchingError}>
            <MatchingExplanation matching={matching} matchingError={matchingError} />
          </AiErrorBoundary>
          <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Actions</p>
            <h2 className="mt-2 text-xl font-black text-ink">Suite possible</h2>
            <div className="mt-5 grid gap-3">
              <button className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel disabled:bg-muted" type="button" disabled={hasApplied} onClick={() => setIsApplyDialogOpen(true)}>
                {hasApplied ? 'Candidature envoyee' : 'Postuler'}
              </button>
              <Link className="rounded-lg border border-line bg-white px-5 py-3 text-center text-sm font-black text-ink shadow-panel" to={`/student/career-assistant?offerId=${offer.id}`}>
                Demander conseil a l’assistant carriere
              </Link>
              <button
                className="rounded-lg border border-primary/20 bg-primarySoft px-5 py-3 text-sm font-black text-primary shadow-panel transition hover:border-primary disabled:cursor-not-allowed disabled:border-line disabled:bg-canvas disabled:text-muted disabled:shadow-none"
                type="button"
                disabled={!application?.id}
                onClick={openLetter}
              >
                {application?.id ? 'Lettre de motivation' : 'Postulez pour generer une lettre'}
              </button>
              <Link className="rounded-lg border border-line bg-white px-5 py-3 text-center text-sm font-black text-ink shadow-panel" to="/student/offers">
                Retour aux offres
              </Link>
            </div>
          </section>
        </div>
      </div>

      {matching ? (
        <AiErrorBoundary title="Details du matching indisponibles" resetKey={matching?.score}>
          <details className="group rounded-stitch border border-line bg-white shadow-panel">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-black text-ink focus-visible:ring-4 focus-visible:ring-primary/15 sm:px-7">
            <span>Voir les details et les preuves du matching IA</span>
            <span className="text-xl text-ai transition group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <div className="space-y-5 border-t border-line bg-canvas/50 p-4 sm:p-6">
            <div className="grid gap-5 xl:grid-cols-2">
              <ScoreBreakdownCard breakdown={matching.v3?.scoreBreakdown} />
              <MissingSkillsPanel matching={matching} />
            </div>
            <CareerSignalMap signalMap={matching.explainability?.careerSignalMap} />
            <SkillEvidenceMap evidenceMap={matching.explainability?.skillEvidenceMap} requiredSkills={offer.requiredSkills} />
            <DecisionTraceTimeline trace={matching.explainability?.decisionTrace} />
            <SkillGapSimulatorPanel matching={matching} />
          </div>
          </details>
        </AiErrorBoundary>
      ) : null}

      <ApplyDialog
        offer={isApplyDialogOpen ? offer : null}
        isSubmitting={isApplying}
        error={applyError}
        onCancel={() => {
          setIsApplyDialogOpen(false);
          setApplyError('');
        }}
        onConfirm={handleApply}
      />

      <MotivationLetterDialog
        application={letterApplication}
        letter={letter}
        status={letterStatus}
        error={letterError}
        message={letterMessage}
        tone={tone}
        isGenerating={isGeneratingLetter}
        isSaving={isSavingLetter}
        onClose={closeLetter}
        onRetry={openLetter}
        onToneChange={setTone}
        onGenerate={generateLetter}
        onSave={saveLetter}
      />
    </div>
  );
}

export default StudentOfferDetailPage;
