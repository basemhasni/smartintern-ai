import SkillBadge from '../common/SkillBadge.jsx';
import AiEmptyState from './AiEmptyState.jsx';
import AiSectionCard from './AiSectionCard.jsx';

function CareerSignalMap({ signalMap }) {
  const categories = Array.isArray(signalMap?.categories) ? signalMap.categories : [];
  return (
    <AiSectionCard title="Carte des signaux carriere" description="Lecture du profil par domaine technique pour cette offre.">
      {!categories.length ? <AiEmptyState message="La carte des domaines n est pas disponible pour cette analyse." /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {categories.map((item) => (
            <article key={item.category} className="rounded-stitch border border-line bg-canvas p-4">
              <div className="flex items-center justify-between gap-4"><h3 className="font-black text-ink">{item.category}</h3><span className="text-lg font-black text-primary">{Math.round(Number(item.score) || 0)}%</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-ai" style={{ width: `${Math.min(100, Number(item.score) || 0)}%` }} /></div>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.1em] text-ai">{item.level || 'EMPTY'} / preuves {item.evidenceQuality || 'INSUFFICIENT'}</p>
              <p className="mt-2 text-xs leading-5 text-muted">{item.explanation || 'Aucune explication disponible.'}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(item.matchedSkills || []).slice(0, 4).map((skill) => <SkillBadge key={skill} tone="success">{skill}</SkillBadge>)}
                {(item.weakSkills || []).slice(0, 2).map((skill) => <SkillBadge key={skill} tone="ai">{skill}</SkillBadge>)}
                {(item.missingSkills || []).slice(0, 2).map((skill) => <SkillBadge key={skill} tone="danger">{skill}</SkillBadge>)}
              </div>
            </article>
          ))}
        </div>
      )}
    </AiSectionCard>
  );
}

export default CareerSignalMap;
