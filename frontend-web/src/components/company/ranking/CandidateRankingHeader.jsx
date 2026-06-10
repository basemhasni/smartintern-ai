import { BriefcaseBusiness, ClipboardList, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';

function CandidateRankingHeader({ selectedOfferId }) {
  const linkClass = 'inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel transition hover:-translate-y-0.5';

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Matching recruteur</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-ink md:text-4xl">Classement IA des candidats</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            Comparez les competences des candidats avec les besoins de l offre et explorez les raisons derriere chaque score.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className={linkClass} to={selectedOfferId ? `/company/applications?offerId=${selectedOfferId}` : '/company/applications'}>
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Voir les candidatures
          </Link>
          {selectedOfferId ? (
            <Link className={linkClass} to={`/company/offers/${selectedOfferId}`}>
              <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
              Voir l offre
            </Link>
          ) : null}
          <Link className={linkClass} to="/company/offers">
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            Gerer mes offres
          </Link>
        </div>
      </div>
      <p className="mt-5 rounded-lg border border-primary/10 bg-primarySoft px-4 py-3 text-xs font-bold leading-5 text-primary">
        Le classement compare les competences declarees dans les CV avec celles demandees dans l offre. Il ne remplace pas l evaluation humaine du recruteur.
      </p>
    </section>
  );
}

export default CandidateRankingHeader;
