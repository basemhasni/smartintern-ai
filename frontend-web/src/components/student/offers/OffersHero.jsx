import { Link } from 'react-router-dom';

function OffersHero({ recommendationsError }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Recommandations personnalisees par SmartIntern AI</p>
          <h1 className="mt-2 max-w-3xl text-2xl font-black leading-tight text-ink md:text-3xl">
            Des offres qui correspondent a votre profil
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            Explorez les recommandations calculees a partir de votre CV, de vos competences et de vos objectifs.
          </p>
        </div>
        <Link className="inline-flex justify-center rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-panel transition hover:-translate-y-0.5" to="/student/cv">
          Mettre a jour mon CV
        </Link>
      </div>
      {recommendationsError ? (
        <div className="mt-5 rounded-stitch border border-amber-100 bg-amber-50 p-4">
          <h2 className="text-sm font-black text-amber-800">Importez votre CV pour activer les recommandations</h2>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Vous pouvez consulter les offres disponibles des maintenant. L’analyse de votre CV permettra ensuite de calculer vos scores personnalises.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-white" to="/student/cv">Importer mon CV</Link>
            <a className="rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-black text-amber-800" href="#offers-results">Voir toutes les offres</a>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default OffersHero;
