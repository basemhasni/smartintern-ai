import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function FinalCTA() {
  return (
    <section className="stitch-container py-20">
      <div className="overflow-hidden rounded-[28px] border border-line bg-white shadow-stitch">
        <div className="grid gap-8 p-8 md:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-ai">Pret a commencer</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-ink md:text-5xl">
              Le bon stage ne devrait pas dependre d’un mot-cle oublie.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
              Creez votre profil, importez votre CV et decouvrez des opportunites qui comprennent reellement votre parcours.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-panel" to="/register">
              Creer mon profil etudiant
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="inline-flex items-center justify-center rounded-lg border border-line bg-canvas px-5 py-3 text-sm font-bold text-ink" to="/register">
              Publier une offre
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
