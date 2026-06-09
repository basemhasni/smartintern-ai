import SkillImprovementCard from './SkillImprovementCard.jsx';

function SkillsToImprove({ skills }) {
  return (
    <section>
      <div className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Progression</p>
        <h2 className="mt-2 text-xl font-black text-ink">Competences a developper</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Des pistes constructives pour renforcer votre candidature.</p>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {skills.length ? skills.map((item) => (
          <SkillImprovementCard key={`${item.skill}-${item.priority}`} item={item} />
        )) : (
          <article className="rounded-stitch border border-line bg-white p-5 shadow-panel">
            <p className="text-sm leading-6 text-muted">Aucune competence prioritaire a ameliorer n a ete renvoyee pour cette analyse.</p>
          </article>
        )}
      </div>
    </section>
  );
}

export default SkillsToImprove;
