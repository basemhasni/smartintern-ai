import { CheckCircle2, Clock3, FileCheck2, ShieldAlert, Target } from 'lucide-react';

function CoverageMetric({ icon: Icon, label, value, detail }) {
  return (
    <div className="border-l-2 border-primary pl-4">
      <div className="flex items-center gap-2 text-muted"><Icon className="h-4 w-4" aria-hidden="true" /><p className="text-xs font-black uppercase tracking-[0.1em]">{label}</p></div>
      <p className="mt-2 text-2xl font-black text-ink">{value}</p>
      <p className="mt-1 text-xs font-bold leading-5 text-muted">{detail}</p>
    </div>
  );
}

function AdviceList({ title, items = [] }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-sm font-black text-ink">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.slice(0, 4).map((item, index) => {
          const text = typeof item === 'string' ? item : item.tip;
          return <li key={`${title}-${index}`} className="flex gap-2 text-sm leading-6 text-muted"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{text}</li>;
        })}
      </ul>
    </div>
  );
}

function CareerAnalysisOverview({ advice }) {
  const summary = advice.v2.analysisSummary;
  if (!summary) return null;

  const required = summary.requiredCoverage || {};
  const critical = summary.criticalCoverage || {};
  const evidence = summary.evidenceSummary || {};
  const effort = advice.v2.estimatedPreparationEffort;
  const breakdown = Object.entries(summary.scoreBreakdown || {}).filter(([key, value]) => key !== 'total' && Number.isFinite(Number(value)));
  const summaryScore = Number.isFinite(Number(summary.score)) ? `${Number(summary.score)}/100` : 'Non disponible';

  return (
    <section className="rounded-stitch border border-line bg-white p-5 shadow-panel sm:p-7">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-ai">Diagnostic complet</p>
      <h2 className="mt-2 text-xl font-black text-ink">Ce qui construit votre niveau de preparation</h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-muted">{advice.profileSummary}</p>

      <div className="mt-6 grid gap-5 border-y border-line py-6 sm:grid-cols-2 xl:grid-cols-4">
        <CoverageMetric icon={Target} label="Score" value={summaryScore} detail={`Confiance ${summary.confidence || 'non disponible'}`} />
        <CoverageMetric icon={FileCheck2} label="Exigences" value={`${required.covered || 0}/${required.total || 0}`} detail="Competences obligatoires couvertes" />
        <CoverageMetric icon={ShieldAlert} label="Critiques" value={`${critical.covered || 0}/${critical.total || 0}`} detail="Competences critiques couvertes" />
        <CoverageMetric icon={CheckCircle2} label="Preuves fortes" value={evidence.strong || 0} detail={`${evidence.weak || 0} preuve(s) faible(s), ${evidence.missing || 0} absente(s)`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h3 className="text-sm font-black text-ink">Detail du score</h3>
          {breakdown.length ? (
            <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {breakdown.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between border-b border-line pb-2 text-sm"><dt className="text-muted">{key}</dt><dd className="font-black text-ink">{Number(value).toFixed(1)}</dd></div>
              ))}
            </dl>
          ) : <p className="mt-3 text-sm text-muted">Le detail pondere du score n est pas disponible.</p>}
        </div>
        <div className="border-l-0 border-line lg:border-l lg:pl-6">
          <div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-primary" aria-hidden="true" /><h3 className="text-sm font-black text-ink">Effort estime</h3></div>
          <p className="mt-3 text-lg font-black text-primary">{effort?.level || 'Non determine'}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{effort?.reason || 'Les donnees ne permettent pas une estimation fiable.'}</p>
        </div>
      </div>

      <div className="mt-7 grid gap-6 border-t border-line pt-6 lg:grid-cols-2">
        <AdviceList title="Ameliorer le CV" items={advice.v2.cvImprovementTips} />
        <AdviceList title="Preparer l entretien" items={advice.v2.interviewPreparationTips} />
      </div>

      {advice.v2.recommendedProjects.length ? (
        <div className="mt-7 border-t border-line pt-6">
          <h3 className="text-sm font-black text-ink">Projets recommandes pour fermer les principaux ecarts</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {advice.v2.recommendedProjects.map((project) => (
              <article key={project.title} className="rounded-stitch border border-line bg-canvas p-4">
                <h4 className="font-black text-ink">{project.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted">{project.description}</p>
                <p className="mt-3 text-xs font-bold text-primary">{project.skillsCovered.join(', ')}{project.estimatedTime ? ` / ${project.estimatedTime}` : ''}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default CareerAnalysisOverview;
