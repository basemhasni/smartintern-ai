import { ArrowRight } from 'lucide-react';

import { features } from '../../data/landingData.js';
import AnimatedReveal from './AnimatedReveal.jsx';
import LandingImage from './LandingImage.jsx';
import LandingSection from './LandingSection.jsx';

function LandingFeatures() {
  return (
    <LandingSection
      id="features"
      eyebrow="Fonctionnalites"
      title="Une plateforme complete pour accelerer le matching stage-candidat."
      subtitle="Chaque brique est pensee comme une fonctionnalite produit, pas comme une simple demonstration d IA."
      className="bg-white"
    >
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature, index) => (
          <AnimatedReveal key={feature.title} delay={index * 45} className="h-full">
            <article className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-line bg-white shadow-panel transition hover:-translate-y-1 hover:shadow-stitch">
              <LandingImage src={feature.image} alt="" className="aspect-[1.5] rounded-none" imgClassName="transition duration-500 group-hover:scale-105" />
              <div className="flex flex-1 flex-col p-5">
                <img className="h-11 w-11 rounded-xl object-cover shadow-panel" src={feature.icon} alt="" loading="lazy" decoding="async" />
                <h3 className="mt-4 text-lg font-black text-ink">{feature.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted">{feature.text}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-primary">
                  Produit reel
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

export default LandingFeatures;
