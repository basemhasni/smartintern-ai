import { Building2, GraduationCap } from 'lucide-react';

import { companySteps, landingImages, studentSteps } from '../../data/landingData.js';
import AnimatedReveal from './AnimatedReveal.jsx';
import LandingImage from './LandingImage.jsx';
import LandingSection from './LandingSection.jsx';

function JourneyPanel3D({ title, steps, image, icon: Icon, tone }) {
  return (
    <article className="landing-perspective-card overflow-hidden rounded-[32px] border border-line bg-white shadow-stitch">
      <div className="relative">
        <LandingImage src={image} alt={`Parcours ${title} SmartIntern AI`} className="aspect-[1.55] rounded-none" />
        <div className="absolute bottom-4 left-4 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-panel backdrop-blur">
          <Icon className={`h-5 w-5 ${tone === 'company' ? 'text-ai' : 'text-primary'}`} aria-hidden="true" />
          <p className="mt-2 text-sm font-black text-ink">Parcours {title}</p>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <h3 className="text-2xl font-black text-ink">{title}</h3>
        <ol className="mt-6 grid gap-3">
          {steps.map((step, index) => (
            <li key={step} className="journey-step-3d flex items-center gap-3 rounded-2xl bg-canvas px-4 py-3 text-sm font-bold text-ink" style={{ transitionDelay: `${index * 70}ms` }}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-primary shadow-panel">{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}

function LandingJourneys3D() {
  return (
    <LandingSection
      id="journeys"
      eyebrow="Parcours"
      title="Deux parcours, une meme logique de compatibilite."
      subtitle="Deux flux complementaires, mis en scene comme des parcours de decision plutot que de simples listes."
      className="bg-canvas"
    >
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <AnimatedReveal direction="right">
          <JourneyPanel3D title="Etudiants" steps={studentSteps} image={landingImages.studentJourney} icon={GraduationCap} />
        </AnimatedReveal>
        <AnimatedReveal direction="left" delay={120}>
          <JourneyPanel3D title="Entreprises" steps={companySteps} image={landingImages.companyJourney} icon={Building2} tone="company" />
        </AnimatedReveal>
      </div>
    </LandingSection>
  );
}

export default LandingJourneys3D;
