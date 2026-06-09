import { Archive, BriefcaseBusiness, CheckCircle2, FileStack } from 'lucide-react';

import StatCard from '../common/StatCard.jsx';

function CompanyStatsGrid({ offerCounts, applicationsCount, applicationScopeLabel }) {
  const stats = [
    {
      title: 'Offres totales',
      value: offerCounts.total,
      description: 'Toutes les offres de votre espace.',
      icon: BriefcaseBusiness,
      tone: 'primary',
    },
    {
      title: 'Offres publiees',
      value: offerCounts.PUBLISHED,
      description: 'Visibles par les etudiants.',
      icon: CheckCircle2,
      tone: 'ai',
    },
    {
      title: 'Brouillons',
      value: offerCounts.DRAFT,
      description: 'A finaliser avant publication.',
      icon: Archive,
      tone: 'warning',
    },
    {
      title: 'Candidatures recues',
      value: applicationsCount ?? 'Apercu',
      description: applicationScopeLabel,
      icon: FileStack,
      tone: 'cyan',
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </section>
  );
}

export default CompanyStatsGrid;
