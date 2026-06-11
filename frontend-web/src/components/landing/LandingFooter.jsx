import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { navLinks } from '../../data/landingData.js';

function LandingFooter() {
  return (
    <footer className="border-t border-line bg-white py-10">
      <div className="stitch-container grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-white shadow-panel">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-black text-primary">SmartIntern AI</span>
              <span className="text-xs font-bold text-muted">Projet PFE - AI Internship Matching</span>
            </span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted">
            Plateforme intelligente de gestion de stages, de matching IA et de suivi des candidatures pour etudiants, entreprises et administrateurs.
          </p>
        </div>
        <nav className="grid gap-3 sm:grid-cols-2" aria-label="Liens footer">
          {navLinks.map((link) => (
            <a key={link.href} className="text-sm font-bold text-muted transition hover:text-primary" href={link.href}>{link.label}</a>
          ))}
          <Link className="text-sm font-bold text-muted transition hover:text-primary" to="/login">Connexion</Link>
          <Link className="text-sm font-bold text-muted transition hover:text-primary" to="/register">Inscription</Link>
        </nav>
      </div>
      <div className="stitch-container mt-8 border-t border-line pt-5 text-xs font-bold text-muted">
        Copyright 2026 SmartIntern AI. Tous droits reserves.
      </div>
    </footer>
  );
}

export default LandingFooter;
