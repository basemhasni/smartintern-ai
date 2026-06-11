function FloatingVisualCard({ label, value, className = '' }) {
  return (
    <div className={`landing-float rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-stitch backdrop-blur ${className}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-black text-ink">{value}</p>
    </div>
  );
}

export default FloatingVisualCard;
