import { ArrowRight, Sparkles } from 'lucide-react';

import SkillPill from '../landing/SkillPill.jsx';

function AuthVisualPanel() {
  return (
    <aside className="hidden min-h-screen bg-[#efefff] px-10 py-10 lg:flex lg:flex-col lg:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="text-base font-black text-ink">SmartIntern AI</p>
            <p className="text-[11px] font-semibold text-muted">AI-powered Career Hub</p>
          </div>
        </div>

        <div className="mt-14 max-w-md">
          <h2 className="text-3xl font-black leading-tight tracking-tight text-ink">
            Accelerez votre parcours avec un matching intelligent.
          </h2>
          <p className="mt-5 text-sm leading-7 text-muted">
            Retrouvez vos recommandations, vos candidatures et vos outils IA dans un espace clair et securise.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md rounded-[22px] bg-[#102e34] p-8 shadow-stitch">
        <div className="rounded-[18px] bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-ai">Career Signal</p>
              <h3 className="mt-2 text-lg font-black text-ink">Frontend React Intern</h3>
              <p className="mt-1 text-xs font-semibold text-muted">TechNova Labs</p>
            </div>
            <div className="ai-score-ring flex h-20 w-20 shrink-0 items-center justify-center rounded-full">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-lg font-black text-ink">87%</span>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-canvas p-3">
            <span className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">CV</span>
            <ArrowRight size={16} className="text-muted" aria-hidden="true" />
            <span className="rounded-lg bg-aiSoft px-3 py-2 text-xs font-bold text-ai">Agents IA</span>
            <ArrowRight size={16} className="text-muted" aria-hidden="true" />
            <span className="rounded-lg bg-primarySoft px-3 py-2 text-xs font-bold text-primary">Score</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <SkillPill>React</SkillPill>
            <SkillPill>Node.js</SkillPill>
            <SkillPill tone="cyan">PostgreSQL</SkillPill>
            <SkillPill tone="red">Docker a renforcer</SkillPill>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default AuthVisualPanel;
