import { useEffect } from 'react';

const contentByStatus = {
  VALIDATED: {
    title: 'Valider cette entreprise ?',
    text: 'L entreprise sera reconnue comme validee sur SmartIntern AI.',
    action: 'Valider',
  },
  REJECTED: {
    title: 'Refuser la validation ?',
    text: 'L entreprise verra son statut marque comme refuse.',
    action: 'Refuser',
  },
  SUSPENDED: {
    title: 'Suspendre cette entreprise ?',
    text: 'Certaines fonctionnalites de recrutement pourront etre limitees.',
    action: 'Suspendre',
  },
  PENDING: {
    title: 'Remettre en attente ?',
    text: 'L entreprise reviendra dans les demandes a traiter.',
    action: 'Remettre en attente',
  },
};

function CompanyValidationDialog({ company, status, isUpdating, error, onCancel, onConfirm }) {
  useEffect(() => {
    if (!company) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [company, onCancel]);

  if (!company || !status) return null;

  const content = contentByStatus[status] || contentByStatus.PENDING;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="company-status-dialog-title">
      <section className="w-full max-w-lg rounded-stitch border border-line bg-white p-6 shadow-stitch">
        <h2 id="company-status-dialog-title" className="text-xl font-black text-ink">{content.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{content.text}</p>
        <div className="mt-4 rounded-lg bg-canvas p-4">
          <p className="font-black text-ink">{company.companyName}</p>
          <p className="mt-1 text-sm font-bold text-muted">{company.user.email || 'Email non renseigne'}</p>
          <p className="mt-1 text-xs font-black text-primary">{company.statusLabel}</p>
        </div>
        {error ? <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-danger" aria-live="polite">{error}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink" type="button" disabled={isUpdating} onClick={onCancel}>Annuler</button>
          <button className="rounded-lg bg-primary px-4 py-3 text-sm font-black text-white" type="button" disabled={isUpdating} onClick={() => onConfirm(status)}>
            {isUpdating ? 'Mise a jour...' : content.action}
          </button>
        </div>
      </section>
    </div>
  );
}

export default CompanyValidationDialog;
