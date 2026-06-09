import { Link } from 'react-router-dom';

import { applicationStatusLabels } from '../../utils/companyDashboard.js';
import { formatDate } from '../../utils/formatters.js';
import CompanyStatusCard from './CompanyStatusCard.jsx';

function CompanyApplicationsOverview({ applications, counts, isPartial }) {
  const recentApplications = applications.slice(0, 4);
  const statuses = ['SENT', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Candidatures</p>
          <h2 className="mt-2 text-xl font-black text-ink">Suivi des candidatures</h2>
          {isPartial ? <p className="mt-2 text-xs font-bold text-muted">Apercu base sur un maximum de 5 offres publiees.</p> : null}
        </div>
        <Link className="text-sm font-black text-primary hover:underline" to="/company/applications">
          Voir toutes les candidatures
        </Link>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-5">
        {statuses.map((status) => (
          <div key={status} className="rounded-lg bg-canvas p-3">
            <p className="text-xs font-black text-muted">{applicationStatusLabels[status]}</p>
            <p className="mt-2 text-xl font-black text-ink">{counts[status] || 0}</p>
          </div>
        ))}
      </div>

      {recentApplications.length ? (
        <div className="mt-5 space-y-3">
          {recentApplications.map((application) => (
            <article key={application.id} className="rounded-lg border border-line bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-black text-ink">{application.student.firstName} {application.student.lastName}</p>
                  <p className="mt-1 text-sm font-bold text-muted">{application.offerTitle}</p>
                  <p className="mt-1 text-xs font-bold text-muted">{formatDate(application.appliedAt)}</p>
                </div>
                <CompanyStatusCard status={application.status} label={application.statusLabel} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-lg bg-canvas px-4 py-3 text-sm font-bold text-muted">Les candidatures apparaitront ici apres reception des premiers profils.</p>
      )}
    </section>
  );
}

export default CompanyApplicationsOverview;
