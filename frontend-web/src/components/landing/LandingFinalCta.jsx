import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { landingImages } from '../../data/landingData.js';
import AnimatedReveal from './AnimatedReveal.jsx';
import FloatingVisualCard from './FloatingVisualCard.jsx';
import LandingImage from './LandingImage.jsx';

function LandingFinalCta() {
  return (
    <section id="contact" className="cta-kinetic-field relative overflow-hidden bg-white py-20 md:py-28">
      <div className="stitch-container">
        <AnimatedReveal>
          <div className="cta-portal relative overflow-hidden rounded-[34px] border border-primary/10 bg-[#0d1738] p-6 text-white shadow-stitch md:p-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-ai/25 to-cyan-400/20" aria-hidden="true" />
            <div className="cta-orbit cta-orbit-one" aria-hidden="true" />
            <div className="cta-orbit cta-orbit-two" aria-hidden="true" />
            <div className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Passerelle opportunite</p>
                <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                  Construisez des correspondances plus intelligentes entre talents et opportunites.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-50 md:text-base">
                  SmartIntern AI reunit analyse CV, matching IA, recommandations et suivi des candidatures dans une experience claire et moderne.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-primary shadow-panel transition hover:-translate-y-0.5" to="/register">
                    Creer un compte
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10" to="/login">
                    Se connecter
                  </Link>
                </div>
              </div>
              <div className="relative">
                <LandingImage src={landingImages.cta} alt="Pont visuel entre talents et opportunites" className="aspect-[1.35] border border-white/20 bg-white/10 p-2 shadow-stitch" imgClassName="rounded-[22px]" />
                <FloatingVisualCard className="absolute bottom-4 left-4 hidden md:block" label="Smart signal" value="Profil + Offre + Contexte" />
              </div>
            </div>
          </div>
        </AnimatedReveal>
      </div>
    </section>
  );
}

export default LandingFinalCta;
