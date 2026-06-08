import { Link } from 'react-router-dom';

import StatusBadge from '../common/StatusBadge.jsx';
import { getApplicationStatusCounts, getApplicationStatusLabel } from '../../utils/formatters.js';

const statuses = ['SENT', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];

function ApplicationStatusSummary({ applications }) {
  const counts = getApplicationStatusCounts(applications);
  const total = applications.length;

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Candidatures</p>
          <h2 className="mt-2 text-xl font-black text-ink">Suivi des statuts</h2>
        </div>
        <span className="rounded-full bg-primarySoft px-3 py-1 text-xs font-black text-primary">{total} total</span>
      </div>

      <div className="mt-5 flex overflow-hidden rounded-full border border-line bg-canvas" aria-label="Distribution des candidatures">
        {statuses.map((status) => {
          const width = total ? `${(counts[status] / total) * 100}%` : '0%';
          const colors = {
            SENT: 'bg-primary',
            PENDING: 'bg-warning',
            ACCEPTED: 'bg-success',
            REJECTED: 'bg-danger',
            CANCELLED: 'bg-muted',
          };

          return (
            <span
              key={status}
              className={`h-3 ${colors[status]}`}
              style={{ width }}
              title={`${getApplicationStatusLabel(status)}: ${counts[status]}`}
            />
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {statuses.map((status) => (
          <div key={status} className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2">
            <StatusBadge status={status} />
            <span className="text-sm font-black text-ink">{counts[status]}</span>
          </div>
        ))}
      </div>

      <Link className="mt-5 inline-flex text-sm font-black text-primary hover:underline" to="/student/applications">
        Voir toutes mes candidatures
      </Link>
    </section>
  );
}

export default ApplicationStatusSummary;
