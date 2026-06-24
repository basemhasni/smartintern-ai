import SkillBadge from '../common/SkillBadge.jsx';
import AiSectionCard from './AiSectionCard.jsx';

function SkillGroup({ title, skills, tone }) {
  if (!skills?.length) return null;
  return <div><p className="text-sm font-black text-ink">{title}</p><div className="mt-2 flex flex-wrap gap-2">{skills.map((skill) => <SkillBadge key={skill} tone={tone}>{skill}</SkillBadge>)}</div></div>;
}

function MissingSkillsPanel({ matching }) {
  const v3 = matching?.v3 || {};
  const hasItems = v3.criticalMissingSkills?.length || v3.missingRequiredSkills?.length || v3.missingOptionalSkills?.length;
  if (!hasItems) return null;
  return (
    <AiSectionCard title="Competences a renforcer" description="Les competences critiques ont le plus fort impact sur cette offre.">
      <div className="space-y-4">
        <SkillGroup title="Critiques manquantes" skills={v3.criticalMissingSkills} tone="danger" />
        <SkillGroup title="Obligatoires manquantes" skills={v3.missingRequiredSkills} tone="primary" />
        <SkillGroup title="Optionnelles manquantes" skills={v3.missingOptionalSkills} tone="ai" />
      </div>
    </AiSectionCard>
  );
}

export default MissingSkillsPanel;
