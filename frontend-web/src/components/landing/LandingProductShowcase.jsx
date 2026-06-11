import { productHighlights, landingImages } from '../../data/landingData.js';
import AnimatedReveal from './AnimatedReveal.jsx';
import LandingImage from './LandingImage.jsx';
import LandingSection from './LandingSection.jsx';

function LandingProductShowcase() {
  return (
    <LandingSection
      id="product"
      eyebrow="Produit"
      title="Un produit complet, pas seulement un algorithme."
      subtitle="La plateforme reunit dashboards, recommandations, assistant carriere, lettres, classement candidat et experience mobile."
      className="bg-white"
    >
      <AnimatedReveal className="mt-12">
        <div className="overflow-hidden rounded-[34px] border border-line bg-canvas p-3 shadow-stitch">
          <LandingImage src={landingImages.productCollage} alt="Collage des interfaces produit SmartIntern AI" className="aspect-[1.9] rounded-[28px]" imgClassName="object-cover" />
        </div>
      </AnimatedReveal>

      <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <AnimatedReveal direction="right">
          <div className="grid gap-3 sm:grid-cols-2">
            {productHighlights.map((item) => (
              <div key={item} className="rounded-2xl border border-line bg-white px-4 py-4 text-sm font-black text-ink shadow-panel">
                {item}
              </div>
            ))}
          </div>
        </AnimatedReveal>
        <AnimatedReveal direction="left" delay={120}>
          <div className="grid gap-5 sm:grid-cols-3">
            <LandingImage src={landingImages.companyDashboard} alt="Apercu du dashboard entreprise" className="aspect-[0.9] border border-line bg-white p-2 shadow-panel" />
            <LandingImage src={landingImages.careerAssistant} alt="Apercu assistant carriere" className="aspect-[0.9] border border-line bg-white p-2 shadow-panel" />
            <LandingImage src={landingImages.motivationLetter} alt="Apercu generateur de lettre de motivation" className="aspect-[0.9] border border-line bg-white p-2 shadow-panel" />
          </div>
        </AnimatedReveal>
      </div>
    </LandingSection>
  );
}

export default LandingProductShowcase;
