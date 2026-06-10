import { BriefcaseBusiness, Building2, CheckCircle2, ClipboardList, UserX, UsersRound } from 'lucide-react';

import StatCard from '../common/StatCard.jsx';

function AdminStatsGrid({ stats }) {
  return (
    <section aria-label="Statistiques administrateur">
      <h2 className="sr-only">Statistiques globales</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={UsersRound} title="Utilisateurs" value={stats.totalUsers} description={`${stats.totalStudents} etudiants / ${stats.totalCompanies} entreprises`} />
        <StatCard icon={Building2} title="Entreprises en attente" value={stats.pendingCompanies} description="Demandes a traiter" tone="warning" />
        <StatCard icon={UserX} title="Utilisateurs desactives" value={stats.inactiveUsers} description="Comptes actuellement inactifs" tone="ai" />
        <StatCard icon={BriefcaseBusiness} title="Offres" value={stats.totalOffers} description={`${stats.publishedOffers} publiees`} tone="cyan" />
        <StatCard icon={ClipboardList} title="Candidatures" value={stats.totalApplications} description="Total plateforme" />
        <StatCard icon={CheckCircle2} title="Candidatures acceptees" value={stats.acceptedApplications} description="Statut ACCEPTED" tone="ai" />
      </div>
    </section>
  );
}

export default AdminStatsGrid;
