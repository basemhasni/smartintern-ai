function OfferFormSection({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-black text-ink">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-muted">{description}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export default OfferFormSection;
