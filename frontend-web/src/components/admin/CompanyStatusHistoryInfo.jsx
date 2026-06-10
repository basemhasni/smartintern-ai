function CompanyStatusHistoryInfo() {
  return (
    <aside className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Regle de validation</p>
      <h2 className="mt-2 text-lg font-black text-ink">Statuts disponibles</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
        <li><strong className="text-ink">PENDING</strong> : demande a traiter.</li>
        <li><strong className="text-ink">VALIDATED</strong> : entreprise reconnue comme validee.</li>
        <li><strong className="text-ink">REJECTED</strong> : validation refusee.</li>
        <li><strong className="text-ink">SUSPENDED</strong> : fonctionnalites potentiellement limitees.</li>
      </ul>
      <p className="mt-4 text-xs font-bold leading-5 text-muted">Aucun motif ni notification email n est enregistre dans cette etape.</p>
    </aside>
  );
}

export default CompanyStatusHistoryInfo;
