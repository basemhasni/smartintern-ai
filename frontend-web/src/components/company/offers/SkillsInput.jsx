import SkillBadge from '../../common/SkillBadge.jsx';

const suggestions = ['React', 'Angular', 'Node.js', 'Java', 'Spring Boot', 'Python', 'PostgreSQL', 'Docker', 'AWS', 'Git'];

function SkillsInput({ id, label, value, error, help, onChange }) {
  const addSkill = (rawSkill) => {
    const skill = rawSkill.trim();
    if (!skill) return;

    const exists = value.some((item) => item.toLowerCase() === skill.toLowerCase());
    if (!exists) {
      onChange([...value, skill]);
    }
  };

  const removeSkill = (skill) => {
    onChange(value.filter((item) => item !== skill));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addSkill(event.currentTarget.value);
      event.currentTarget.value = '';
    }
  };

  return (
    <div>
      <label className="text-sm font-black text-ink" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="mt-2 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        placeholder="Ajouter une competence puis Entrer"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : `${id}-help`}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          addSkill(event.currentTarget.value);
          event.currentTarget.value = '';
        }}
      />
      <p id={`${id}-help`} className="mt-2 text-xs font-bold text-muted">{help}</p>
      {error ? <p id={`${id}-error`} className="mt-2 text-xs font-bold text-danger">{error}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {value.map((skill) => (
          <button key={skill} className="rounded-full" type="button" aria-label={`Retirer ${skill}`} onClick={() => removeSkill(skill)}>
            <SkillBadge>{skill} x</SkillBadge>
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((skill) => (
          <button key={skill} className="rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-bold text-ink hover:bg-primarySoft" type="button" onClick={() => addSkill(skill)}>
            {skill}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SkillsInput;
