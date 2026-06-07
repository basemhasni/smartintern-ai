import { FileText, Route, ScanSearch } from 'lucide-react';

import SectionHeading from './SectionHeading.jsx';
import SkillPill from './SkillPill.jsx';

const steps = [
  {
    id: '01',
    icon: FileText,
    title: 'Comprendre le profil',
    text: 'Extraction des competences, lecture du parcours et identification des objectifs.',
    signal: ['React', 'PostgreSQL', 'Projet web'],
  },
  {
    id: '02',
    icon: ScanSearch,
    title: 'Comprendre l’offre',
    text: 'Analyse des competences obligatoires, optionnelles et du contexte metier.',
    signal: ['Docker', 'Node.js', 'Fullstack'],
  },
  {
    id: '03',
    icon: Route,
    title: 'Expliquer la correspondance',
    text: 'Score, competences communes, ecarts et pistes concretes d’amelioration.',
    signal: ['75%', 'Docker manquant', 'Action plan'],
  },
];

function MatchingStory() {
  return (
    <section id="fonctionnement" className="stitch-container py-20">
      <SectionHeading eyebrow="Fonctionnement" title="Le matching devient une histoire que l’on peut verifier.">
        SmartIntern AI ne se contente pas de classer. La plateforme montre comment le profil, l’offre et les ecarts se relient.
      </SectionHeading>

      <div className="mt-12 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[20px] border border-line bg-white p-6 shadow-stitch">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">ligne narrative</p>
          <div className="mt-8 space-y-8 border-l border-dashed border-ai/30 pl-6">
            {steps.map(({ id, icon: Icon, title, text }) => (
              <div key={id} className="relative">
                <span className="absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full bg-ai text-xs font-bold text-white">
                  {id}
                </span>
                <Icon className="text-primary" size={20} aria-hidden="true" />
                <h3 className="mt-3 text-xl font-extrabold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-grid rounded-[20px] border border-line bg-white p-6 shadow-stitch">
          <div className="grid gap-4">
            {steps.map((step) => (
              <article key={step.id} className="grid gap-4 rounded-stitch border border-line bg-white p-5 md:grid-cols-[120px_1fr] md:items-center">
                <div>
                  <span className="text-xs font-black text-ai">Etape {step.id}</span>
                  <p className="mt-1 text-sm font-bold text-ink">{step.title}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {step.signal.map((item, index) => (
                    <SkillPill key={item} tone={index === 1 ? 'violet' : 'blue'}>{item}</SkillPill>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MatchingStory;
