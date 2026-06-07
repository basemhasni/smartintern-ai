import { ArrowRight, BrainCircuit, FileText, Sparkles } from 'lucide-react';

import SkillPill from './SkillPill.jsx';

function OfferCard({ title, company, score, tone = 'blue' }) {
  return (
    <article className="rounded-stitch border border-line bg-white p-4 shadow-panel transition hover:-translate-y-1 hover:shadow-stitch">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-ink">{title}</h3>
          <p className="mt-1 text-xs font-medium text-muted">{company}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone === 'violet' ? 'ai-score-ring' : 'score-ring'}`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-extrabold text-ink">{score}%</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <SkillPill>React</SkillPill>
        <SkillPill tone={tone === 'violet' ? 'violet' : 'cyan'}>Node.js</SkillPill>
      </div>
    </article>
  );
}

function HeroCareerMap() {
  return (
    <div className="relative mx-auto w-full max-w-[620px] lg:max-w-none">
      <svg className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" aria-hidden="true">
        <path className="signal-line" d="M165 205 C240 110 325 125 385 205" fill="none" stroke="#6d36e8" strokeWidth="2" opacity="0.45" />
        <path className="signal-line" d="M386 205 C475 120 565 126 638 185" fill="none" stroke="#0f5bd7" strokeWidth="2" opacity="0.45" />
        <path className="signal-line" d="M386 250 C475 330 570 316 650 274" fill="none" stroke="#23b9d6" strokeWidth="2" opacity="0.35" />
      </svg>

      <div className="grid gap-4 lg:grid-cols-[1fr_150px_1.15fr] lg:items-center">
        <section className="rounded-[18px] border border-line bg-white p-5 shadow-stitch" aria-label="Profil etudiant de demonstration">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primarySoft text-primary">
                <FileText size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Profil CV</p>
                <h2 className="text-lg font-extrabold text-ink">Hasni B.</h2>
              </div>
            </div>
            <span className="rounded-full bg-aiSoft px-3 py-1 text-xs font-bold text-ai">Analyse active</span>
          </div>
          <div className="mt-5 grid gap-3">
            <div className="rounded-xl bg-canvas p-3">
              <p className="text-xs font-semibold text-muted">Objectif</p>
              <p className="mt-1 text-sm font-bold text-ink">Developpeur fullstack</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SkillPill>React</SkillPill>
              <SkillPill>Node.js</SkillPill>
              <SkillPill tone="cyan">PostgreSQL</SkillPill>
              <SkillPill tone="violet">Git</SkillPill>
            </div>
          </div>
        </section>

        <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full border border-line bg-white shadow-stitch lg:h-40 lg:w-40">
          <div className="absolute inset-3 rounded-full border border-dashed border-ai/30" />
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-aiSoft text-ai" style={{ animation: 'float-soft 5s ease-in-out infinite' }}>
            <BrainCircuit size={34} aria-hidden="true" />
          </div>
          <span className="absolute -right-4 top-5 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary shadow-panel">
            agents IA
          </span>
          <span className="absolute -bottom-1 left-2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-panel">
            RAG
          </span>
        </div>

        <section className="grid gap-3" aria-label="Offres classees par compatibilite">
          <div className="rounded-[18px] border border-primary/20 bg-white p-4 shadow-stitch">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ai">
              <Sparkles size={14} aria-hidden="true" />
              meilleure correspondance
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-ink">Stage Frontend React</h3>
                <p className="mt-1 text-sm text-muted">Score explique par competences communes et ecarts.</p>
              </div>
              <div className="ai-score-ring flex h-20 w-20 shrink-0 items-center justify-center rounded-full">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-lg font-black text-ink">87%</span>
              </div>
            </div>
          </div>
          <OfferCard title="Backend Engineer Intern" company="PayFlow Systems" score="82" />
          <OfferCard title="Product Data Intern" company="Nexus Creative" score="74" tone="violet" />
        </section>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-panel">
          React <ArrowRight size={13} aria-hidden="true" /> score explique
        </span>
        <span className="rounded-full bg-white px-3 py-2 shadow-panel">Docker identifie comme ecart</span>
        <span className="rounded-full bg-white px-3 py-2 shadow-panel">recommandations ciblees</span>
      </div>
    </div>
  );
}

export default HeroCareerMap;
