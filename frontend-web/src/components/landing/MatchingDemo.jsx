import { Equal, Minus, Plus } from 'lucide-react';

import SectionHeading from './SectionHeading.jsx';
import SkillPill from './SkillPill.jsx';

const profile = ['React', 'Node.js', 'PostgreSQL', 'Git'];
const offer = ['React', 'Node.js', 'Docker', 'PostgreSQL'];
const common = ['React', 'Node.js', 'PostgreSQL'];

function MatchingDemo() {
  return (
    <section className="stitch-container py-20">
      <SectionHeading eyebrow="Exemple de demonstration" title="Le score devient lisible.">
        Un exemple simple montre comment le matching distingue les points communs, l’ecart principal et la recommandation.
      </SectionHeading>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_80px_1fr_0.8fr] lg:items-center">
        <article className="rounded-stitch border border-line bg-white p-6 shadow-panel">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Profil</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.map((skill) => <SkillPill key={skill}>{skill}</SkillPill>)}
          </div>
        </article>
        <div className="hidden justify-center text-muted lg:flex">
          <Plus size={28} aria-hidden="true" />
        </div>
        <article className="rounded-stitch border border-line bg-white p-6 shadow-panel">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Offre</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {offer.map((skill) => <SkillPill key={skill} tone={skill === 'Docker' ? 'red' : 'violet'}>{skill}</SkillPill>)}
          </div>
        </article>
        <article className="rounded-[20px] border border-primary/20 bg-white p-6 shadow-stitch">
          <div className="score-ring flex h-24 w-24 items-center justify-center rounded-full">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-black text-ink">75%</span>
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm font-bold text-ink">
            <Equal size={16} aria-hidden="true" />
            3 competences communes sur 4
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <Minus size={16} aria-hidden="true" />
            Docker est la competence a travailler en priorite.
          </p>
        </article>
      </div>

      <div className="mt-5 rounded-stitch border border-line bg-white p-5 text-sm leading-7 text-muted shadow-panel">
        Competences communes : {common.join(', ')}. Recommandation constructive : creer un mini-projet Dockerise et l’ajouter au portfolio avant de candidater.
      </div>
    </section>
  );
}

export default MatchingDemo;
