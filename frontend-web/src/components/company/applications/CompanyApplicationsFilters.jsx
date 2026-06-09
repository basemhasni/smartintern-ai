import { Search } from 'lucide-react';

function CompanyApplicationsFilters({ filters, resultsCount, onChange, onReset }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="grid gap-3 lg:grid-cols-[1fr_170px_150px_160px_auto] lg:items-end">
        <div>
          <label className="text-sm font-black text-ink" htmlFor="application-search">Recherche</label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="application-search"
              className="w-full rounded-lg border border-line bg-canvas py-3 pl-11 pr-4 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={filters.query}
              placeholder="Nom, email, competence..."
              onChange={(event) => onChange('query', event.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-black text-ink" htmlFor="application-status-filter">Statut</label>
          <select id="application-status-filter" className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink" value={filters.status} onChange={(event) => onChange('status', event.target.value)}>
            <option value="ALL">Tous</option>
            <option value="SENT">Recues</option>
            <option value="PENDING">En cours</option>
            <option value="ACCEPTED">Acceptees</option>
            <option value="REJECTED">Refusees</option>
            <option value="CANCELLED">Annulees</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-black text-ink" htmlFor="application-score-filter">Score</label>
          <select id="application-score-filter" className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink" value={filters.minScore} onChange={(event) => onChange('minScore', event.target.value)}>
            <option value="0">Tous</option>
            <option value="50">50 % et plus</option>
            <option value="70">70 % et plus</option>
            <option value="80">80 % et plus</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-black text-ink" htmlFor="application-sort">Tri</label>
          <select id="application-sort" className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink" value={filters.sort} onChange={(event) => onChange('sort', event.target.value)}>
            <option value="recent">Plus recentes</option>
            <option value="oldest">Plus anciennes</option>
            <option value="score">Meilleur score</option>
            <option value="name">Nom A-Z</option>
            <option value="status">Statut</option>
          </select>
        </div>
        <button className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" type="button" onClick={onReset}>
          Reinitialiser
        </button>
      </div>
      <p className="mt-4 text-sm font-bold text-muted">{resultsCount} resultat(s)</p>
    </section>
  );
}

export default CompanyApplicationsFilters;
