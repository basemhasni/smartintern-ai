import { FileText } from 'lucide-react';

import EmptyState from '../../common/EmptyState.jsx';

function CvEmptyState({ action }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <EmptyState
        icon={FileText}
        title="Votre profil IA commence avec votre CV"
        message="Importez un CV pour detecter vos competences, calculer vos scores de compatibilite et recevoir des recommandations personnalisees."
        action={action}
      />
    </section>
  );
}

export default CvEmptyState;
