import { workflowSteps } from '../../data/landingData.js';
import AnimatedReveal from './AnimatedReveal.jsx';
import LandingSection from './LandingSection.jsx';

function LandingHowItWorks() {
  return (
    <LandingSection
      id="how-it-works"
      eyebrow="Fonctionnement"
      title="Du CV au classement candidat, un flux clair et explicable."
      subtitle="Le matching devient un parcours lisible, depuis l import du CV jusqu a la comparaison des profils cote entreprise."
      className="bg-white"
    >
      <div className="relative mt-14">
        <div className="absolute left-6 top-0 hidden h-full w-px bg-line md:left-1/2 md:block" aria-hidden="true" />
        <div className="grid gap-5">
          {workflowSteps.map((step, index) => (
            <AnimatedReveal key={step} delay={index * 70} direction={index % 2 ? 'left' : 'right'}>
              <article className={`relative grid gap-4 md:grid-cols-2 ${index % 2 ? '' : 'md:[&>div]:col-start-2'}`}>
                <div className="rounded-[24px] border border-line bg-canvas p-5 shadow-panel">
                  <span className="inline-grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-black text-white shadow-panel">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-4 text-xl font-black text-ink">{step}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Une etape produit simple, reliee aux donnees existantes et presentee avec un resultat comprehensible.
                  </p>
                </div>
              </article>
            </AnimatedReveal>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}

export default LandingHowItWorks;
