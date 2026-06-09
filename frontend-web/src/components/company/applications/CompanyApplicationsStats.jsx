import { CheckCircle2, FileStack, Hourglass, XCircle } from 'lucide-react';

import StatCard from '../../common/StatCard.jsx';

function CompanyApplicationsStats({ counts }) {
  return (
    <section>
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-muted">Resume pour l offre selectionnee</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileStack} title="Total" value={counts.total} description="Candidatures de cette offre." />
        <StatCard icon={Hourglass} title="A examiner" value={(counts.SENT || 0) + (counts.PENDING || 0)} description="Recues ou en cours." tone="warning" />
        <StatCard icon={CheckCircle2} title="Acceptees" value={counts.ACCEPTED || 0} description="Decision positive." tone="ai" />
        <StatCard icon={XCircle} title="Refusees" value={counts.REJECTED || 0} description="Decision negative." tone="cyan" />
      </div>
    </section>
  );
}

export default CompanyApplicationsStats;
