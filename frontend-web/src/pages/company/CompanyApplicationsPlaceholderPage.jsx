import { FileStack } from 'lucide-react';

import EmptyState from '../../components/common/EmptyState.jsx';

function CompanyApplicationsPlaceholderPage() {
  return (
    <EmptyState
      icon={FileStack}
      title="Candidatures"
      message="La page complete de suivi des candidatures entreprise sera developpee dans une prochaine etape."
    />
  );
}

export default CompanyApplicationsPlaceholderPage;
