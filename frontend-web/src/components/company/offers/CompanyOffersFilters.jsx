import { Search } from 'lucide-react';

function CompanyOffersFilters({ filters, locations, durations, resultsCount, onChange, onReset }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px_150px_150px_auto] lg:items-end">
        <div>
          <label className="text-sm font-black text-ink" htmlFor="offer-search">Recherche</label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="offer-search"
              className="w-full rounded-lg border border-line bg-canvas py-3 pl-11 pr-4 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={filters.query}
              placeholder="Titre, description, competence..."
              onChange={(event) => onChange('query', event.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-black text-ink" htmlFor="offer-status">Statut</label>
          <select id="offer-status" className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink" value={filters.status} onChange={(event) => onChange('status', event.target.value)}>
            <option value="ALL">Toutes</option>
            <option value="DRAFT">Brouillons</option>
            <option value="PUBLISHED">Publiees</option>
            <option value="CLOSED">Fermees</option>
            <option value="ARCHIVED">Archivees</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-black text-ink" htmlFor="offer-location">Localisation</label>
          <select id="offer-location" className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink" value={filters.location} onChange={(event) => onChange('location', event.target.value)}>
            <option value="">Toutes</option>
            {locations.map((location) => <option key={location} value={location}>{location}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-black text-ink" htmlFor="offer-duration">Duree</label>
          <select id="offer-duration" className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink" value={filters.duration} onChange={(event) => onChange('duration', event.target.value)}>
            <option value="">Toutes</option>
            {durations.map((duration) => <option key={duration} value={duration}>{duration}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-black text-ink" htmlFor="offer-sort">Tri</label>
          <select id="offer-sort" className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink" value={filters.sort} onChange={(event) => onChange('sort', event.target.value)}>
            <option value="recent">Plus recentes</option>
            <option value="oldest">Plus anciennes</option>
            <option value="title">Titre A-Z</option>
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

export default CompanyOffersFilters;
