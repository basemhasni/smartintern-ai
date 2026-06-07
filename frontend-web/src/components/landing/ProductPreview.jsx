import { ClipboardList, FileText, MessageSquareText, TrendingUp } from 'lucide-react';

import SectionHeading from './SectionHeading.jsx';
import SkillPill from './SkillPill.jsx';

function MiniStat({ label, value, tone = 'blue' }) {
  return (
    <div className="rounded-stitch border border-line bg-white p-4 shadow-panel">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className={`mt-3 text-3xl font-black ${tone === 'violet' ? 'text-ai' : 'text-ink'}`}>{value}</p>
    </div>
  );
}

function ProductPreview() {
  return (
    <section className="bg-white/60 py-20">
      <div className="stitch-container">
        <SectionHeading eyebrow="Apercu produit" title="Des interfaces calmes pour des decisions importantes." align="center">
          Les apercus reprennent les codes Stitch: sidebar claire, cartes blanches, scores circulaires, badges de competences et panneaux d’analyse.
        </SectionHeading>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[24px] border border-line bg-canvas p-4 shadow-stitch">
            <div className="rounded-[20px] border border-line bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-ai">Dashboard etudiant</p>
                  <h3 className="mt-2 text-2xl font-black text-ink">Best Match For You</h3>
                </div>
                <div className="ai-score-ring flex h-24 w-24 items-center justify-center rounded-full">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-black text-ink">92%</span>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <MiniStat label="Profile completion" value="80%" />
                <MiniStat label="CV uploaded" value="Yes" tone="violet" />
                <MiniStat label="Applications sent" value="5" />
              </div>
              <div className="mt-6 rounded-stitch border border-line bg-white p-5">
                <h4 className="font-black text-ink">Frontend Developer Intern</h4>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                  Vos competences React et Node.js correspondent au coeur de l’offre. Docker reste l’ecart prioritaire.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <SkillPill>React</SkillPill>
                  <SkillPill>Node.js</SkillPill>
                  <SkillPill tone="red">Docker manquant</SkillPill>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            {[
              [TrendingUp, 'Classement candidats', 'Scores explicables pour comparer les profils sans effacer le contexte.'],
              [MessageSquareText, 'Assistant carriere', 'Conseils relies aux ecarts et aux documents indexes.'],
              [FileText, 'Lettre personnalisee', 'Generation structuree, modifiable, sans inventer d’experience.'],
              [ClipboardList, 'Suivi candidatures', 'Statuts clairs pour etudiants et recruteurs.'],
            ].map(([Icon, title, text]) => (
              <article key={title} className="rounded-stitch border border-line bg-white p-5 shadow-panel">
                <Icon className="text-primary" size={22} aria-hidden="true" />
                <h3 className="mt-3 font-extrabold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductPreview;
