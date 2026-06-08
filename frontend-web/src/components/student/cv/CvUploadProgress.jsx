const steps = ['Envoi du fichier', 'Extraction du contenu', 'Analyse des competences', 'Preparation du profil IA'];

function CvUploadProgress({ fileName, progress }) {
  const isAnalyzing = progress >= 100;

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel" aria-live="polite">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Traitement en cours</p>
      <h2 className="mt-2 text-xl font-black text-ink">{isAnalyzing ? 'Analyse IA en cours' : 'Envoi du fichier'}</h2>
      <p className="mt-2 text-sm text-muted">{fileName}</p>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-canvas">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {steps.map((step, index) => {
          const isActive = index === 0 ? progress < 100 : isAnalyzing && index <= 3;

          return (
            <div key={step} className={`rounded-lg border px-3 py-3 text-sm font-bold ${isActive ? 'border-primary bg-primarySoft text-primary' : 'border-line bg-canvas text-muted'}`}>
              {step}
            </div>
          );
        })}
      </div>
      {isAnalyzing ? (
        <p className="mt-4 text-sm leading-6 text-muted">Le fichier est envoye. Le backend extrait maintenant le contenu et interroge le service IA, sans pourcentage artificiel.</p>
      ) : null}
    </section>
  );
}

export default CvUploadProgress;
