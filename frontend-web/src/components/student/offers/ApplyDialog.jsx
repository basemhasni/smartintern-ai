import { useEffect, useRef, useState } from 'react';

function ApplyDialog({ offer, isSubmitting, error, onCancel, onConfirm }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!offer) return undefined;

    textareaRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, offer, onCancel]);

  if (!offer) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="apply-title">
      <div className="w-full max-w-lg rounded-stitch border border-line bg-white p-6 shadow-stitch">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Candidature</p>
        <h2 id="apply-title" className="mt-2 text-2xl font-black text-ink">Postuler a cette offre</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          {offer.title} chez {offer.company?.companyName || 'cette entreprise'}.
        </p>
        <label className="mt-5 block text-sm font-black text-ink" htmlFor="application-message">
          Message optionnel
        </label>
        <textarea
          ref={textareaRef}
          id="application-message"
          className="mt-2 min-h-32 w-full resize-y rounded-lg border border-line px-4 py-3 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          maxLength={500}
          value={message}
          disabled={isSubmitting}
          onChange={(event) => setMessage(event.target.value)}
        />
        <p className="mt-2 text-xs font-bold text-muted">{message.length}/500 caracteres</p>
        {error ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-danger" aria-live="polite">{error}</p> : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-panel" type="button" disabled={isSubmitting} onClick={onCancel}>
            Annuler
          </button>
          <button className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={isSubmitting} onClick={() => onConfirm(message.trim() ? { message: message.trim() } : {})}>
            {isSubmitting ? 'Envoi...' : 'Envoyer ma candidature'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplyDialog;
