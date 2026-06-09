import { Link } from 'react-router-dom';

import { formatOfferDate } from '../../../utils/companyOffers.js';
import SkillBadge from '../../common/SkillBadge.jsx';
import CompanyStatusCard from '../CompanyStatusCard.jsx';

function OfferDetailSummary({ offer, onArchive }) {
  const isDraft = offer.status === 'DRAFT';
  const isPublished = offer.status === 'PUBLISHED';

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Detail de l offre</p>
          <h1 className="mt-2 text-2xl font-black text-ink md:text-3xl">{offer.title}</h1>
          <p className="mt-2 text-sm font-bold text-muted">{offer.location || 'Lieu non renseigne'} / {offer.duration || 'Duree non renseignee'}</p>
        </div>
        <CompanyStatusCard status={offer.status} label={offer.statusLabel} />
      </div>

      <p className="mt-5 whitespace-pre-line text-sm leading-7 text-muted">{offer.description}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-stitch bg-canvas p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">Competences requises</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {offer.requiredSkills.length ? offer.requiredSkills.map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>) : <span className="text-sm font-bold text-muted">Non renseignees</span>}
          </div>
        </div>
        <div className="rounded-stitch bg-canvas p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">Competences appreciees</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {offer.optionalSkills.length ? offer.optionalSkills.map((skill) => <SkillBadge key={skill} tone="ai">{skill}</SkillBadge>) : <span className="text-sm font-bold text-muted">Non renseignees</span>}
          </div>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 text-sm md:grid-cols-4">
        <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Debut</dt><dd className="mt-1 text-ink">{formatOfferDate(offer.startDate)}</dd></div>
        <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Creee</dt><dd className="mt-1 text-ink">{formatOfferDate(offer.createdAt)}</dd></div>
        <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Mise a jour</dt><dd className="mt-1 text-ink">{formatOfferDate(offer.updatedAt)}</dd></div>
        <div className="rounded-lg bg-canvas p-3"><dt className="font-black text-muted">Candidatures</dt><dd className="mt-1 text-ink">{offer.applicationsCount ?? 'Non disponible'}</dd></div>
      </dl>

      {isDraft ? <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">Cette offre n est pas visible par les etudiants tant qu elle n est pas publiee.</p> : null}
      {isPublished ? <p className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-bold text-success">Cette offre est visible par les etudiants.</p> : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <Link className="rounded-lg bg-primary px-4 py-3 text-sm font-black text-white shadow-panel" to={`/company/offers/${offer.id}/edit`}>Modifier</Link>
        <Link className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" to={`/company/applications?offerId=${offer.id}`}>Voir les candidatures</Link>
        <Link className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" to={`/company/candidate-ranking?offerId=${offer.id}`}>Voir le classement IA</Link>
        {offer.status !== 'ARCHIVED' ? <button className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-black text-danger" type="button" onClick={onArchive}>Archiver</button> : null}
        <Link className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" to="/company/offers">Retour aux offres</Link>
      </div>
    </section>
  );
}

export default OfferDetailSummary;
