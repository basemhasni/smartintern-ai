import { ArrowRight, CirclePlay } from 'lucide-react';
import { Link } from 'react-router-dom';

import HeroCareerMap from './HeroCareerMap.jsx';

function HeroSection() {
  return (
    <section className="stitch-container grid min-h-[calc(100vh-68px)] gap-12 py-14 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:py-20">
      <div>
        <span className="inline-flex rounded-full border border-ai/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ai shadow-panel">
          AI-powered internship matching
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.04] tracking-tight text-ink md:text-6xl">
          Votre profil ne cherche plus au hasard.
          <span className="block text-primary">Il rencontre la bonne opportunite.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          SmartIntern AI analyse les competences, comprend les offres et transforme chaque candidature en decision eclairee,
          pour les etudiants comme pour les recruteurs.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-panel transition hover:bg-[#0b4fc4]" to="/register">
            Trouver mon stage
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className="inline-flex items-center justify-center rounded-lg border border-line bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-primary" to="/register">
            Recruter autrement
          </Link>
        </div>
        <a className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary" href="#fonctionnement">
          <CirclePlay size={18} aria-hidden="true" />
          Voir comment fonctionne le matching
        </a>
      </div>
      <HeroCareerMap />
    </section>
  );
}

export default HeroSection;
