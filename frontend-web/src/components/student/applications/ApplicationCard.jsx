import { Bot, FileText, MessageSquareText } from 'lucide-react';
import { Link } from 'react-router-dom';

import ScoreBadge from '../../common/ScoreBadge.jsx';
import StatusBadge from '../../common/StatusBadge.jsx';
import { formatDate } from '../../../utils/formatters.js';

function ApplicationCard({ application, isSelected, onSelect, onOpenLetter }) {
  return (
    <article className={`rounded-stitch border bg-white p-5 shadow-panel transition hover:-translate-y-0.5 ${isSelected ? 'border-primary' : 'border-line'}`}>
      <button className="w-full text-left" type="button" onClick={() => onSelect(application)}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={application.status} />
              <span className="text-xs font-bold text-muted">Postulee le {formatDate(application.appliedAt)}</span>
            </div>
            <h3 className="mt-3 text-xl font-black text-ink">{application.offer.title}</h3>
            <p className="mt-2 text-sm font-bold text-muted">
              {application.offer.company.companyName}
              {application.offer.company.sector ? ` / ${application.offer.company.sector}` : ''}
            </p>
            <p className="mt-2 text-sm text-muted">{application.offer.location || 'Lieu non renseigne'} / {application.offer.duration || 'Duree non renseignee'}</p>
          </div>
          {application.compatibilityScore !== null ? (
            <ScoreBadge score={application.compatibilityScore} />
          ) : (
            <div className="rounded-stitch border border-line bg-canvas px-4 py-3 text-sm font-bold text-muted">Score non disponible</div>
          )}
        </div>
        {application.message ? (
          <p className="mt-4 line-clamp-2 rounded-lg bg-canvas px-4 py-3 text-sm leading-6 text-muted">
            {application.message}
          </p>
        ) : null}
      </button>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link className="inline-flex justify-center rounded-lg border border-line bg-white px-4 py-2 text-sm font-black text-ink shadow-panel" to={`/student/offers/${application.offer.id}`}>
          Voir l'offre
        </Link>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-black text-white shadow-panel" type="button" onClick={() => onOpenLetter(application)}>
          <FileText className="h-4 w-4" aria-hidden="true" />
          Lettre de motivation
        </button>
        <Link className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-canvas px-4 py-2 text-sm font-black text-ink" to={`/student/career-assistant?offerId=${application.offer.id}`}>
          <Bot className="h-4 w-4" aria-hidden="true" />
          Conseils carriere
        </Link>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-canvas px-4 py-2 text-sm font-black text-ink" type="button" onClick={() => onSelect(application)}>
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
          Details
        </button>
      </div>
    </article>
  );
}

export default ApplicationCard;
