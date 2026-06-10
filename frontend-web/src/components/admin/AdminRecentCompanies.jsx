import { Link } from 'react-router-dom';

import { formatAdminDate } from '../../utils/admin.js';
import AdminStatusBadge from './AdminStatusBadge.jsx';

const getTone = (status) => {
  if (status === 'VALIDATED') return 'active';
  if (status === 'PENDING') return 'pending';
  if (status === 'REJECTED') return 'danger';
  if (status === 'SUSPENDED') return 'inactive';
  return 'default';
};

function AdminRecentCompanies({ companies }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Elements recemment crees</p>
          <h2 className="mt-2 text-lg font-black text-ink">Entreprises recentes</h2>
        </div>
        <Link className="text-sm font-black text-primary" to="/admin/companies">Voir tout</Link>
      </div>
      <div className="mt-4 space-y-3">
        {companies.length ? companies.map((company) => (
          <article key={company.id} className="rounded-lg bg-canvas p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-ink">{company.companyName}</p>
                <p className="mt-1 text-xs font-bold text-muted">{company.user.email || 'Email non renseigne'}</p>
              </div>
              <AdminStatusBadge tone={getTone(company.status)}>{company.statusLabel}</AdminStatusBadge>
            </div>
            <p className="mt-2 text-xs font-bold text-muted">{formatAdminDate(company.createdAt)}</p>
          </article>
        )) : <p className="text-sm font-bold text-muted">Aucune entreprise recente.</p>}
      </div>
    </section>
  );
}

export default AdminRecentCompanies;
