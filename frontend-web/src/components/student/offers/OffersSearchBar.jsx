import { Search } from 'lucide-react';

function OffersSearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor="offers-search">Rechercher une offre</label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        id="offers-search"
        className="w-full rounded-stitch border border-line bg-white py-4 pl-12 pr-4 text-sm font-bold text-ink shadow-panel outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        type="search"
        value={value}
        placeholder="Rechercher par titre, entreprise, competence ou localisation"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default OffersSearchBar;
