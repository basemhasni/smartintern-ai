import { BrainCircuit, BriefcaseBusiness, FilterX } from 'lucide-react';
import { Link } from 'react-router-dom';

const variants = {
  noOffers: {
    icon: BriefcaseBusiness,
    title: 'Creez une offre pour acceder au classement IA.',
    message: 'Le classement apparait lorsqu une offre possede des candidatures a comparer.',
    actionLabel: 'Creer une offre',
    to: '/company/offers/new',
  },
  noCandidates: {
    icon: BrainCircuit,
    title: 'Aucun candidat a classer',
    message: 'Le classement apparaitra apres reception des premieres candidatures.',
  },
  filtered: {
    icon: FilterX,
    title: 'Aucun candidat ne correspond aux filtres selectionnes.',
    message: 'Essayez une autre recherche, un seuil de score plus bas ou reinitialisez les filtres.',
  },
};

function CandidateRankingEmptyState({ variant = 'noCandidates', selectedOffer, onResetFilters }) {
  const content = variants[variant] || variants.noCandidates;
  const Icon = content.icon;

  return (
    <section className="rounded-stitch border border-dashed border-line bg-canvas/80 p-8 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-primary shadow-panel">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-xl font-black text-ink">{content.title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted">{content.message}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {content.to ? (
          <Link className="rounded-lg bg-primary px-4 py-3 text-sm font-black text-white shadow-panel" to={content.to}>{content.actionLabel}</Link>
        ) : null}
        {variant === 'noCandidates' && selectedOffer ? (
          <>
            <Link className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" to={`/company/offers/${selectedOffer.id}`}>Voir l offre</Link>
            <Link className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" to={`/company/offers/${selectedOffer.id}/edit`}>Modifier l offre</Link>
          </>
        ) : null}
        {variant === 'filtered' ? (
          <button className="rounded-lg bg-primary px-4 py-3 text-sm font-black text-white shadow-panel" type="button" onClick={onResetFilters}>Reinitialiser les filtres</button>
        ) : null}
      </div>
    </section>
  );
}

export default CandidateRankingEmptyState;
