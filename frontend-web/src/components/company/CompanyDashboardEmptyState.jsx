import { Link } from 'react-router-dom';
import { BriefcaseBusiness } from 'lucide-react';

import EmptyState from '../common/EmptyState.jsx';

function CompanyDashboardEmptyState() {
  return (
    <EmptyState
      icon={BriefcaseBusiness}
      title="Publiez votre premiere offre"
      message="Decrivez votre besoin et laissez SmartIntern AI comparer les profils candidats."
      action={(
        <Link className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-black text-white shadow-panel" to="/company/offers">
          Creer une offre
        </Link>
      )}
    />
  );
}

export default CompanyDashboardEmptyState;
