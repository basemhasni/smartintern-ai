import { Menu, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { navLinks } from '../../data/landingData.js';

function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition ${scrolled ? 'border-b border-line/80 bg-white/90 shadow-panel backdrop-blur-xl' : 'bg-transparent'}`}>
      <nav className="stitch-container flex min-h-20 items-center justify-between gap-4" aria-label="Navigation principale">
        <Link to="/" className="flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-white shadow-panel">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-black leading-4 text-primary">SmartIntern AI</span>
            <span className="block text-[11px] font-bold text-muted">AI Internship Matching</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} className="text-sm font-bold text-muted transition hover:text-ink" href={link.href}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-black text-ink shadow-panel transition hover:border-primary" to="/login">
            Connexion
          </Link>
          <Link className="rounded-full bg-primary px-5 py-2.5 text-sm font-black text-white shadow-panel transition hover:bg-[#0b4fc4]" to="/register">
            Creer un compte
          </Link>
        </div>

        <button
          className="inline-grid h-11 w-11 place-items-center rounded-xl border border-line bg-white text-ink shadow-panel lg:hidden"
          type="button"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-line bg-white lg:hidden">
          <div className="stitch-container grid gap-2 py-4">
            {navLinks.map((link) => (
              <a key={link.href} className="rounded-lg px-3 py-3 text-sm font-bold text-muted hover:bg-canvas" href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="grid gap-2 pt-2 sm:grid-cols-2">
              <Link className="rounded-lg border border-line px-3 py-3 text-center text-sm font-black text-ink" to="/login" onClick={() => setOpen(false)}>
                Connexion
              </Link>
              <Link className="rounded-lg bg-primary px-3 py-3 text-center text-sm font-black text-white" to="/register" onClick={() => setOpen(false)}>
                Creer un compte
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default LandingNavbar;
