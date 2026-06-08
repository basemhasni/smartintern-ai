import { CalendarDays, CheckCircle2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import SkillBadge from '../../common/SkillBadge.jsx';
import { formatDate } from '../../../utils/formatters.js';
import OfferMatchScore from './OfferMatchScore.jsx';
import OfferSkills from './OfferSkills.jsx';

function OfferCard({ offer }) {
  return (
    <article className="rounded-stitch border border-line bg-white p-5 shadow-panel transition hover:-translate-y-0.5 hover:shadow-stitch">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            {offer.isRecommended ? <SkillBadge tone="ai">Recommandee</SkillBadge> : null}
            {offer.matching?.score >= 80 ? <SkillBadge tone="success">Meilleure correspondance</SkillBadge> : null}
            {offer.hasApplied ? <SkillBadge tone="primary">Candidature envoyee</SkillBadge> : null}
          </div>
          <h3 className="mt-3 text-xl font-black text-ink">{offer.title}</h3>
          <p className="mt-2 text-sm font-bold text-muted">
            {offer.company?.companyName || 'Entreprise non renseignee'}
            {offer.company?.sector ? ` / ${offer.company.sector}` : ''}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" aria-hidden="true" />{offer.location || 'Lieu non renseigne'}</span>
            <span>{offer.duration || 'Duree non renseignee'}</span>
            {offer.startDate ? <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />{formatDate(offer.startDate)}</span> : null}
          </div>
        </div>
        <OfferMatchScore matching={offer.matching} compact />
      </div>

      <div className="mt-5">
        <OfferSkills
          requiredSkills={offer.requiredSkills.slice(0, 5)}
          optionalSkills={offer.optionalSkills.slice(0, 4)}
          matchedSkills={offer.matching?.matchedSkills?.slice(0, 4)}
          missingSkills={offer.matching?.missingSkills?.slice(0, 2)}
          compact
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {offer.hasApplied ? (
          <p className="inline-flex items-center gap-2 text-sm font-black text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Vous avez deja postule
          </p>
        ) : <p className="text-sm text-muted">Consultez le detail avant de postuler.</p>}
        <Link className="inline-flex justify-center rounded-lg bg-primary px-4 py-2 text-sm font-black text-white shadow-panel transition hover:-translate-y-0.5" to={`/student/offers/${offer.id}`}>
          Voir l'offre
        </Link>
      </div>
    </article>
  );
}

export default OfferCard;
