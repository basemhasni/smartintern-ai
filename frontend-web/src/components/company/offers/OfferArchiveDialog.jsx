import { useEffect } from 'react';

function OfferArchiveDialog({ offer, isArchiving, onCancel, onConfirm }) {
  useEffect(() => {
    if (!offer) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [offer, onCancel]);

  if (!offer) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="archive-offer-title">
      <section className="w-full max-w-md rounded-stitch border border-line bg-white p-6 shadow-stitch">
        <h2 id="archive-offer-title" className="text-xl font-black text-ink">Archiver cette offre ?</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          L offre ne sera plus active, mais restera disponible dans votre historique. Cette action correspond au comportement reel du backend.
        </p>
        <p className="mt-4 rounded-lg bg-canvas px-4 py-3 text-sm font-black text-ink">{offer.title}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink" type="button" disabled={isArchiving} onClick={onCancel}>Annuler</button>
          <button className="rounded-lg bg-danger px-4 py-3 text-sm font-black text-white" type="button" disabled={isArchiving} onClick={onConfirm}>
            {isArchiving ? 'Archivage...' : 'Archiver l offre'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default OfferArchiveDialog;
