import SkillBadge from '../../common/SkillBadge.jsx';

function CvSkillsSection({ skills }) {
  return (
    <div>
      <p className="text-sm font-black text-ink">Competences detectees</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {skills.length ? skills.map((skill) => (
          <SkillBadge key={skill} tone="ai">{skill}</SkillBadge>
        )) : (
          <p className="text-sm leading-6 text-muted">Aucune competence technique n’a ete detectee automatiquement. Vous pourrez completer votre profil manuellement.</p>
        )}
      </div>
    </div>
  );
}

export default CvSkillsSection;
