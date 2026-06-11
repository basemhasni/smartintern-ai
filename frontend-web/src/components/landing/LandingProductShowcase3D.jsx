import { ArrowRight } from 'lucide-react';

import { landingImages, productHighlights } from '../../data/landingData.js';
import AnimatedReveal from './AnimatedReveal.jsx';
import LandingImage from './LandingImage.jsx';
import LandingSection from './LandingSection.jsx';

const moduleImages = [
  landingImages.companyDashboard,
  landingImages.careerAssistant,
  landingImages.cvAnalysis,
  landingImages.mobileApp,
];

function LandingProductShowcase3D() {
  return (
    <LandingSection
      id="product"
      eyebrow="Produit"
      title="Un produit complet, pas seulement un algorithme."
      subtitle="Les interfaces sont presentees comme une pile produit : dashboards, matching, assistant, lettres et experience mobile restent connectes."
      className="bg-white"
    >
      <AnimatedReveal className="mt-12">
        <div className="product-stack-3d relative overflow-hidden rounded-[36px] border border-line bg-canvas p-3 shadow-stitch md:p-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(15,91,215,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(109,54,232,0.14),transparent_26%)]" aria-hidden="true" />
          <div className="relative grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div className="product-collage-card rounded-[30px] border border-white bg-white/80 p-2 shadow-stitch backdrop-blur">
              <LandingImage src={landingImages.productCollage} alt="Collage des interfaces produit SmartIntern AI" className="aspect-[1.78] rounded-[24px]" imgClassName="object-cover" />
            </div>
            <div className="grid gap-3">
              {productHighlights.map((item, index) => (
                <div key={item} className="product-panel-3d flex items-center justify-between rounded-2xl border border-white bg-white/90 px-4 py-4 text-sm font-black text-ink shadow-panel backdrop-blur" style={{ '--panel-delay': `${index * 90}ms` }}>
                  <span>{item}</span>
                  <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedReveal>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {moduleImages.map((src, index) => (
          <AnimatedReveal key={src} delay={index * 80}>
            <div className="product-module-3d rounded-[26px] border border-line bg-white p-2 shadow-panel">
              <LandingImage src={src} alt={`Module produit SmartIntern AI ${index + 1}`} className="aspect-[0.92] rounded-[20px]" imgClassName="object-cover" />
            </div>
          </AnimatedReveal>
        ))}
      </div>
    </LandingSection>
  );
}

export default LandingProductShowcase3D;
