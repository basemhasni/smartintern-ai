import { CheckCircle2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import SkillBadge from '../../common/SkillBadge.jsx';
import { formatDate } from '../../../utils/formatters.js';

function OfferDetailHeader({ offer, hasApplied, onApply }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <Link className="text-sm font-black text-primary hover:underline" to="/student/offers">Retour aux offres</Link>
      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <SkillBadge tone="primary">PUBLISHED</SkillBadge>
            {hasApplied ? <SkillBadge tone="success">Candidature envoyee</SkillBadge> : null}
          </div>
          <h1 className="mt-3 max-w-4xl text-2xl font-black leading-tight text-ink md:text-3xl">{offer.title}</h1>
          <p className="mt-3 text-sm font-bold text-muted">
            {offer.company?.companyName || 'Entreprise non renseignee'}
            {offer.company?.sector ? ` / ${offer.company.sector}` : ''}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" aria-hidden="true" />{offer.location || 'Lieu non renseigne'}</span>
            <span>{offer.duration || 'Duree non renseignee'}</span>
            {offer.startDate ? <span>Debut : {formatDate(offer.startDate)}</span> : null}
          </div>
        </div>
        <button
          className="inline-flex justify-center rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-muted"
          type="button"
          disabled={hasApplied}
          onClick={onApply}
        >
          {hasApplied ? (
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Candidature envoyee</span>
          ) : 'Postuler'}
        </button>
      </div>
    </section>
  );
}

export default OfferDetailHeader;
