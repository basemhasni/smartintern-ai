import { BriefcaseBusiness } from 'lucide-react';

import EmptyState from '../../common/EmptyState.jsx';

function OffersEmptyState({ variant = 'filters', onReset }) {
  if (variant === 'no-offers') {
    return (
      <EmptyState
        icon={BriefcaseBusiness}
        title="Aucune offre n’est disponible pour le moment."
        message="Les offres publiees par les entreprises apparaitront ici."
      />
    );
  }

  return (
    <EmptyState
      icon={BriefcaseBusiness}
      title="Aucune offre ne correspond a vos filtres."
      message="Elargissez votre recherche ou reinitialisez les filtres."
      action={<button className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-white" type="button" onClick={onReset}>Reinitialiser les filtres</button>}
    />
  );
}

export default OffersEmptyState;
