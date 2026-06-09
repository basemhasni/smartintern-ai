import { Sparkles } from 'lucide-react';

import EmptyState from '../../common/EmptyState.jsx';

function CareerAssistantEmptyState({ variant = 'default', action }) {
  if (variant === 'no-offers') {
    return (
      <EmptyState
        icon={Sparkles}
        title="Aucune offre disponible pour une analyse carriere"
        message="Revenez prochainement ou consultez les offres des qu elles seront publiees."
        action={action}
      />
    );
  }

  return (
    <EmptyState
      icon={Sparkles}
      title="Transformez une offre en plan de progression"
      message="Selectionnez une offre, posez votre question et obtenez des recommandations concretes basees sur votre profil."
    />
  );
}

export default CareerAssistantEmptyState;
