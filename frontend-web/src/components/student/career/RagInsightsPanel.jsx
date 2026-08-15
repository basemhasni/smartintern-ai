import { useState } from 'react';

function RagInsightsPanel({ ragInsights = [], ragContext = { used: false, documents: [], documentsCount: 0 } }) {
  const [showSources, setShowSources] = useState(false);
  const hasContext = ragContext?.used || ragInsights.length > 0;

  if (!hasContext) {
    return (
      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Contexte</p>
        <p className="mt-2 text-sm leading-6 text-muted">Analyse realisee a partir du profil, du CV et de l offre.</p>
      </section>
    );
  }

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Contexte utilise par SmartIntern AI</p>
      <h2 className="mt-2 text-xl font-black text-ink">Documents indexes utiles</h2>
      <p className="mt-2 text-sm leading-6 text-muted">Ces conseils ont ete enrichis a partir des documents indexes lies a votre profil et aux offres.</p>
      {ragInsights.length ? (
        <ul className="mt-4 space-y-2">
          {ragInsights.map((insight) => (
            <li key={insight} className="rounded-lg bg-canvas px-4 py-3 text-sm font-bold leading-6 text-ink">{insight}</li>
          ))}
        </ul>
      ) : null}
      {Array.isArray(ragContext.documents) && ragContext.documents.length ? (
        <div className="mt-4">
          <button className="text-sm font-black text-primary hover:underline" type="button" onClick={() => setShowSources((current) => !current)}>
            {showSources ? 'Masquer les sources' : `Voir les sources (${ragContext.documentsCount})`}
          </button>
          {showSources ? (
            <div className="mt-3 space-y-2">
              {ragContext.documents.map((document) => (
                <div key={`${document.ownerType}-${document.id}`} className="rounded-lg border border-line bg-canvas px-4 py-3">
                  <p className="text-sm font-black text-ink">{document.title}</p>
                  <p className="mt-1 text-xs font-bold text-muted">{document.ownerTypeLabel}{document.score !== null ? ` / similarite ${document.score.toFixed(2)}` : ''}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default RagInsightsPanel;
