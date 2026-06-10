import { Search, SlidersHorizontal } from 'lucide-react';

function RankingFilters({ filters, resultsCount, onChange, onReset }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Exploration</p>
          <h2 className="mt-2 text-xl font-black text-ink">Filtrer les candidats</h2>
          <p className="mt-1 text-sm font-bold text-muted">{resultsCount} resultat(s)</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel" type="button" onClick={onReset}>
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Reinitialiser
        </button>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr]">
        <div className="relative">
          <label className="sr-only" htmlFor="ranking-query">Rechercher un candidat</label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="ranking-query"
            className="w-full rounded-lg border border-line bg-canvas py-3 pl-11 pr-4 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            value={filters.query}
            placeholder="Nom, email, objectif..."
            onChange={(event) => onChange('query', event.target.value)}
          />
        </div>
        <label className="sr-only" htmlFor="ranking-status">Statut</label>
        <select id="ranking-status" className="rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink" value={filters.status} onChange={(event) => onChange('status', event.target.value)}>
          <option value="ALL">Tous les statuts</option>
          <option value="SENT">Recues</option>
          <option value="PENDING">En examen</option>
          <option value="ACCEPTED">Acceptees</option>
          <option value="REJECTED">Refusees</option>
          <option value="CANCELLED">Annulees</option>
        </select>
        <label className="sr-only" htmlFor="ranking-score-mode">Disponibilite du score</label>
        <select id="ranking-score-mode" className="rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink" value={filters.scoreMode} onChange={(event) => onChange('scoreMode', event.target.value)}>
          <option value="ALL">Tous les candidats</option>
          <option value="WITH_SCORE">Avec score</option>
          <option value="WITHOUT_SCORE">Sans score</option>
        </select>
        <label className="sr-only" htmlFor="ranking-min-score">Score minimum</label>
        <select id="ranking-min-score" className="rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink" value={filters.minScore} onChange={(event) => onChange('minScore', event.target.value)}>
          <option value="0">Tous scores</option>
          <option value="50">50 % et plus</option>
          <option value="70">70 % et plus</option>
          <option value="80">80 % et plus</option>
        </select>
        <label className="sr-only" htmlFor="ranking-skill">Competence</label>
        <input
          id="ranking-skill"
          className="rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          value={filters.skill}
          placeholder="Competence"
          onChange={(event) => onChange('skill', event.target.value)}
        />
        <label className="sr-only" htmlFor="ranking-sort">Tri</label>
        <select id="ranking-sort" className="rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink" value={filters.sort} onChange={(event) => onChange('sort', event.target.value)}>
          <option value="rank">Classement IA</option>
          <option value="scoreDesc">Score decroissant</option>
          <option value="scoreAsc">Score croissant</option>
          <option value="date">Date de candidature</option>
          <option value="name">Nom A-Z</option>
        </select>
      </div>
    </section>
  );
}

export default RankingFilters;
