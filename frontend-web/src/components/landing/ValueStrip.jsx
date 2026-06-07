import { BadgeCheck, FileSearch, Target } from 'lucide-react';

const values = [
  {
    icon: FileSearch,
    title: 'Un CV analyse avec transparence',
    text: 'Les competences sont extraites et presentees comme des signaux, pas comme une boite noire.',
  },
  {
    icon: Target,
    title: 'Un score de compatibilite explique',
    text: 'Le matching montre les points communs, les ecarts et les raisons du score.',
  },
  {
    icon: BadgeCheck,
    title: 'Des candidatures mieux ciblees',
    text: 'Chaque action aide a choisir une opportunite avec plus de contexte et moins d’approximation.',
  },
];

function ValueStrip() {
  return (
    <section className="border-y border-line bg-white/72 py-8">
      <div className="stitch-container grid gap-4 md:grid-cols-3">
        {values.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-stitch border border-line bg-white p-5 shadow-panel">
            <Icon className="text-primary" size={22} aria-hidden="true" />
            <h2 className="mt-4 text-base font-extrabold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ValueStrip;
