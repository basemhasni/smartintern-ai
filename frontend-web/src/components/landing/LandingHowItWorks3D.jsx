import { workflowSteps } from '../../data/landingData.js';
import AnimatedReveal from './AnimatedReveal.jsx';
import LandingSection from './LandingSection.jsx';

function LandingHowItWorks3D() {
  return (
    <LandingSection
      id="how-it-works"
      eyebrow="Fonctionnement"
      title="Du CV au classement candidat, un flux clair et explicable."
      subtitle="Une timeline en perspective montre comment les signaux avancent d une etape a l autre."
      className="bg-white"
    >
      <div className="landing-timeline-3d relative mx-auto mt-14 max-w-5xl">
        <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-primary via-ai to-cyan-400 md:left-1/2" aria-hidden="true" />
        <div className="grid gap-6">
          {workflowSteps.map((step, index) => (
            <AnimatedReveal key={step} delay={index * 80} direction={index % 2 ? 'left' : 'right'}>
              <article className={`relative grid gap-4 md:grid-cols-2 ${index % 2 ? '' : 'md:[&>div]:col-start-2'}`}>
                <span className="absolute left-3 top-6 z-10 grid h-7 w-7 place-items-center rounded-full border border-white bg-primary text-[10px] font-black text-white shadow-panel md:left-[calc(50%-14px)]">
                  {index + 1}
                </span>
                <div className="timeline-card-3d rounded-[24px] border border-line bg-canvas p-6 shadow-panel">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Etape {String(index + 1).padStart(2, '0')}</p>
                  <h3 className="mt-3 text-xl font-black text-ink">{step}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">Le signal progresse sans masquer la logique de decision.</p>
                </div>
              </article>
            </AnimatedReveal>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}

export default LandingHowItWorks3D;
