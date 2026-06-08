import SkillBadge from '../../common/SkillBadge.jsx';

function SkillGroup({ title, skills, tone }) {
  if (!skills?.length) {
    return null;
  }

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillBadge key={skill} tone={tone}>{skill}</SkillBadge>
        ))}
      </div>
    </div>
  );
}

function OfferSkills({ requiredSkills = [], optionalSkills = [], matchedSkills = [], missingSkills = [], optionalMatchedSkills = [], compact = false }) {
  return (
    <div className={`grid gap-4 ${compact ? '' : 'md:grid-cols-2'}`}>
      <SkillGroup title="Competences requises" skills={requiredSkills} tone="primary" />
      <SkillGroup title="Competences appreciees" skills={optionalSkills} tone="default" />
      <SkillGroup title="Correspondances" skills={matchedSkills} tone="success" />
      <SkillGroup title="A developper" skills={missingSkills} tone="danger" />
      <SkillGroup title="Optionnelles couvertes" skills={optionalMatchedSkills} tone="ai" />
    </div>
  );
}

export default OfferSkills;
