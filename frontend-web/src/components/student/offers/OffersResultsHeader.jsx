function OffersResultsHeader({ count, total }) {
  return (
    <div id="offers-results" className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Resultats</p>
        <h2 className="text-xl font-black text-ink">{count} offre(s) affichee(s)</h2>
      </div>
      <p className="text-sm font-bold text-muted">{total} offre(s) disponible(s) avant filtres</p>
    </div>
  );
}

export default OffersResultsHeader;
