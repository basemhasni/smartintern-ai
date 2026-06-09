import { useEffect, useState } from 'react';

import { applicationStatusLabels } from '../../../utils/companyDashboard.js';
import { getAvailableNextStatuses } from '../../../utils/companyApplications.js';
import CompanyStatusCard from '../CompanyStatusCard.jsx';

function UpdateApplicationStatusDialog({ application, isUpdating, error, onCancel, onConfirm }) {
  const [nextStatus, setNextStatus] = useState('');

  useEffect(() => {
    if (application) {
      setNextStatus(getAvailableNextStatuses(application.status)[0] || '');
    }
  }, [application]);

  useEffect(() => {
    if (!application) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [application, onCancel]);

  if (!application) {
    return null;
  }

  const isDecision = nextStatus === 'ACCEPTED' || nextStatus === 'REJECTED';
  const title = nextStatus === 'ACCEPTED'
    ? 'Accepter cette candidature ?'
    : nextStatus === 'REJECTED'
      ? 'Refuser cette candidature ?'
      : 'Mettre a jour le statut';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="status-dialog-title">
      <section className="w-full max-w-lg rounded-stitch border border-line bg-white p-6 shadow-stitch">
        <h2 id="status-dialog-title" className="text-xl font-black text-ink">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          {isDecision ? 'Le candidat verra sa candidature marquee avec cette decision.' : 'Le backend accepte les statuts Prisma autorises pour les candidatures.'}
        </p>
        <div className="mt-4 rounded-lg bg-canvas p-4">
          <p className="font-black text-ink">{application.student.firstName} {application.student.lastName}</p>
          <p className="mt-1 text-sm font-bold text-muted">{application.offer.title}</p>
          <div className="mt-3">
            <CompanyStatusCard status={application.status} label={application.statusLabel} />
          </div>
        </div>
        <label className="mt-5 block text-sm font-black text-ink" htmlFor="next-application-status">Nouveau statut</label>
        <select
          id="next-application-status"
          className="mt-2 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm font-bold text-ink"
          value={nextStatus}
          onChange={(event) => setNextStatus(event.target.value)}
        >
          {getAvailableNextStatuses(application.status).map((status) => (
            <option key={status} value={status}>{applicationStatusLabels[status] || status}</option>
          ))}
        </select>
        {error ? <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-danger" aria-live="polite">{error}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink" type="button" disabled={isUpdating} onClick={onCancel}>Annuler</button>
          <button className="rounded-lg bg-primary px-4 py-3 text-sm font-black text-white" type="button" disabled={isUpdating || !nextStatus} onClick={() => onConfirm(nextStatus)}>
            {isUpdating ? 'Mise a jour...' : 'Mettre a jour le statut'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default UpdateApplicationStatusDialog;
