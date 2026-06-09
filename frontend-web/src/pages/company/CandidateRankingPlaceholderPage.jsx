import { Trophy } from 'lucide-react';

import EmptyState from '../../components/common/EmptyState.jsx';

function CandidateRankingPlaceholderPage() {
  return (
    <EmptyState
      icon={Trophy}
      title="Classement IA"
      message="Le classement complet par offre sera construit dans une prochaine etape. Le dashboard affiche deja un apercu."
    />
  );
}

export default CandidateRankingPlaceholderPage;
