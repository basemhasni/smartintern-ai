function ErrorState({ title = 'Section indisponible', message = 'Impossible de charger cette section. Verifiez que le backend est demarre.', onRetry }) {
  return (
    <div className="rounded-stitch border border-red-100 bg-red-50 p-5" role="alert" aria-live="polite">
      <h3 className="text-sm font-black text-danger">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-red-700">{message}</p>
      {onRetry ? (
        <button
          className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-black text-danger shadow-panel transition hover:-translate-y-0.5"
          type="button"
          onClick={onRetry}
        >
          Reessayer
        </button>
      ) : null}
    </div>
  );
}

export default ErrorState;
