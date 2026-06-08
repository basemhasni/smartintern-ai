import { useEffect, useRef } from 'react';

function CvDeleteDialog({ cv, isDeleting, onCancel, onConfirm }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!cv) {
      return undefined;
    }

    confirmRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cv, isDeleting, onCancel]);

  if (!cv) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="delete-cv-title">
      <div className="w-full max-w-md rounded-stitch border border-line bg-white p-6 shadow-stitch">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-danger">Suppression</p>
        <h2 id="delete-cv-title" className="mt-2 text-2xl font-black text-ink">Supprimer ce CV ?</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Cette action retirera le fichier de votre espace. Elle ne peut pas etre annulee.
        </p>
        <p className="mt-4 rounded-lg bg-canvas px-4 py-3 text-sm font-black text-ink">{cv.fileName}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-panel"
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            ref={confirmRef}
            className="rounded-lg bg-danger px-5 py-3 text-sm font-black text-white shadow-panel disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? 'Suppression...' : 'Supprimer le CV'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CvDeleteDialog;
