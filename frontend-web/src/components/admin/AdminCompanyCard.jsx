import { ExternalLink } from 'lucide-react';

import { formatAdminDate } from '../../utils/admin.js';
import AdminStatusBadge from './AdminStatusBadge.jsx';

const getTone = (status) => {
  if (status === 'VALIDATED') return 'active';
  if (status === 'PENDING') return 'pending';
  if (status === 'REJECTED') return 'danger';
  if (status === 'SUSPENDED') return 'inactive';
  return 'default';
};

function AdminCompanyCard({ company, onChangeStatus }) {
  return (
    <article className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h3 className="text-lg font-black text-ink">{company.companyName}</h3>
          <p className="mt-1 text-sm font-bold text-muted">{company.sector || 'Secteur non renseigne'}</p>
          <p className="mt-2 text-xs font-bold text-muted">Creee le {formatAdminDate(company.createdAt)}</p>
        </div>
        <AdminStatusBadge tone={getTone(company.status)}>{company.statusLabel}</AdminStatusBadge>
      </div>
      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Recruteur</dt><dd className="mt-1 text-ink">{company.user.firstName} {company.user.lastName}</dd></div>
        <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Email</dt><dd className="mt-1 break-all text-ink">{company.user.email || 'Non renseigne'}</dd></div>
        <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Adresse</dt><dd className="mt-1 text-ink">{company.address || 'Non renseignee'}</dd></div>
        <div className="rounded-lg bg-canvas p-3">
          <dt className="font-black text-muted">Site</dt>
          <dd className="mt-1 text-ink">
            {company.website ? (
              <a className="inline-flex items-center gap-1 break-all font-bold text-primary" href={company.website} target="_blank" rel="noopener noreferrer">
                Ouvrir le site
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            ) : 'Non renseigne'}
          </dd>
        </div>
      </dl>
      {company.description ? <p className="mt-4 text-sm leading-7 text-muted">{company.description}</p> : null}
      <div className="mt-5 flex flex-wrap gap-2">
        {['VALIDATED', 'REJECTED', 'SUSPENDED', 'PENDING'].filter((status) => status !== company.status).map((status) => (
          <button
            key={status}
            className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel"
            type="button"
            onClick={() => onChangeStatus(company, status)}
          >
            {status === 'VALIDATED' ? 'Valider' : status === 'REJECTED' ? 'Refuser' : status === 'SUSPENDED' ? 'Suspendre' : 'Remettre en attente'}
          </button>
        ))}
      </div>
    </article>
  );
}

export default AdminCompanyCard;
