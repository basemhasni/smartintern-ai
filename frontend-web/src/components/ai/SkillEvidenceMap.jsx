import { useState } from 'react';
import AiEmptyState from './AiEmptyState.jsx';
import AiSectionCard from './AiSectionCard.jsx';
import SkillEvidenceBadge from './SkillEvidenceBadge.jsx';

function SkillEvidenceMap({ evidenceMap, requiredSkills = [] }) {
  const [expanded, setExpanded] = useState(false);
  const required = new Set(requiredSkills.map((skill) => String(skill).toLowerCase()));
  const entries = Object.entries(evidenceMap || {}).sort(([first], [second]) => {
    const firstRequired = required.has(first.toLowerCase());
    const secondRequired = required.has(second.toLowerCase());
    return firstRequired === secondRequired ? first.localeCompare(second) : firstRequired ? -1 : 1;
  });
  const visible = expanded ? entries : entries.slice(0, 6);

  return (
    <AiSectionCard title="Preuves par competence" description="Une mention dans une liste n a pas la meme valeur qu une utilisation dans un projet.">
      {!entries.length ? <AiEmptyState message="Aucune preuve structuree n est disponible pour ce matching." /> : (
        <>
          <div className="space-y-3">
            {visible.map(([skill, item]) => (
              <article key={skill} className="rounded-lg border border-line bg-canvas p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><h3 className="font-black text-ink">{skill}</h3>{required.has(skill.toLowerCase()) ? <span className="text-[10px] font-black uppercase text-primary">Requise</span> : null}</div>
                  <SkillEvidenceBadge level={item.evidenceLevel} />
                </div>
                <p className="mt-2 text-xs font-bold text-muted">Type : {item.evidenceType || 'NONE'}</p>
                {(item.evidenceSnippets || []).slice(0, 2).map((snippet, index) => <p key={`${skill}-${index}`} className="mt-2 border-l-2 border-ai pl-3 text-xs leading-5 text-muted">{String(snippet).slice(0, 220)}</p>)}
                {item.recommendation ? <p className="mt-3 text-xs font-bold leading-5 text-primary">{item.recommendation}</p> : null}
              </article>
            ))}
          </div>
          {entries.length > 6 ? <button className="mt-4 text-sm font-black text-primary" type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Afficher moins' : `Voir ${entries.length - 6} competence(s) de plus`}</button> : null}
        </>
      )}
    </AiSectionCard>
  );
}

export default SkillEvidenceMap;
