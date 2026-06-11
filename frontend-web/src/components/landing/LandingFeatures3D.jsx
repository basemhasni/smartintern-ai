import { ArrowRight } from 'lucide-react';

import { features } from '../../data/landingData.js';
import AnimatedReveal from './AnimatedReveal.jsx';
import LandingImage from './LandingImage.jsx';
import LandingSection from './LandingSection.jsx';

function LandingFeatures3D() {
  return (
    <LandingSection
      id="features"
      eyebrow="Fonctionnalites"
      title="Une plateforme complete pour accelerer le matching stage-candidat."
      subtitle="Chaque module reagit comme une surface produit premium, avec profondeur, focus et mouvement controle."
      className="bg-white"
    >
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature, index) => (
          <AnimatedReveal key={feature.title} delay={index * 55} className="h-full">
            <article className="landing-tilt-card group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-line bg-white shadow-panel">
              <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100" aria-hidden="true">
                <div className="absolute -inset-12 bg-[radial-gradient(circle_at_30%_10%,rgba(15,91,215,0.18),transparent_38%),radial-gradient(circle_at_80%_30%,rgba(109,54,232,0.14),transparent_34%)]" />
              </div>
              <LandingImage src={feature.image} alt="" className="aspect-[1.45] rounded-none" imgClassName="transition duration-700 group-hover:scale-110" />
              <div className="relative flex flex-1 flex-col p-5">
                <img className="h-12 w-12 rounded-2xl object-cover shadow-panel transition group-hover:-translate-y-1" src={feature.icon} alt="" loading="lazy" decoding="async" />
                <h3 className="mt-4 text-lg font-black text-ink">{feature.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted">{feature.text}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-primary">
                  Explorer
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
            </article>
          </AnimatedReveal>
        ))}
      </div>
    </LandingSection>
  );
}

export default LandingFeatures3D;
