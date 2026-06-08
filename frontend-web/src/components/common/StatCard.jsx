function StatCard({ icon: Icon, title, value, description, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primarySoft text-primary',
    ai: 'bg-aiSoft text-ai',
    cyan: 'bg-cyanSoft text-cyan-700',
    warning: 'bg-amber-50 text-amber-700',
  };

  return (
    <article className="relative overflow-hidden rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-bl-[44px] bg-canvas" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">{title}</p>
          <p className="mt-4 text-2xl font-black text-ink">{value}</p>
          {description ? <p className="mt-1 text-sm leading-6 text-muted">{description}</p> : null}
        </div>
        {Icon ? (
          <span className={`grid h-9 w-9 place-items-center rounded-full ${tones[tone] || tones.primary}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </article>
  );
}

export default StatCard;
