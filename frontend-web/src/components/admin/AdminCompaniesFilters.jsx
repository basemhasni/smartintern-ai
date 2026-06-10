import { Search, SlidersHorizontal } from 'lucide-react';

function AdminCompaniesFilters({ filters, onChange, onReset }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Validation entreprise</p>
          <h2 className="mt-2 text-xl font-black text-ink">Rechercher et filtrer</h2>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" type="button" onClick={onReset}>
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Reinitialiser
        </button>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <div className="relative">
          <label className="sr-only" htmlFor="admin-company-search">Rechercher une entreprise</label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="admin-company-search"
            className="w-full rounded-lg border border-line bg-canvas py-3 pl-11 pr-4 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            value={filters.search}
            placeholder="Entreprise, secteur, recruteur..."
            onChange={(event) => onChange('search', event.target.value)}
          />
        </div>
        <label className="sr-only" htmlFor="admin-company-status">Statut entreprise</label>
        <select id="admin-company-status" className="rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink" value={filters.status} onChange={(event) => onChange('status', event.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="VALIDATED">Validees</option>
          <option value="REJECTED">Refusees</option>
          <option value="SUSPENDED">Suspendues</option>
        </select>
      </div>
    </section>
  );
}

export default AdminCompaniesFilters;
