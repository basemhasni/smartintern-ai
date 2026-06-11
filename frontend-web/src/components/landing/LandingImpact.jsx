import { impactCards } from '../../data/landingData.js';
import AnimatedReveal from './AnimatedReveal.jsx';
import LandingSection from './LandingSection.jsx';

function LandingImpact() {
  return (
    <LandingSection
      id="impact"
      eyebrow="Impact"
      title="Pense pour reduire l ecart entre profil, competences et opportunites."
      subtitle="Des benefices prudents, concrets et relies aux donnees disponibles dans le produit."
      className="bg-canvas"
    >
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {impactCards.map((card, index) => (
          <AnimatedReveal key={card.title} delay={index * 90}>
            <article className="impact-kinetic-card h-full rounded-[26px] border border-line bg-white p-6 shadow-panel" style={{ '--impact-delay': `${index * 140}ms` }}>
              <h3 className="text-xl font-black text-ink">{card.title}</h3>
              <ul className="mt-5 space-y-3">
                {card.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-6 text-muted">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          </AnimatedReveal>
        ))}
      </div>
    </LandingSection>
  );
}

export default LandingImpact;
