import SkillBadge from '../../common/SkillBadge.jsx';

function CandidateSkillsPreview({ matching }) {
  if (!matching?.matchedSkills?.length && !matching?.missingSkills?.length) {
    return <p className="text-sm font-bold text-muted">Competences non disponibles pour cette candidature.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {matching.matchedSkills.slice(0, 4).map((skill) => <SkillBadge key={skill} tone="success">{skill}</SkillBadge>)}
      {matching.missingSkills[0] ? <SkillBadge tone="danger">A developper : {matching.missingSkills[0]}</SkillBadge> : null}
    </div>
  );
}

export default CandidateSkillsPreview;
