import { ArrowRight, CirclePlay, Smartphone, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { heroSignals, landingImages, skillBadges } from '../../data/landingData.js';
import useMouseParallax from '../../hooks/useMouseParallax.js';
import useReducedMotion from '../../hooks/useReducedMotion.js';
import AnimatedReveal from './AnimatedReveal.jsx';
import FloatingUiCard3D from './FloatingUiCard3D.jsx';
import Hero3DScene from './Hero3DScene.jsx';
import HeroFallbackVisual from './HeroFallbackVisual.jsx';
import LandingImage from './LandingImage.jsx';
import MagneticButton from './MagneticButton.jsx';

function LandingHero3D() {
  const { position, bind } = useMouseParallax(1);
  const mouseRef = useRef(position);
  const reducedMotion = useReducedMotion();
  const [fallback, setFallback] = useState(false);
  const handleSceneUnavailable = useCallback(() => setFallback(true), []);

  useEffect(() => {
    mouseRef.current = position;
  }, [position]);

  const cardStyle = (x, y, z = 0) => ({
    transform: `translate3d(${position.x * x}px, ${position.y * y}px, ${z}px) rotateX(${-position.y * 3}deg) rotateY(${position.x * 4}deg)`,
  });

  return (
    <section className="relative isolate min-h-[calc(100vh-80px)] overflow-hidden pb-20 pt-10 md:pb-28 md:pt-16">
      <div className="absolute inset-0 -z-20 bg-white" />
      <img className="absolute inset-x-0 top-0 -z-10 h-full w-full object-cover opacity-20" src={landingImages.background} alt="" aria-hidden="true" />
      <div className="landing-mesh absolute inset-0 -z-10" aria-hidden="true" />
      <div className="stitch-container grid min-h-[calc(100vh-150px)] gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <AnimatedReveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-ai/20 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-ai shadow-panel">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            AI-Powered Internship Matching Platform
          </span>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-ink md:text-6xl">
            SmartIntern AI transforme la recherche de stage en matching intelligent.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Connectez les etudiants, les entreprises et les offres de stage grace a l analyse CV, au scoring IA et a des recommandations personnalisees.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <MagneticButton to="/register">
              Commencer maintenant
              <ArrowRight size={17} aria-hidden="true" />
            </MagneticButton>
            <MagneticButton href="#product" variant="light">
              <CirclePlay size={17} aria-hidden="true" />
              Voir la plateforme
            </MagneticButton>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {heroSignals.map((signal, index) => (
              <div key={signal} className="rounded-2xl border border-line bg-white/80 px-4 py-3 shadow-panel backdrop-blur">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted">Module {index + 1}</p>
                <p className="mt-1 text-sm font-black text-ink">{signal}</p>
              </div>
            ))}
          </div>
        </AnimatedReveal>

        <AnimatedReveal direction="left" delay={120}>
          <div className="hero-3d-stage relative min-h-[620px] rounded-[38px] border border-white/80 bg-white/60 p-4 shadow-stitch backdrop-blur" {...bind}>
            {fallback || reducedMotion ? (
              <HeroFallbackVisual animated={!reducedMotion} />
            ) : (
              <>
                <Hero3DScene mouse={mouseRef} onUnavailable={handleSceneUnavailable} />
                <div className="pointer-events-none absolute inset-0 rounded-[34px] bg-[radial-gradient(circle_at_center,rgba(109,54,232,0.12),transparent_48%)]" aria-hidden="true" />
                <svg className="hero-connection-map pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 800 620" aria-hidden="true">
                  <path d="M94 118 C230 145 265 280 398 308 C530 334 560 170 706 126" />
                  <path d="M110 485 C250 430 284 355 398 308 C520 260 585 410 688 505" />
                  <path d="M232 88 C270 190 318 256 398 308 C462 352 512 430 548 548" />
                </svg>
                <div className="hero-core-rings pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="hero-scan-plane pointer-events-none absolute inset-x-10 top-1/2 h-24 -translate-y-1/2" aria-hidden="true" />
                <div className="hero-orbit-chip hero-orbit-chip-one">CV</div>
                <div className="hero-orbit-chip hero-orbit-chip-two">Score</div>
                <div className="hero-orbit-chip hero-orbit-chip-three">RAG</div>
                <div className="hero-orbit-chip hero-orbit-chip-four">Offer</div>
                <div className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/80 text-center shadow-stitch backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">AI Match</p>
                  <p className="text-2xl font-black text-primary">87%</p>
                </div>
                <FloatingUiCard3D className="left-4 top-10 w-48" title="Profil etudiant" text="React, Node.js, PostgreSQL" style={cardStyle(-18, -10, 40)} />
                <FloatingUiCard3D className="bottom-24 left-8 w-44" title="CV analyse" text="Competences detectees" accent="cyan" style={cardStyle(-10, 16, 30)} />
                <FloatingUiCard3D className="right-5 top-14 w-48" title="Offre recommandee" text="Stage Fullstack IA" accent="ai" style={cardStyle(18, -12, 40)} />
                <FloatingUiCard3D className="bottom-14 right-10 w-48" title="Classement candidat" text="Decision humaine assistee" style={cardStyle(12, 18, 35)} />
                <div className="absolute bottom-6 left-1/2 hidden w-[84%] -translate-x-1/2 flex-wrap justify-center gap-2 rounded-2xl border border-line bg-white/90 px-4 py-3 shadow-stitch backdrop-blur md:flex">
                  {skillBadges.map((skill) => (
                    <span key={skill} className="landing-badge rounded-full border border-primary/15 bg-primarySoft px-3 py-1 text-xs font-black text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="absolute right-[18%] top-[35%] hidden w-28 rounded-[24px] border border-line bg-white/70 p-2 shadow-stitch backdrop-blur lg:block" style={cardStyle(8, -16, -20)}>
                  <LandingImage src={landingImages.mobileApp} alt="" className="aspect-[0.58] rounded-[18px]" />
                  <span className="absolute -left-3 top-4 grid h-8 w-8 place-items-center rounded-full bg-primary text-white shadow-panel">
                    <Smartphone className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </>
            )}
          </div>
        </AnimatedReveal>
      </div>
    </section>
  );
}

export default LandingHero3D;
