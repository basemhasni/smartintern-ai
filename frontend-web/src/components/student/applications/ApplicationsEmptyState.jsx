import { BriefcaseBusiness } from 'lucide-react';
import { Link } from 'react-router-dom';

import EmptyState from '../../common/EmptyState.jsx';

function ApplicationsEmptyState({ variant = 'empty', onReset }) {
  if (variant === 'filters') {
    return (
      <EmptyState
        icon={BriefcaseBusiness}
        title="Aucune candidature ne correspond a vos filtres."
        message="Essayez un autre statut ou une recherche plus large."
        action={<button className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-white" type="button" onClick={onReset}>Reinitialiser</button>}
      />
    );
  }

  return (
    <EmptyState
      icon={BriefcaseBusiness}
      title="Votre prochaine opportunite commence ici"
      message="Decouvrez les offres recommandees, consultez votre score de compatibilite et envoyez votre premiere candidature."
      action={<Link className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-white" to="/student/offers">Decouvrir les offres</Link>}
    />
  );
}

export default ApplicationsEmptyState;
