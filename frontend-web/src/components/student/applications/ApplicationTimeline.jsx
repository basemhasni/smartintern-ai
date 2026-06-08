import { CheckCircle2, Circle, Clock3 } from 'lucide-react';

import { formatDate } from '../../../utils/formatters.js';

function getSteps(application) {
  const steps = [
    {
      label: 'Candidature envoyee',
      description: application.appliedAt ? formatDate(application.appliedAt) : 'Date non renseignee',
      active: ['SENT', 'PENDING', 'ACCEPTED', 'REJECTED'].includes(application.status),
      done: ['PENDING', 'ACCEPTED', 'REJECTED'].includes(application.status),
    },
    {
      label: 'En cours d’examen',
      description: application.status === 'PENDING' ? 'Statut actuel' : 'Etape suivante possible',
      active: application.status === 'PENDING',
      done: ['ACCEPTED', 'REJECTED'].includes(application.status),
    },
    {
      label: application.status === 'ACCEPTED' ? 'Decision positive' : application.status === 'REJECTED' ? 'Decision negative' : 'Decision',
      description: ['ACCEPTED', 'REJECTED'].includes(application.status) && application.updatedAt ? formatDate(application.updatedAt) : 'A venir',
      active: ['ACCEPTED', 'REJECTED'].includes(application.status),
      done: ['ACCEPTED', 'REJECTED'].includes(application.status),
    },
  ];

  if (application.status === 'CANCELLED') {
    return [{
      label: 'Candidature annulee',
      description: application.updatedAt ? formatDate(application.updatedAt) : 'Statut actuel',
      active: true,
      done: true,
    }];
  }

  return steps;
}

function ApplicationTimeline({ application }) {
  const steps = getSteps(application);

  return (
    <div className="space-y-3">
      {steps.map((step) => {
        const Icon = step.done ? CheckCircle2 : step.active ? Clock3 : Circle;

        return (
          <div key={step.label} className="flex gap-3">
            <Icon className={`mt-0.5 h-5 w-5 ${step.active || step.done ? 'text-primary' : 'text-muted'}`} aria-hidden="true" />
            <div>
              <p className="text-sm font-black text-ink">{step.label}</p>
              <p className="text-xs font-bold text-muted">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ApplicationTimeline;
