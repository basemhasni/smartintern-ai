function AiSectionCard({ eyebrow = 'SmartIntern AI', title, description, action, children, className = '' }) {
  return (
    <section className={`rounded-stitch border border-line bg-white p-5 shadow-panel sm:p-6 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-ai">{eyebrow}</p>
          <h2 className="mt-2 text-xl font-black text-ink">{title}</h2>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default AiSectionCard;
