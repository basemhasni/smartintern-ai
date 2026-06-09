import { Link } from 'react-router-dom';
import { BriefcaseBusiness } from 'lucide-react';

import EmptyState from '../../common/EmptyState.jsx';

function CompanyOffersEmptyState({ filtered = false, onReset }) {
  if (filtered) {
    return (
      <EmptyState
        icon={BriefcaseBusiness}
        title="Aucune offre ne correspond a vos filtres"
        message="Modifiez votre recherche ou reinitialisez les filtres pour revoir toutes vos offres."
        action={<button className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-white" type="button" onClick={onReset}>Reinitialiser</button>}
      />
    );
  }

  return (
    <EmptyState
      icon={BriefcaseBusiness}
      title="Creez votre premiere offre de stage"
      message="Decrivez le profil recherche et laissez SmartIntern AI identifier les candidats les plus compatibles."
      action={<Link className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-black text-white" to="/company/offers/new">Creer une offre</Link>}
    />
  );
}

export default CompanyOffersEmptyState;
