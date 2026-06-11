import AnimatedReveal from './AnimatedReveal.jsx';

function LandingSection({ id, eyebrow, title, subtitle, children, className = '', innerClassName = '' }) {
  return (
    <section id={id} className={`landing-section-kinetic relative overflow-hidden py-20 md:py-28 ${className}`}>
      <div className={`stitch-container ${innerClassName}`}>
        {(eyebrow || title || subtitle) ? (
          <AnimatedReveal className="mx-auto max-w-3xl text-center">
            {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{eyebrow}</p> : null}
            {title ? <h2 className="mt-3 text-3xl font-black tracking-tight text-ink md:text-5xl">{title}</h2> : null}
            {subtitle ? <p className="mt-4 text-base leading-8 text-muted md:text-lg">{subtitle}</p> : null}
          </AnimatedReveal>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export default LandingSection;
