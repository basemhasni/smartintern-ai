import { Wrench } from 'lucide-react';

import EmptyState from '../common/EmptyState.jsx';
import SkillBadge from '../common/SkillBadge.jsx';
import { getCvSkills, getMissingSkillsFromRecommendations } from '../../utils/studentDashboard.js';

function SkillsOverview({ latestCv, recommendations }) {
  const detectedSkills = getCvSkills(latestCv);
  const skillsToImprove = getMissingSkillsFromRecommendations(recommendations);

  if (!detectedSkills.length && !skillsToImprove.length) {
    return (
      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <EmptyState
          icon={Wrench}
          title="Competences en attente d'analyse"
          message="Une fois votre CV analyse, vos competences et axes d'amelioration apparaitront ici."
        />
      </section>
    );
  }

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Competences</p>
      <h2 className="mt-2 text-xl font-black text-ink">Ce que le matching utilise</h2>

      <div className="mt-5">
        <p className="text-sm font-black text-ink">Competences detectees</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {detectedSkills.length ? detectedSkills.map((skill) => (
            <SkillBadge key={skill} tone="ai">{skill}</SkillBadge>
          )) : <p className="text-sm text-muted">Aucune competence detectee pour l'instant.</p>}
        </div>
      </div>

      <div className="mt-5 rounded-stitch bg-canvas p-4">
        <p className="text-sm font-black text-ink">A developper</p>
        <p className="mt-1 text-sm leading-6 text-muted">
          Ces competences apparaissent dans les ecarts des offres recommandees.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {skillsToImprove.length ? skillsToImprove.map((skill) => (
            <SkillBadge key={skill} tone="danger">{skill}</SkillBadge>
          )) : <p className="text-sm text-muted">Aucun axe frequent detecte pour le moment.</p>}
        </div>
      </div>
    </section>
  );
}

export default SkillsOverview;
