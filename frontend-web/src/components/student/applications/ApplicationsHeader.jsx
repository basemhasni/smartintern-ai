import { Link } from 'react-router-dom';

function ApplicationsHeader() {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Vue actualisee de vos demarches</p>
          <h1 className="mt-2 text-2xl font-black leading-tight text-ink md:text-3xl">Mes candidatures</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            Suivez chaque etape de vos candidatures et preparez vos prochaines actions.
          </p>
        </div>
        <Link className="inline-flex justify-center rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel transition hover:-translate-y-0.5" to="/student/offers">
          Decouvrir d'autres offres
        </Link>
      </div>
    </section>
  );
}

export default ApplicationsHeader;
