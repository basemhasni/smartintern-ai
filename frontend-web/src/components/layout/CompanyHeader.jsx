import { Menu, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

function CompanyHeader({ title, user, company, onOpenMenu, onLogout }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-ink shadow-panel lg:hidden"
            type="button"
            aria-label="Ouvrir le menu entreprise"
            onClick={onOpenMenu}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Espace entreprise</p>
            <h1 className="truncate text-xl font-black text-ink md:text-2xl">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-black text-white shadow-panel md:inline-flex" to="/company/offers">
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Creer une offre
          </Link>
          <div className="hidden rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-ink shadow-panel sm:block">
            {company?.companyName || user?.firstName || 'Entreprise'}
          </div>
          <button
            className="hidden rounded-lg border border-line bg-white px-4 py-2 text-sm font-bold text-muted shadow-panel transition hover:text-danger md:block"
            type="button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default CompanyHeader;
