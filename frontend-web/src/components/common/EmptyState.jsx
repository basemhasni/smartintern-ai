function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="rounded-stitch border border-dashed border-line bg-canvas/70 p-5 text-center">
      {Icon ? (
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white text-primary shadow-panel">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="mt-3 text-sm font-black text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
