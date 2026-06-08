import { CheckCircle2, Clock3, Send, XCircle } from 'lucide-react';

import { getApplicationStatusLabel } from '../../../utils/formatters.js';
import { applicationStatuses, getApplicationStats } from '../../../utils/applications.js';

const iconByStatus = {
  SENT: Send,
  PENDING: Clock3,
  ACCEPTED: CheckCircle2,
  REJECTED: XCircle,
  CANCELLED: XCircle,
};

const toneByStatus = {
  SENT: 'bg-primarySoft text-primary',
  PENDING: 'bg-amber-50 text-amber-700',
  ACCEPTED: 'bg-green-50 text-success',
  REJECTED: 'bg-red-50 text-danger',
  CANCELLED: 'bg-slate-100 text-muted',
};

function ApplicationsStats({ applications }) {
  const stats = getApplicationStats(applications);

  return (
    <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
      <article className="rounded-stitch border border-line bg-white p-5 shadow-panel md:col-span-3 xl:col-span-1">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Total</p>
        <p className="mt-3 text-3xl font-black text-ink">{stats.total}</p>
        <p className="mt-1 text-sm text-muted">Candidature(s)</p>
      </article>
      {applicationStatuses.map((status) => {
        const Icon = iconByStatus[status];

        return (
          <article key={status} className="rounded-stitch border border-line bg-white p-5 shadow-panel">
            <span className={`grid h-9 w-9 place-items-center rounded-full ${toneByStatus[status]}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="mt-3 text-2xl font-black text-ink">{stats.counts[status]}</p>
            <p className="mt-1 text-sm font-bold text-muted">{getApplicationStatusLabel(status)}</p>
          </article>
        );
      })}
    </section>
  );
}

export default ApplicationsStats;
