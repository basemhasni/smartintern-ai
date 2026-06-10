import { formatAdminDate } from '../../utils/admin.js';
import AdminStatusBadge from './AdminStatusBadge.jsx';

function AdminRecentOffers({ offers }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Elements recemment crees</p>
      <h2 className="mt-2 text-lg font-black text-ink">Offres recentes</h2>
      <div className="mt-4 space-y-3">
        {offers.length ? offers.map((offer) => (
          <article key={offer.id} className="rounded-lg bg-canvas p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-ink">{offer.title}</p>
                <p className="mt-1 text-xs font-bold text-muted">{offer.company?.companyName || 'Entreprise non renseignee'}</p>
              </div>
              <AdminStatusBadge tone={offer.status === 'PUBLISHED' ? 'primary' : 'muted'}>{offer.status}</AdminStatusBadge>
            </div>
            <p className="mt-2 text-xs font-bold text-muted">{formatAdminDate(offer.createdAt)}</p>
          </article>
        )) : <p className="text-sm font-bold text-muted">Aucune offre recente.</p>}
      </div>
    </section>
  );
}

export default AdminRecentOffers;
