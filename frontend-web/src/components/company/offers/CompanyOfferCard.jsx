import { Link } from 'react-router-dom';

import { formatOfferDate } from '../../../utils/companyOffers.js';
import SkillBadge from '../../common/SkillBadge.jsx';
import CompanyStatusCard from '../CompanyStatusCard.jsx';

function CompanyOfferCard({ offer, onArchive }) {
  const canArchive = offer.status !== 'ARCHIVED';

  return (
    <article className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-ink">{offer.title}</h2>
          <p className="mt-2 text-sm font-bold text-muted">{offer.location || 'Lieu non renseigne'} / {offer.duration || 'Duree non renseignee'}</p>
          <p className="mt-1 text-xs font-bold text-muted">Debut : {formatOfferDate(offer.startDate)}</p>
        </div>
        <CompanyStatusCard status={offer.status} label={offer.statusLabel} />
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">{offer.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {offer.requiredSkills.slice(0, 5).map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}
        {offer.optionalSkills.slice(0, 2).map((skill) => <SkillBadge key={skill} tone="ai">{skill}</SkillBadge>)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-muted">
        <span>Mise a jour : {formatOfferDate(offer.updatedAt || offer.createdAt)}</span>
        {offer.applicationsCount !== null ? <span>{offer.applicationsCount} candidature(s)</span> : null}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link className="rounded-lg bg-primary px-3 py-2 text-xs font-black text-white shadow-panel" to={`/company/offers/${offer.id}`}>Voir</Link>
        <Link className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-black text-ink shadow-panel" to={`/company/offers/${offer.id}/edit`}>Modifier</Link>
        <Link className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-black text-ink shadow-panel" to={`/company/applications?offerId=${offer.id}`}>Candidatures</Link>
        <Link className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-black text-ink shadow-panel" to={`/company/candidate-ranking?offerId=${offer.id}`}>Classement IA</Link>
        {canArchive ? (
          <button className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-danger" type="button" onClick={() => onArchive(offer)}>
            Archiver
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default CompanyOfferCard;
