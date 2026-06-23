import { BriefcaseBusiness } from 'lucide-react';

import EmptyState from '../../components/common/EmptyState.jsx';

function CompanyOffersPlaceholderPage() {
  return (
    <EmptyState
      icon={BriefcaseBusiness}
      title="Gestion des offres"
      message="La page complete de creation et de gestion des offres sera ajoutee ensuite."
    />
  );
}

export default CompanyOffersPlaceholderPage;
