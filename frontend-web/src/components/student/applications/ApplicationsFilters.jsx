import { Search } from 'lucide-react';

import { getApplicationStatusLabel } from '../../../utils/formatters.js';
import { applicationStatuses } from '../../../utils/applications.js';

function ApplicationsFilters({ filters, resultCount, totalCount, onChange, onReset }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="grid gap-4 lg:grid-cols-[1fr_190px_190px_auto] lg:items-end">
        <div className="relative">
          <label className="text-sm font-black text-ink" htmlFor="applications-search">Recherche</label>
          <Search className="pointer-events-none absolute bottom-3.5 left-4 h-5 w-5 text-muted" aria-hidden="true" />
          <input
            id="applications-search"
            className="mt-2 w-full rounded-lg border border-line bg-white py-3 pl-12 pr-4 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            type="search"
            value={filters.query}
            placeholder="Offre, entreprise, localisation..."
            onChange={(event) => onChange('query', event.target.value)}
          />
        </div>
        <label className="text-sm font-black text-ink">
          Statut
          <select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" value={filters.status} onChange={(event) => onChange('status', event.target.value)}>
            <option value="ALL">Toutes</option>
            {applicationStatuses.map((status) => <option key={status} value={status}>{getApplicationStatusLabel(status)}</option>)}
          </select>
        </label>
        <label className="text-sm font-black text-ink">
          Tri
          <select className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" value={filters.sort} onChange={(event) => onChange('sort', event.target.value)}>
            <option value="recent">Plus recentes</option>
            <option value="oldest">Plus anciennes</option>
            <option value="score">Meilleur score</option>
            <option value="company">Entreprise A-Z</option>
          </select>
        </label>
        <button className="rounded-lg border border-line bg-canvas px-4 py-3 text-sm font-black text-ink transition hover:bg-white" type="button" onClick={onReset}>
          Reinitialiser
        </button>
      </div>
      <p className="mt-4 text-sm font-bold text-muted">{resultCount} resultat(s) sur {totalCount}</p>
    </section>
  );
}

export default ApplicationsFilters;
