function ScoreBadge({ score, size = 'md', label = 'match' }) {
  const value = Number.isFinite(Number(score)) ? Math.round(Number(score)) : null;
  const ringSize = size === 'lg' ? 'h-28 w-28 text-3xl' : 'h-16 w-16 text-lg';
  const innerSize = size === 'lg' ? 'h-[86px] w-[86px]' : 'h-12 w-12';
  const ringStyle = {
    background: `conic-gradient(from 18deg, #6d36e8 0 ${value || 0}%, #e9edff ${value || 0}% 100%)`,
  };

  return (
    <div className={`grid shrink-0 place-items-center rounded-full ${ringSize}`} style={ringStyle} aria-label={value === null ? 'Score indisponible' : `Score ${value} pour cent`}>
      <div className={`grid place-items-center rounded-full bg-white text-center shadow-panel ${innerSize}`}>
        <span className="font-black text-ink">{value === null ? '—' : `${value}%`}</span>
        <span className="text-[9px] font-black uppercase tracking-[0.12em] text-muted">{label}</span>
      </div>
    </div>
  );
}

export default ScoreBadge;
