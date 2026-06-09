import { Link } from 'react-router-dom';

function CompanyOffersHeader({ title = 'Mes offres', subtitle = 'Creez, publiez et suivez vos offres de stage depuis un espace unique.', action = true }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Offres entreprise</p>
          <h1 className="mt-2 text-2xl font-black leading-tight text-ink md:text-3xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{subtitle}</p>
        </div>
        {action ? (
          <Link className="inline-flex justify-center rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel" to="/company/offers/new">
            Creer une offre
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export default CompanyOffersHeader;
