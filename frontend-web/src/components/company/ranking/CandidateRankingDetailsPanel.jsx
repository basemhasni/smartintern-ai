import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { formatRankDate } from '../../../utils/candidateRanking.js';
import CompanyStatusCard from '../CompanyStatusCard.jsx';
import CandidateMatchingBreakdown from './CandidateMatchingBreakdown.jsx';
import CandidateRankBadge from './CandidateRankBadge.jsx';
import AiScoreCard from '../../ai/AiScoreCard.jsx';
import CareerSignalMap from '../../ai/CareerSignalMap.jsx';
import DecisionTraceTimeline from '../../ai/DecisionTraceTimeline.jsx';
import MissingSkillsPanel from '../../ai/MissingSkillsPanel.jsx';
import ScoreBreakdownCard from '../../ai/ScoreBreakdownCard.jsx';
import SkillEvidenceMap from '../../ai/SkillEvidenceMap.jsx';

function CandidateRankingDetailsPanel({ candidate, onClose, onUpdateStatus }) {
  useEffect(() => {
    if (!candidate) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [candidate, onClose]);

  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 lg:grid lg:place-items-end" role="dialog" aria-modal="true" aria-labelledby="ranking-details-title">
      <button className="absolute inset-0" type="button" aria-label="Fermer le panneau candidat" onClick={onClose} />
      <section className="relative ml-auto h-full w-full max-w-3xl overflow-y-auto bg-canvas p-5 shadow-stitch">
        <div className="rounded-stitch border border-line bg-white p-6 shadow-panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Analyse candidat</p>
              <h2 id="ranking-details-title" className="mt-2 text-xl font-black text-ink">Detail du classement</h2>
            </div>
            <button className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-black text-ink" type="button" onClick={onClose}>Fermer</button>
          </div>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <CandidateRankBadge rank={candidate.originalRank} />
              <div>
                <h3 className="text-2xl font-black text-ink">{candidate.student.firstName || 'Candidat'} {candidate.student.lastName}</h3>
                <p className="mt-1 text-sm font-bold text-muted">{candidate.student.targetJob || 'Objectif non renseigne'}</p>
                <p className="mt-1 text-xs font-bold text-muted">Candidature recue le {formatRankDate(candidate.appliedAt)}</p>
              </div>
            </div>
            <CompanyStatusCard status={candidate.applicationStatus} label={candidate.applicationStatusLabel} />
          </div>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Email</dt><dd className="mt-1 break-all text-ink">{candidate.student.email || 'Non renseigne'}</dd></div>
            <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Telephone</dt><dd className="mt-1 text-ink">{candidate.student.phone || 'Non renseigne'}</dd></div>
            <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Localisation</dt><dd className="mt-1 text-ink">{candidate.student.location || 'Non renseignee'}</dd></div>
            <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Niveau</dt><dd className="mt-1 text-ink">{candidate.student.educationLevel || 'Non renseigne'}</dd></div>
          </dl>
          {candidate.student.bio ? <p className="mt-4 text-sm leading-7 text-muted">{candidate.student.bio}</p> : null}
        </div>

        <div className="mt-5 rounded-stitch border border-line bg-white p-6 shadow-panel">
          <CandidateMatchingBreakdown candidate={candidate} />
        </div>

        {candidate.hasScore ? (
          <details className="group mt-5 rounded-stitch border border-line bg-white shadow-panel">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-black text-ink">
              <span>Voir l analyse IA detaillee</span><span className="text-xl text-ai transition group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <div className="space-y-5 border-t border-line bg-canvas/50 p-5">
              <AiScoreCard matching={candidate.matching} />
              <ScoreBreakdownCard breakdown={candidate.matching.v3?.scoreBreakdown} />
              <MissingSkillsPanel matching={candidate.matching} />
              <CareerSignalMap signalMap={candidate.matching.explainability?.careerSignalMap} />
              <SkillEvidenceMap evidenceMap={candidate.matching.explainability?.skillEvidenceMap} />
              <DecisionTraceTimeline trace={candidate.matching.explainability?.decisionTrace} />
            </div>
          </details>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2 rounded-stitch border border-line bg-white p-5 shadow-panel">
          <button className="rounded-lg bg-primary px-4 py-3 text-sm font-black text-white" type="button" onClick={() => onUpdateStatus(candidate)}>Modifier le statut</button>
          <Link className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" to={`/company/applications?offerId=${candidate.offer.id}`}>Voir dans les candidatures</Link>
          <Link className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" to={`/company/offers/${candidate.offer.id}`}>Voir l offre</Link>
        </div>
      </section>
    </div>
  );
}

export default CandidateRankingDetailsPanel;
