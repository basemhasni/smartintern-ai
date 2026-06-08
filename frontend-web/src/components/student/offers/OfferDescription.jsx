function OfferDescription({ description }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Description</p>
      <h2 className="mt-2 text-xl font-black text-ink">Mission proposee</h2>
      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">
        {description || 'Aucune description detaillee n’est disponible pour cette offre.'}
      </p>
    </section>
  );
}

export default OfferDescription;
