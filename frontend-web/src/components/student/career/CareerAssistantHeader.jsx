import { Link } from 'react-router-dom';

function CareerAssistantHeader() {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Assistant carriere IA</p>
          <h1 className="mt-2 text-2xl font-black leading-tight text-ink md:text-3xl">Assistant carriere</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            Transformez les ecarts de competences en plan d action concret pour vos prochaines opportunites.
          </p>
          <p className="mt-2 max-w-3xl text-xs font-bold leading-5 text-muted">
            Les conseils sont bases sur votre CV analyse, l offre selectionnee et les documents indexes par SmartIntern AI.
          </p>
        </div>
        <Link className="inline-flex justify-center rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-panel transition hover:-translate-y-0.5" to="/student/dashboard">
          Retour au dashboard
        </Link>
      </div>
    </section>
  );
}

export default CareerAssistantHeader;
