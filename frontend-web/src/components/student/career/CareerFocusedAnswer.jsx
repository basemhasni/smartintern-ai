import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Lightbulb,
  MessageSquareText,
  Target,
} from 'lucide-react';

const intentIcons = {
  SKILL_GAPS: Target,
  PROJECT_IDEAS: Lightbulb,
  CV_IMPROVEMENT: FileText,
  INTERVIEW_PREP: MessageSquareText,
  STRENGTHS: CheckCircle2,
  LEARNING_PLAN: BookOpenCheck,
  READINESS: Target,
  SPECIFIC_SKILL: Target,
  CUSTOM_QUESTION: MessageSquareText,
  FULL_ANALYSIS: BookOpenCheck,
};

const readinessStyles = {
  READY: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  ALMOST_READY: 'border-cyan-200 bg-cyan-50 text-cyan-800',
  NEEDS_TARGETED_WORK: 'border-amber-200 bg-amber-50 text-amber-900',
  NEEDS_MAJOR_WORK: 'border-orange-200 bg-orange-50 text-orange-900',
  INSUFFICIENT_DATA: 'border-line bg-canvas text-muted',
};

function PriorityList({ items = [] }) {
  if (!items.length) {
    return <p className="text-sm leading-6 text-muted">Aucune priorite technique supplementaire n a ete identifiee.</p>;
  }

  return (
    <ol className="divide-y divide-line">
      {items.map((item, index) => (
        <li key={`${item.skill}-${item.gapType}`} className="grid gap-3 py-4 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:items-start">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-black text-white">{index + 1}</span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-ink">{item.skill}</h3>
              <span className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[11px] font-black uppercase text-muted">{item.gapType || 'A renforcer'}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{item.reason}</p>
            {item.suggestedActions[0] ? (
              <p className="mt-2 flex gap-2 text-sm font-bold leading-6 text-ink">
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {item.suggestedActions[0]}
              </p>
            ) : null}
          </div>
          <span className="w-fit rounded-full bg-aiSoft px-3 py-1 text-xs font-black text-ai">{item.priorityLabel}</span>
        </li>
      ))}
    </ol>
  );
}

function ProjectList({ projects = [] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {projects.map((project) => (
        <article key={project.title} className="rounded-stitch border border-line bg-canvas p-5">
          <div className="flex items-start gap-3">
            <BriefcaseBusiness className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h3 className="font-black text-ink">{project.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{project.description}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.skillsCovered.map((skill) => <span key={skill} className="rounded-full bg-white px-3 py-1 text-xs font-black text-primary">{skill}</span>)}
          </div>
          <p className="mt-4 text-xs font-bold text-muted">{project.estimatedTime} / Niveau {project.difficulty === 'INTERMEDIATE' ? 'intermediaire' : 'debutant'}</p>
          {project.deliverables.length ? (
            <ul className="mt-4 space-y-2">
              {project.deliverables.map((deliverable) => (
                <li key={deliverable} className="flex gap-2 text-sm text-ink"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />{deliverable}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function TipsList({ items = [], type }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((item, index) => {
        const text = typeof item === 'string' ? item : item.tip;
        const label = typeof item === 'string' ? null : item.topic;
        return (
          <li key={`${label || type}-${index}`} className="flex gap-3 py-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-aiSoft text-xs font-black text-ai">{index + 1}</span>
            <div>{label ? <p className="text-sm font-black text-ink">{label}</p> : null}<p className={`${label ? 'mt-1 ' : ''}text-sm leading-6 text-muted`}>{text}</p></div>
          </li>
        );
      })}
    </ul>
  );
}

function CareerFocusedAnswer({ advice, question }) {
  const v2 = advice?.v2 || {};
  const IntentIcon = intentIcons[v2.questionIntent] || BookOpenCheck;
  const displayedQuestion = question || v2.answeredQuestion;
  const specificSkill = v2.specificSkillAnalysis;

  return (
    <section className="overflow-hidden rounded-stitch border border-primary/15 bg-white shadow-panel" aria-labelledby="career-direct-answer">
      <div className="border-b border-primary/10 bg-aiSoft/55 px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary text-white shadow-panel"><IntentIcon className="h-5 w-5" aria-hidden="true" /></span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-ai">{v2.questionIntentLabel}</p>
              <h2 id="career-direct-answer" className="mt-1 text-xl font-black text-ink">Reponse de SmartIntern AI</h2>
            </div>
          </div>
          <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-black ${readinessStyles[v2.readinessLevel] || readinessStyles.INSUFFICIENT_DATA}`}>{v2.readinessLabel}</span>
        </div>
        {displayedQuestion ? <p className="mt-4 border-l-2 border-primary pl-4 text-sm font-bold italic leading-6 text-muted">&quot;{displayedQuestion}&quot;</p> : null}
      </div>

      <div className="px-5 py-6 sm:px-7">
        <p className="text-base font-bold leading-8 text-ink">{v2.directAnswer || advice.finalAdvice}</p>

        <div className="mt-6 border-t border-line pt-2">
          {v2.questionIntent === 'PROJECT_IDEAS' && v2.recommendedProjects?.length ? <ProjectList projects={v2.recommendedProjects} /> : null}
          {v2.questionIntent === 'CV_IMPROVEMENT' ? <TipsList items={v2.cvImprovementTips} type="cv" /> : null}
          {v2.questionIntent === 'INTERVIEW_PREP' ? <TipsList items={v2.interviewPreparationTips} type="interview" /> : null}
          {v2.questionIntent === 'STRENGTHS' ? <TipsList items={(v2.evidenceBasedStrengths || []).map((item) => ({ topic: item.skill, tip: item.statement }))} type="strength" /> : null}
          {v2.questionIntent === 'LEARNING_PLAN' ? <TipsList items={(v2.learningRoadmap || []).map((item) => ({ topic: item.period, tip: `${item.objective}${item.expectedOutcome ? ` - ${item.expectedOutcome}` : ''}` }))} type="roadmap" /> : null}
          {v2.questionIntent === 'SPECIFIC_SKILL' && specificSkill ? (
            <div className="py-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-ink">{specificSkill.requirement}</h3>
                <span className="rounded-full bg-aiSoft px-3 py-1 text-xs font-black text-ai">Couverture {Math.round(Number(specificSkill.coverage || 0) * 100)}%</span>
                <span className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-black text-muted">{specificSkill.matchType || 'MISSING'}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{specificSkill.reason}</p>
              {specificSkill.evidence?.length ? <p className="mt-3 border-l-2 border-success pl-3 text-sm font-bold leading-6 text-ink">Preuve detectee : {specificSkill.evidence[0]}</p> : null}
            </div>
          ) : null}
          {['READINESS', 'CUSTOM_QUESTION'].includes(v2.questionIntent) ? <PriorityList items={v2.priorityFocus} /> : null}
          {['SKILL_GAPS', 'FULL_ANALYSIS'].includes(v2.questionIntent) ? <PriorityList items={v2.priorityFocus} /> : null}
        </div>

        {v2.warnings?.length ? (
          <div className="mt-5 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>{v2.warnings[0]}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default CareerFocusedAnswer;
