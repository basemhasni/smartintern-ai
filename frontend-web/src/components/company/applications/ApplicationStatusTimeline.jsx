import { formatDate } from '../../../utils/formatters.js';

function ApplicationStatusTimeline({ application }) {
  const steps = [
    { key: 'SENT', label: 'Candidature recue' },
    { key: 'PENDING', label: 'En cours d examen' },
    { key: 'DECISION', label: 'Decision' },
  ];
  const decisionReached = ['ACCEPTED', 'REJECTED', 'CANCELLED'].includes(application.status);

  return (
    <section className="rounded-stitch border border-line bg-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Etat synthetique</p>
      <div className="mt-4 space-y-3">
        {steps.map((step, index) => {
          const isActive = application.status === step.key || (step.key === 'DECISION' && decisionReached);
          const isDone = index === 0 || (index === 1 && (application.status === 'PENDING' || decisionReached));
          return (
            <div key={step.key} className="flex gap-3">
              <span className={`mt-0.5 h-3 w-3 rounded-full ${isActive || isDone ? 'bg-primary' : 'bg-line'}`} aria-hidden="true" />
              <div>
                <p className="text-sm font-black text-ink">{step.label}</p>
                {index === 0 ? <p className="text-xs font-bold text-muted">{formatDate(application.appliedAt)}</p> : null}
                {step.key === 'DECISION' && decisionReached ? <p className="text-xs font-bold text-muted">Derniere mise a jour : {formatDate(application.updatedAt)}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs font-bold text-muted">Representation du statut actuel, pas un historique complet.</p>
    </section>
  );
}

export default ApplicationStatusTimeline;
