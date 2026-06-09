import { Link } from 'react-router-dom';
import { FileStack } from 'lucide-react';

import EmptyState from '../../common/EmptyState.jsx';

function CompanyApplicationsEmptyState({ variant, selectedOffer, onReset }) {
  if (variant === 'no-offers') {
    return (
      <EmptyState
        icon={FileStack}
        title="Creez une offre pour commencer a recevoir des candidatures"
        message="Les candidatures apparaitront ici lorsqu une offre aura ete creee et publiee."
        action={<Link className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-black text-white" to="/company/offers/new">Creer une offre</Link>}
      />
    );
  }

  if (variant === 'filtered') {
    return (
      <EmptyState
        icon={FileStack}
        title="Aucune candidature ne correspond aux filtres"
        message="Reinitialisez les filtres ou modifiez votre recherche."
        action={<button className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-white" type="button" onClick={onReset}>Reinitialiser les filtres</button>}
      />
    );
  }

  return (
    <EmptyState
      icon={FileStack}
      title="Aucune candidature recue pour cette offre"
      message="Les profils apparaitront ici des qu un etudiant aura envoye sa candidature."
      action={selectedOffer ? <Link className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-black text-white" to={`/company/offers/${selectedOffer.id}`}>Voir l offre</Link> : null}
    />
  );
}

export default CompanyApplicationsEmptyState;
