function SectionHeading({ eyebrow, title, children, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ai">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">{title}</h2>
      {children ? <p className="mt-4 text-base leading-7 text-muted">{children}</p> : null}
    </div>
  );
}

export default SectionHeading;
