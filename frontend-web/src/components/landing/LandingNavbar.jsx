import { Menu, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const links = [
  ['Fonctionnement', '#fonctionnement'],
  ['Etudiants', '#parcours'],
  ['Entreprises', '#parcours'],
  ['Intelligence artificielle', '#ia'],
];

function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/88 backdrop-blur-xl">
      <nav className="stitch-container flex min-h-16 items-center justify-between gap-4" aria-label="Navigation principale">
        <Link to="/" className="flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-panel">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-bold leading-4 text-primary">SmartIntern AI</span>
            <span className="block text-[10px] font-medium text-ink">AI-powered Career Hub</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map(([label, href]) => (
            <a key={href} className="text-sm font-semibold text-muted transition hover:text-ink" href={href}>
              {label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-primary" to="/login">
            Se connecter
          </Link>
          <Link className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-panel transition hover:bg-[#0b4fc4]" to="/register">
            Commencer
          </Link>
        </div>

        <button
          className="inline-flex rounded-lg border border-line bg-white p-2 text-ink md:hidden"
          type="button"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {open ? (
        <div className="border-t border-line bg-white md:hidden">
          <div className="stitch-container grid gap-2 py-4">
            {links.map(([label, href]) => (
              <a key={href} className="rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-canvas" href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
            <Link className="rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-white" to="/register">
              Commencer
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default LandingNavbar;
