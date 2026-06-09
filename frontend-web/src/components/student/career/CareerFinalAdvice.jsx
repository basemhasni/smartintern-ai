function CareerFinalAdvice({ finalAdvice }) {
  return (
    <section className="rounded-stitch border border-ai/10 bg-aiSoft/50 p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Conseil final</p>
      <h2 className="mt-2 text-xl font-black text-ink">A retenir</h2>
      <p className="mt-4 text-sm leading-7 text-muted">{finalAdvice || 'Continuez a enrichir votre profil avec des projets concrets et des competences verifiables.'}</p>
      <p className="mt-4 text-xs font-bold leading-5 text-muted">Ces recommandations constituent des pistes de progression et ne garantissent pas une decision de recrutement.</p>
    </section>
  );
}

export default CareerFinalAdvice;
