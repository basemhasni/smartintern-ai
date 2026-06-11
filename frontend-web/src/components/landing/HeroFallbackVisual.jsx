import { landingImages } from '../../data/landingData.js';
import FloatingVisualCard from './FloatingVisualCard.jsx';
import LandingImage from './LandingImage.jsx';

function HeroFallbackVisual({ animated = false }) {
  return (
    <div className={`relative rounded-[34px] border border-white/80 bg-white/75 p-3 shadow-stitch backdrop-blur ${animated ? 'hero-fallback-animated' : ''}`}>
      <div className="hero-fallback-beam absolute left-[14%] top-[18%] h-px w-[72%] rotate-[18deg]" aria-hidden="true" />
      <div className="hero-fallback-beam absolute bottom-[20%] left-[16%] h-px w-[66%] -rotate-[16deg]" aria-hidden="true" />
      <LandingImage
        src={landingImages.hero}
        alt="Carte visuelle reliant profil etudiant, moteur IA et offres recommandees"
        priority
        className="aspect-[1.08] rounded-[28px]"
      />
      <FloatingVisualCard className="absolute left-5 top-6 hidden md:block" label="Fallback premium" value="Matching explicable" />
      <FloatingVisualCard className="absolute bottom-6 right-5 hidden md:block" label="AI Match" value="87 % demo" />
    </div>
  );
}

export default HeroFallbackVisual;
