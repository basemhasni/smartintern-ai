import { Link } from 'react-router-dom';

import ScoreBadge from '../../common/ScoreBadge.jsx';
import CompanyStatusCard from '../CompanyStatusCard.jsx';
import ApplicationStatusTimeline from './ApplicationStatusTimeline.jsx';
import CandidateSkillsPreview from './CandidateSkillsPreview.jsx';
import CandidateSummary from './CandidateSummary.jsx';

function CompanyApplicationDetailsPanel({ application, onClose, onUpdateStatus }) {
  if (!application) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 lg:grid lg:place-items-end" role="dialog" aria-modal="true" aria-labelledby="candidate-details-title">
      <button className="absolute inset-0" type="button" aria-label="Fermer le detail candidat" onClick={onClose} />
      <section className="relative ml-auto h-full w-full max-w-2xl overflow-y-auto bg-canvas p-5 shadow-stitch">
        <div className="rounded-stitch border border-line bg-white p-6 shadow-panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Profil candidat</p>
              <h2 id="candidate-details-title" className="mt-2 text-xl font-black text-ink">Detail de la candidature</h2>
            </div>
            <button className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-black text-ink" type="button" onClick={onClose}>Fermer</button>
          </div>
          <div className="mt-5">
            <CandidateSummary student={application.student} />
          </div>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Email</dt><dd className="mt-1 break-all text-ink">{application.student.email || 'Non renseigne'}</dd></div>
            <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Telephone</dt><dd className="mt-1 text-ink">{application.student.phone || 'Non renseigne'}</dd></div>
            <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Niveau</dt><dd className="mt-1 text-ink">{application.student.educationLevel || 'Non renseigne'}</dd></div>
            <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Objectif</dt><dd className="mt-1 text-ink">{application.student.targetJob || 'Non renseigne'}</dd></div>
          </dl>
          {application.student.bio ? <p className="mt-4 text-sm leading-7 text-muted">{application.student.bio}</p> : null}
        </div>

        <div className="mt-5 rounded-stitch border border-line bg-white p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CompanyStatusCard status={application.status} label={application.statusLabel} />
            {application.matching.score !== null ? <ScoreBadge score={application.matching.score} label="score" /> : <span className="text-sm font-bold text-muted">Score non calcule</span>}
          </div>
          <div className="mt-5">
            <CandidateSkillsPreview matching={application.matching} />
          </div>
          {application.matching.explanation ? <p className="mt-4 text-sm leading-7 text-muted">{application.matching.explanation}</p> : null}
          {application.message ? (
            <div className="mt-5 rounded-lg bg-canvas p-4">
              <p className="text-sm font-black text-ink">Message de candidature</p>
              <p className="mt-2 text-sm leading-6 text-muted">{application.message}</p>
            </div>
          ) : null}
          <p className="mt-5 text-xs font-bold leading-5 text-muted">Le score IA est une aide a la lecture des competences et ne remplace pas l evaluation du recruteur.</p>
        </div>

        <div className="mt-5">
          <ApplicationStatusTimeline application={application} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2 rounded-stitch border border-line bg-white p-5 shadow-panel">
          <button className="rounded-lg bg-primary px-4 py-3 text-sm font-black text-white" type="button" onClick={() => onUpdateStatus(application)}>Modifier le statut</button>
          <Link className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" to={`/company/offers/${application.offer.id}`}>Voir l offre</Link>
          <Link className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" to={`/company/candidate-ranking?offerId=${application.offer.id}`}>Classement IA</Link>
        </div>
      </section>
    </div>
  );
}

export default CompanyApplicationDetailsPanel;
