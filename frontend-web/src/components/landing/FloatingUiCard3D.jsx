function FloatingUiCard3D({ title, text, accent = 'primary', style, className = '' }) {
  const tones = {
    primary: 'border-primary/20 bg-primarySoft text-primary',
    ai: 'border-ai/20 bg-aiSoft text-ai',
    cyan: 'border-cyan-100 bg-cyanSoft text-cyan-700',
  };

  return (
    <div className={`absolute ${className}`} style={style}>
      <div className="hero-ui-card hero-card-drift rounded-2xl border border-white/70 bg-white/90 p-4 shadow-stitch backdrop-blur">
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em] ${tones[accent] || tones.primary}`}>
          {title}
        </span>
        <p className="mt-3 text-sm font-black leading-5 text-ink">{text}</p>
      </div>
    </div>
  );
}

export default FloatingUiCard3D;
