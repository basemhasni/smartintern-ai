function CareerActionPlan({ actionPlan }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Plan d action</p>
      <h2 className="mt-2 text-xl font-black text-ink">Parcours de progression</h2>
      <div className="mt-5 space-y-4">
        {actionPlan.length ? actionPlan.map((step, index) => (
          <div key={`${step.period}-${step.objective}`} className="flex gap-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-black text-white">{index + 1}</span>
            <div className="rounded-stitch bg-canvas p-4">
              <p className="text-sm font-black text-primary">{step.period}</p>
              <p className="mt-1 text-sm leading-6 text-ink">{step.objective}</p>
            </div>
          </div>
        )) : (
          <p className="text-sm leading-6 text-muted">Aucun plan chronologique n a ete renvoye pour cette analyse.</p>
        )}
      </div>
    </section>
  );
}

export default CareerActionPlan;
