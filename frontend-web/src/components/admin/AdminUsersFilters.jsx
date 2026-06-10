import { Search, SlidersHorizontal } from 'lucide-react';

function AdminUsersFilters({ filters, onChange, onReset }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Gestion utilisateurs</p>
          <h2 className="mt-2 text-xl font-black text-ink">Rechercher et filtrer</h2>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" type="button" onClick={onReset}>
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Reinitialiser
        </button>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="relative">
          <label className="sr-only" htmlFor="admin-user-search">Rechercher un utilisateur</label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="admin-user-search"
            className="w-full rounded-lg border border-line bg-canvas py-3 pl-11 pr-4 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            value={filters.search}
            placeholder="Nom, prenom ou email"
            onChange={(event) => onChange('search', event.target.value)}
          />
        </div>
        <label className="sr-only" htmlFor="admin-user-role">Role</label>
        <select id="admin-user-role" className="rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink" value={filters.role} onChange={(event) => onChange('role', event.target.value)}>
          <option value="">Tous les roles</option>
          <option value="STUDENT">Etudiants</option>
          <option value="COMPANY">Entreprises</option>
          <option value="ADMIN">Administrateurs</option>
        </select>
        <label className="sr-only" htmlFor="admin-user-active">Statut compte</label>
        <select id="admin-user-active" className="rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink" value={filters.isActive} onChange={(event) => onChange('isActive', event.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Desactives</option>
        </select>
      </div>
    </section>
  );
}

export default AdminUsersFilters;
