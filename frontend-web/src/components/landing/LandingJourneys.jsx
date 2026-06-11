import { Building2, GraduationCap } from 'lucide-react';

import { companySteps, landingImages, studentSteps } from '../../data/landingData.js';
import AnimatedReveal from './AnimatedReveal.jsx';
import LandingImage from './LandingImage.jsx';
import LandingSection from './LandingSection.jsx';

function JourneyPanel({ title, subtitle, steps, image, icon: Icon, tone }) {
  return (
    <article className="overflow-hidden rounded-[30px] border border-line bg-white shadow-stitch">
      <LandingImage src={image} alt={subtitle} className="aspect-[1.55] rounded-none" />
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone === 'company' ? 'bg-aiSoft text-ai' : 'bg-primarySoft text-primary'}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-muted">Parcours</p>
            <h3 className="text-2xl font-black text-ink">{title}</h3>
          </div>
        </div>
        <ol className="mt-6 grid gap-3">
          {steps.map((step, index) => (
            <li key={step} className="flex items-center gap-3 rounded-2xl bg-canvas px-4 py-3 text-sm font-bold text-ink">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-primary shadow-panel">{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}

function LandingJourneys() {
  return (
    <LandingSection
      id="journeys"
      eyebrow="Parcours"
      title="Deux parcours, une meme logique de compatibilite."
      subtitle="Les etudiants avancent avec un profil plus lisible. Les entreprises recrutent avec une lecture plus claire des competences."
      className="bg-canvas"
    >
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <AnimatedReveal direction="right">
          <JourneyPanel title="Etudiants" subtitle="Parcours etudiant SmartIntern AI" steps={studentSteps} image={landingImages.studentJourney} icon={GraduationCap} />
        </AnimatedReveal>
        <AnimatedReveal direction="left" delay={120}>
          <JourneyPanel title="Entreprises" subtitle="Parcours entreprise SmartIntern AI" steps={companySteps} image={landingImages.companyJourney} icon={Building2} tone="company" />
        </AnimatedReveal>
      </div>
    </LandingSection>
  );
}

export default LandingJourneys;
