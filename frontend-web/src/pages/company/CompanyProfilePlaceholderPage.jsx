import { Building2 } from 'lucide-react';

import EmptyState from '../../components/common/EmptyState.jsx';

function CompanyProfilePlaceholderPage() {
  return (
    <EmptyState
      icon={Building2}
      title="Profil entreprise"
      message="La modification complete du profil entreprise sera developpee dans une prochaine etape."
    />
  );
}

export default CompanyProfilePlaceholderPage;
