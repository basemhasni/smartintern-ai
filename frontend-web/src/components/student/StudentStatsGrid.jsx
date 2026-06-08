import { BriefcaseBusiness, FileCheck2, Send, Sparkles } from 'lucide-react';

import StatCard from '../common/StatCard.jsx';
import { getBestRecommendationScore } from '../../utils/studentDashboard.js';

function StudentStatsGrid({ latestCv, recommendations, applications }) {
  const bestScore = getBestRecommendationScore(recommendations);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Statistiques etudiant">
      <StatCard
        icon={FileCheck2}
        title="CV"
        value={latestCv ? 'Disponible' : 'A importer'}
        description={latestCv ? latestCv.fileName : 'Importez votre CV pour activer le matching.'}
        tone="primary"
      />
      <StatCard
        icon={Sparkles}
        title="Recommandations"
        value={recommendations.length}
        description="Offres calculees depuis votre dernier CV analyse."
        tone="ai"
      />
      <StatCard
        icon={Send}
        title="Candidatures"
        value={applications.length}
        description="Total des candidatures envoyees."
        tone="cyan"
      />
      <StatCard
        icon={BriefcaseBusiness}
        title="Meilleur score IA"
        value={bestScore === null ? '—' : `${bestScore}%`}
        description={bestScore === null ? 'Aucun score disponible.' : 'Meilleure recommandation actuelle.'}
        tone="warning"
      />
    </section>
  );
}

export default StudentStatsGrid;
