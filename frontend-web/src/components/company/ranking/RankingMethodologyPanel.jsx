function RankingMethodologyPanel() {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Methode</p>
      <h2 className="mt-2 text-xl font-black text-ink">Comment lire ce classement</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        SmartIntern AI compare les competences extraites du CV avec les competences requises et optionnelles de l offre. Le score indique la proximite du profil avec les criteres techniques declares.
      </p>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg bg-canvas p-4">
          <h3 className="text-sm font-black text-ink">Pris en compte</h3>
          <p className="mt-2 text-sm leading-6 text-muted">Competences detectees, offre selectionnee, correspondances et ecarts retournes par le backend.</p>
        </div>
        <div className="rounded-lg bg-canvas p-4">
          <h3 className="text-sm font-black text-ink">Non pris en compte</h3>
          <p className="mt-2 text-sm leading-6 text-muted">Entretien, motivation reelle, disponibilite detaillee ou criteres sensibles.</p>
        </div>
        <div className="rounded-lg bg-canvas p-4">
          <h3 className="text-sm font-black text-ink">Role du recruteur</h3>
          <p className="mt-2 text-sm leading-6 text-muted">Le classement aide a prioriser la lecture. La decision finale reste humaine et contextualisee.</p>
        </div>
      </div>
    </section>
  );
}

export default RankingMethodologyPanel;
