import { Bot, ExternalLink, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

import ScoreBadge from '../../common/ScoreBadge.jsx';
import StatusBadge from '../../common/StatusBadge.jsx';
import { formatDate } from '../../../utils/formatters.js';
import ApplicationTimeline from './ApplicationTimeline.jsx';

function ApplicationDetailsPanel({ application, onOpenLetter }) {
  if (!application) {
    return (
      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <p className="text-sm leading-6 text-muted">Selectionnez une candidature pour afficher le detail.</p>
      </section>
    );
  }

  return (
    <aside className="space-y-5">
      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Detail</p>
        <h2 className="mt-2 text-xl font-black text-ink">{application.offer.title}</h2>
        <p className="mt-2 text-sm font-bold text-muted">{application.offer.company.companyName}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge status={application.status} />
          <span className="rounded-full bg-canvas px-3 py-1 text-xs font-bold text-muted">{formatDate(application.appliedAt)}</span>
        </div>
        <div className="mt-5">
          {application.compatibilityScore !== null ? <ScoreBadge score={application.compatibilityScore} /> : <p className="text-sm font-bold text-muted">Score non disponible</p>}
        </div>
      </section>

      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Timeline</p>
        <h2 className="mt-2 text-xl font-black text-ink">Statut actuel</h2>
        <div className="mt-5">
          <ApplicationTimeline application={application} />
        </div>
      </section>

      {application.message ? (
        <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Message envoye</p>
          <p className="mt-3 text-sm leading-7 text-muted">{application.message}</p>
        </section>
      ) : null}

      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Actions</p>
        <div className="mt-4 grid gap-3">
          <Link className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" to={`/student/offers/${application.offer.id}`}>
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Voir le detail de l'offre
          </Link>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-white shadow-panel" type="button" onClick={() => onOpenLetter(application)}>
            <FileText className="h-4 w-4" aria-hidden="true" />
            Lettre de motivation
          </button>
          <Link className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-canvas px-4 py-3 text-sm font-black text-ink" to={`/student/career-assistant?offerId=${application.offer.id}`}>
            <Bot className="h-4 w-4" aria-hidden="true" />
            Conseils carriere
          </Link>
        </div>
      </section>
    </aside>
  );
}

export default ApplicationDetailsPanel;
