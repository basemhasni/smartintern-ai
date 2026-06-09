import { Archive, BriefcaseBusiness, CheckCircle2, FileText } from 'lucide-react';

import StatCard from '../../common/StatCard.jsx';

function CompanyOffersStats({ counts }) {
  const archivedOrClosed = (counts.ARCHIVED || 0) + (counts.CLOSED || 0);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={BriefcaseBusiness} title="Total des offres" value={counts.total} description="Offres creees dans votre espace." />
      <StatCard icon={CheckCircle2} title="Publiees" value={counts.PUBLISHED} description="Visibles par les etudiants." tone="ai" />
      <StatCard icon={FileText} title="Brouillons" value={counts.DRAFT} description="A finaliser avant publication." tone="warning" />
      <StatCard icon={Archive} title="Archivees ou fermees" value={archivedOrClosed} description="Offres inactives ou historiques." tone="cyan" />
    </section>
  );
}

export default CompanyOffersStats;
