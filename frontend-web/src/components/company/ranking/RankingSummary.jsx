import { BrainCircuit, CircleSlash, Gauge, UsersRound } from 'lucide-react';

import StatCard from '../../common/StatCard.jsx';

function RankingSummary({ summary }) {
  return (
    <section aria-label="Resume du classement">
      <h2 className="sr-only">Resume du classement</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UsersRound} title="Candidats classes" value={summary.total} description="Pour l offre selectionnee" />
        <StatCard icon={Gauge} title="Score moyen" value={summary.average === null ? '--' : `${summary.average}%`} description="Sur les scores disponibles" tone="ai" />
        <StatCard icon={BrainCircuit} title="Meilleure compatibilite" value={summary.best === null ? '--' : `${summary.best}%`} description="Score le plus eleve charge" tone="cyan" />
        <StatCard icon={CircleSlash} title="Sans analyse CV" value={summary.withoutCv} description="Score non disponible" tone="warning" />
      </div>
    </section>
  );
}

export default RankingSummary;
