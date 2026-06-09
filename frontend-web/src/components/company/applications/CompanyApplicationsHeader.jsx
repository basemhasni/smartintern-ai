import { Link } from 'react-router-dom';

function CompanyApplicationsHeader({ selectedOfferId }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Recrutement</p>
          <h1 className="mt-2 text-2xl font-black leading-tight text-ink md:text-3xl">Candidatures recues</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            Consultez les profils, suivez leur avancement et prenez vos decisions a partir d informations claires.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link className="rounded-lg border border-line bg-white px-5 py-3 text-center text-sm font-black text-ink shadow-panel" to="/company/offers">
            Voir mes offres
          </Link>
          <Link
            className={`rounded-lg px-5 py-3 text-center text-sm font-black shadow-panel ${selectedOfferId ? 'bg-primary text-white' : 'pointer-events-none bg-line text-muted'}`}
            to={selectedOfferId ? `/company/candidate-ranking?offerId=${selectedOfferId}` : '#'}
            aria-disabled={!selectedOfferId}
          >
            Classement IA
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CompanyApplicationsHeader;
