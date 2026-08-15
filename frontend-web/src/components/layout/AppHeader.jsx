import { Menu } from 'lucide-react';

function AppHeader({ firstName, title, onOpenMenu, onLogout }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-ink shadow-panel lg:hidden"
            type="button"
            aria-label="Ouvrir le menu etudiant"
            onClick={onOpenMenu}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Espace etudiant</p>
            <h1 className="truncate text-xl font-black text-ink md:text-2xl">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-ink shadow-panel sm:block">
            {firstName || 'Etudiant'}
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

export default AppHeader;
