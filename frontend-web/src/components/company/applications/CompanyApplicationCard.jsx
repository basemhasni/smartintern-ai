import { Link } from 'react-router-dom';

import { formatDate } from '../../../utils/formatters.js';
import ScoreBadge from '../../common/ScoreBadge.jsx';
import CompanyStatusCard from '../CompanyStatusCard.jsx';
import CandidateSkillsPreview from './CandidateSkillsPreview.jsx';
import CandidateSummary from './CandidateSummary.jsx';

function CompanyApplicationCard({ application, onOpenDetails, onUpdateStatus }) {
  return (
    <article className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <CandidateSummary student={application.student} />
        <div className="flex items-center gap-3">
          {application.matching.score !== null ? <ScoreBadge score={application.matching.score} /> : <span className="text-sm font-bold text-muted">Score non calcule</span>}
          <CompanyStatusCard status={application.status} label={application.statusLabel} />
        </div>
      </div>
      <div className="mt-4">
        <CandidateSkillsPreview matching={application.matching} />
      </div>
      {application.message ? (
        <details className="mt-4 rounded-lg bg-canvas p-3">
          <summary className="cursor-pointer text-sm font-black text-ink">Message de candidature</summary>
          <p className="mt-2 text-sm leading-6 text-muted">{application.message}</p>
        </details>
      ) : null}
      <p className="mt-4 text-xs font-bold text-muted">Candidate le {formatDate(application.appliedAt)}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button className="rounded-lg bg-primary px-3 py-2 text-xs font-black text-white shadow-panel" type="button" onClick={() => onOpenDetails(application)}>Voir le profil resume</button>
        <button className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-black text-ink shadow-panel" type="button" onClick={() => onUpdateStatus(application)}>Modifier le statut</button>
        <Link className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-black text-ink shadow-panel" to={`/company/offers/${application.offer.id}`}>Voir l offre</Link>
        <Link className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-black text-ink shadow-panel" to={`/company/candidate-ranking?offerId=${application.offer.id}`}>Classement IA</Link>
      </div>
    </article>
  );
}

export default CompanyApplicationCard;
