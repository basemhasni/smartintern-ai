function SelectField({ label, value, onChange, children }) {
  return (
    <label className="text-sm font-black text-ink">
      {label}
      <select
        className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

function OffersFilters({ filters, locations, durations, onChange, onReset }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <SelectField label="Affichage" value={filters.view} onChange={(value) => onChange('view', value)}>
          <option value="all">Toutes</option>
          <option value="recommended">Recommandees</option>
        </SelectField>
        <SelectField label="Localisation" value={filters.location} onChange={(value) => onChange('location', value)}>
          <option value="">Toutes</option>
          {locations.map((location) => <option key={location} value={location}>{location}</option>)}
        </SelectField>
        <SelectField label="Duree" value={filters.duration} onChange={(value) => onChange('duration', value)}>
          <option value="">Toutes</option>
          {durations.map((duration) => <option key={duration} value={duration}>{duration}</option>)}
        </SelectField>
        <SelectField label="Score minimum" value={filters.minScore} onChange={(value) => onChange('minScore', value)}>
          <option value="0">Tous</option>
          <option value="50">50% et plus</option>
          <option value="70">70% et plus</option>
          <option value="80">80% et plus</option>
        </SelectField>
        <SelectField label="Tri" value={filters.sort} onChange={(value) => onChange('sort', value)}>
          <option value="score">Meilleure compatibilite</option>
          <option value="recent">Plus recentes</option>
          <option value="title">Titre A-Z</option>
        </SelectField>
        <button className="rounded-lg border border-line bg-canvas px-4 py-3 text-sm font-black text-ink transition hover:bg-white" type="button" onClick={onReset}>
          Reinitialiser
        </button>
      </div>
    </section>
  );
}

export default OffersFilters;
