import { BriefcaseBusiness, Building2, FileStack, PlusCircle, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  { title: 'Creer une offre', description: 'Preparer une nouvelle opportunite de stage.', to: '/company/offers', icon: PlusCircle },
  { title: 'Gerer mes offres', description: 'Consulter vos brouillons et offres publiees.', to: '/company/offers', icon: BriefcaseBusiness },
  { title: 'Voir les candidatures', description: 'Suivre les profils recus par offre.', to: '/company/applications', icon: FileStack },
  { title: 'Classement IA', description: 'Comparer les candidats avec un score explicable.', to: '/company/candidate-ranking', icon: Trophy },
  { title: 'Completer le profil', description: 'Ameliorer les informations de votre entreprise.', to: '/company/profile', icon: Building2 },
];

function CompanyQuickActions() {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Actions rapides</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link key={action.title} className="rounded-stitch border border-line bg-canvas p-4 transition hover:-translate-y-0.5 hover:border-primary/40" to={action.to}>
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="mt-3 text-sm font-black text-ink">{action.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default CompanyQuickActions;
