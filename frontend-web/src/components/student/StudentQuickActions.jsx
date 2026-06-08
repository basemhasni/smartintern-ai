import { Bot, BriefcaseBusiness, FileUp, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  {
    title: 'Importer ou mettre a jour mon CV',
    description: "Activez l'analyse IA et les recommandations.",
    to: '/student/cv',
    icon: FileUp,
  },
  {
    title: 'Decouvrir les offres',
    description: 'Explorez les opportunites publiees.',
    to: '/student/offers',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Suivre mes candidatures',
    description: 'Gardez une vue claire sur vos demandes.',
    to: '/student/applications',
    icon: Send,
  },
  {
    title: "Consulter l'assistant carriere",
    description: 'Identifiez les prochaines competences utiles.',
    to: '/student/career-assistant',
    icon: Bot,
  },
];

function StudentQuickActions() {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Actions rapides</p>
      <h2 className="mt-2 text-xl font-black text-ink">Faire avancer la recherche</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.to}
              className="group flex items-start gap-3 rounded-stitch border border-line bg-canvas p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-panel"
              to={action.to}
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-primary shadow-panel group-hover:bg-primary group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-black text-ink">{action.title}</span>
                <span className="mt-1 block text-sm leading-6 text-muted">{action.description}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default StudentQuickActions;
