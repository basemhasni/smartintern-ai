import { ArrowRight, CirclePlay, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { heroSignals, landingImages, skillBadges } from '../../data/landingData.js';
import AnimatedReveal from './AnimatedReveal.jsx';
import FloatingVisualCard from './FloatingVisualCard.jsx';
import LandingImage from './LandingImage.jsx';

function LandingHero() {
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-10 md:pb-28 md:pt-16">
      <div className="absolute inset-0 -z-20 bg-white" />
      <img className="absolute inset-x-0 top-0 -z-10 h-full w-full object-cover opacity-20" src={landingImages.background} alt="" aria-hidden="true" />
      <div className="absolute left-1/2 top-24 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="stitch-container grid gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
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
            <Link className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-black text-white shadow-panel transition hover:-translate-y-0.5 hover:bg-[#0b4fc4]" to="/register">
              Commencer maintenant
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-black text-ink shadow-panel transition hover:-translate-y-0.5 hover:border-primary" href="#features">
              <CirclePlay size={17} aria-hidden="true" />
              Decouvrir la plateforme
            </a>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {heroSignals.map((signal, index) => (
              <div key={signal} className="rounded-2xl border border-line bg-white/80 px-4 py-3 shadow-panel backdrop-blur">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted">Signal {index + 1}</p>
                <p className="mt-1 text-sm font-black text-ink">{signal}</p>
              </div>
            ))}
          </div>
        </AnimatedReveal>

        <AnimatedReveal direction="left" delay={120} className="relative">
          <div className="landing-hero-visual relative rounded-[32px] border border-white/80 bg-white/70 p-3 shadow-stitch backdrop-blur">
            <LandingImage
              src={landingImages.hero}
              alt="Carte visuelle du signal de carriere reliant CV, IA et offres recommandees"
              priority
              className="aspect-[1.08] rounded-[26px]"
              imgClassName="object-cover"
            />
            <FloatingVisualCard className="absolute left-4 top-5 hidden md:block" label="Score exemple" value="87 % compatible" />
            <FloatingVisualCard className="absolute bottom-6 right-5 hidden md:block" label="Decision" value="Matching explicable" />
            <div className="absolute -bottom-5 left-1/2 hidden w-[88%] -translate-x-1/2 flex-wrap justify-center gap-2 rounded-2xl border border-line bg-white/90 px-4 py-3 shadow-stitch backdrop-blur md:flex">
              {skillBadges.map((skill) => (
                <span key={skill} className="landing-badge rounded-full border border-primary/15 bg-primarySoft px-3 py-1 text-xs font-black text-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </AnimatedReveal>
      </div>
    </section>
  );
}

export default LandingHero;
