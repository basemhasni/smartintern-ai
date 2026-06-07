import { Building2, GraduationCap } from 'lucide-react';

import SectionHeading from './SectionHeading.jsx';

const studentFeatures = ['Analyse du CV', 'Recommandations personnalisees', 'Lettre de motivation', 'Assistant carriere', 'Suivi des candidatures'];
const companyFeatures = ['Publication d’offres', 'Classement intelligent', 'Score explicable', 'Competences manquantes', 'Suivi des candidatures'];

function FeatureList({ items }) {
  return (
    <ul className="mt-6 grid gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function AudiencePaths() {
  return (
    <section id="parcours" className="bg-white/55 py-20">
      <div className="stitch-container">
        <SectionHeading eyebrow="Deux parcours" title="La meme intelligence, deux decisions plus claires." align="center">
          Etudiant et recruteur travaillent sur des surfaces complementaires, avec le meme langage de score et d’explication.
        </SectionHeading>
        <div className="mt-12 grid overflow-hidden rounded-[24px] border border-line bg-white shadow-stitch lg:grid-cols-2">
          <article className="p-7 md:p-10">
            <GraduationCap className="text-primary" size={28} aria-hidden="true" />
            <h3 className="mt-5 text-2xl font-black text-ink">Une recherche qui commence par ce que vous savez faire.</h3>
            <p className="mt-4 text-sm leading-7 text-muted">
              Le parcours etudiant transforme le CV en signaux lisibles, puis relie ces signaux aux offres pertinentes.
            </p>
            <FeatureList items={studentFeatures} />
          </article>
          <article className="border-t border-line bg-canvas/70 p-7 md:p-10 lg:border-l lg:border-t-0">
            <Building2 className="text-ai" size={28} aria-hidden="true" />
            <h3 className="mt-5 text-2xl font-black text-ink">Moins de candidatures a trier. Plus de profils a comprendre.</h3>
            <p className="mt-4 text-sm leading-7 text-muted">
              Le parcours entreprise met en avant les candidats avec un score explicable, pas seulement une liste de CV.
            </p>
            <FeatureList items={companyFeatures} />
          </article>
        </div>
      </div>
    </section>
  );
}

export default AudiencePaths;
