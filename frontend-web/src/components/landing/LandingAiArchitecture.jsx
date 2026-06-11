import { BrainCircuit, Layers3, Network, ShieldCheck } from 'lucide-react';

import { aiBlocks, landingImages } from '../../data/landingData.js';
import AnimatedReveal from './AnimatedReveal.jsx';
import LandingImage from './LandingImage.jsx';
import LandingSection from './LandingSection.jsx';

const icons = [BrainCircuit, Network, Layers3, ShieldCheck];

function LandingAiArchitecture() {
  return (
    <LandingSection
      id="ai"
      eyebrow="Intelligence artificielle"
      title="Une IA structuree, explicable et orientee decision."
      subtitle="La technologie reste comprehensible pour un jury, un etudiant et un recruteur : elle explique ce qu elle compare et pourquoi."
      className="bg-canvas"
    >
      <div className="mt-12 grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
        <AnimatedReveal direction="right">
          <div className="grid gap-4 sm:grid-cols-2">
            {aiBlocks.map((block, index) => {
              const Icon = icons[index] || BrainCircuit;
              return (
                <article key={block.title} className="ai-agent-card rounded-[24px] border border-line bg-white p-5 shadow-panel" style={{ '--agent-delay': `${index * 160}ms` }}>
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primarySoft text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-black text-ink">{block.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{block.text}</p>
                </article>
              );
            })}
          </div>
        </AnimatedReveal>
        <AnimatedReveal direction="left" delay={120}>
          <div className="ai-orbit-stage space-y-5">
            <div className="ai-orbit-line ai-orbit-line-one" aria-hidden="true" />
            <div className="ai-orbit-line ai-orbit-line-two" aria-hidden="true" />
            <LandingImage src={landingImages.agents} alt="Orchestration des agents IA SmartIntern AI" className="aspect-[1.35] border border-white bg-white p-2 shadow-stitch" imgClassName="rounded-[18px]" />
            <div className="grid gap-5 md:grid-cols-2">
              <LandingImage src={landingImages.rag} alt="Insights RAG bases sur des documents indexes" className="aspect-[1.2] border border-line bg-white p-2 shadow-panel" imgClassName="rounded-[16px]" />
              <LandingImage src={landingImages.explainableAi} alt="Matching IA explicable avec score et competences" className="aspect-[1.2] border border-line bg-white p-2 shadow-panel" imgClassName="rounded-[16px]" />
            </div>
          </div>
        </AnimatedReveal>
      </div>
    </LandingSection>
  );
}

export default LandingAiArchitecture;
