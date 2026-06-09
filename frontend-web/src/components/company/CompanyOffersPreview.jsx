import { Link } from 'react-router-dom';

import { formatNullableDate } from '../../utils/companyDashboard.js';
import SkillBadge from '../common/SkillBadge.jsx';
import CompanyDashboardEmptyState from './CompanyDashboardEmptyState.jsx';
import CompanyStatusCard from './CompanyStatusCard.jsx';

function CompanyOffersPreview({ offers }) {
  const recentOffers = offers.slice(0, 4);

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Offres</p>
          <h2 className="mt-2 text-xl font-black text-ink">Vos offres recentes</h2>
        </div>
        <Link className="text-sm font-black text-primary hover:underline" to="/company/offers">
          Voir toutes mes offres
        </Link>
      </div>

      {recentOffers.length ? (
        <div className="mt-5 space-y-4">
          {recentOffers.map((offer) => (
            <article key={offer.id} className="rounded-stitch border border-line bg-canvas/60 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-black text-ink">{offer.title}</h3>
                  <p className="mt-1 text-sm font-bold text-muted">{offer.location || 'Lieu non renseigne'} / {offer.duration || 'Duree non renseignee'}</p>
                  <p className="mt-1 text-xs font-bold text-muted">Debut : {formatNullableDate(offer.startDate)}</p>
                </div>
                <CompanyStatusCard status={offer.status} label={offer.statusLabel} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {offer.requiredSkills.slice(0, 4).map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-black text-ink shadow-panel" to={`/company/offers`}>
                  Voir
                </Link>
                <Link className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-black text-ink shadow-panel" to="/company/applications">
                  Voir les candidatures
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <CompanyDashboardEmptyState />
        </div>
      )}
    </section>
  );
}

export default CompanyOffersPreview;
