import { useState } from 'react';
import { ClipboardCopy, WandSparkles } from 'lucide-react';

import { analyzeOfferQuality } from '../../api/aiApi.js';
import { getAiErrorMessage } from '../../utils/ai.js';
import AiWarningsPanel from './AiWarningsPanel.jsx';
import DecisionTraceTimeline from './DecisionTraceTimeline.jsx';

function OfferQualityPanel({ offer, initialResult = null }) {
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const analyze = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      setResult(await analyzeOfferQuality(offer));
    } catch (requestError) {
      setError(getAiErrorMessage(requestError, 'L analyse de l offre est indisponible.'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyDraft = async () => {
    const draft = result?.improvedOfferDraft;
    if (!draft) return;
    const text = [draft.title, draft.description, ...(draft.missions || []), `Requises: ${(draft.requiredSkills || []).join(', ')}`, `Optionnelles: ${(draft.optionalSkills || []).join(', ')}`].filter(Boolean).join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setMessage('Proposition copiee.');
    } catch {
      setMessage('Copie automatique indisponible.');
    }
  };

  return (
    <section className="rounded-stitch border border-ai/15 bg-white p-5 shadow-panel sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-black uppercase tracking-[0.14em] text-ai">Aide a la redaction</p><h2 className="mt-2 text-xl font-black text-ink">Qualite de l offre</h2><p className="mt-2 text-sm leading-6 text-muted">Cette analyse reste une aide et ne bloque jamais l enregistrement.</p></div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-ai px-4 py-3 text-sm font-black text-white shadow-panel disabled:opacity-60" type="button" disabled={isLoading} onClick={analyze}><WandSparkles className="h-4 w-4" aria-hidden="true" />{isLoading ? 'Analyse...' : 'Analyser la qualite'}</button>
      </div>
      {error ? <p className="mt-4 rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-bold text-danger">{error}</p> : null}
      {message ? <p className="mt-4 text-sm font-bold text-primary" aria-live="polite">{message}</p> : null}
      {result ? (
        <div className="mt-6 space-y-5 border-t border-line pt-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-aiSoft p-4"><p className="text-xs font-black text-ai">Score qualite</p><p className="mt-2 text-3xl font-black text-ai">{result.qualityScore}%</p></div>
            <div className="rounded-lg bg-canvas p-4"><p className="text-xs font-black text-muted">Niveau</p><p className="mt-2 text-lg font-black text-ink">{result.qualityLevel}</p></div>
            <div className="rounded-lg bg-cyanSoft p-4"><p className="text-xs font-black text-muted">Preparation matching</p><p className="mt-2 text-lg font-black text-ink">{result.matchingReadiness}</p></div>
          </div>
          <p className="text-sm leading-6 text-muted">{result.summary}</p>
          {result.strengths.length ? <div><h3 className="text-sm font-black text-ink">Points solides</h3><ul className="mt-2 space-y-1 text-sm text-muted">{result.strengths.map((item) => <li key={item}>• {item}</li>)}</ul></div> : null}
          {result.issues.length ? <div><h3 className="text-sm font-black text-ink">Points a corriger</h3><div className="mt-3 space-y-3">{result.issues.map((issue) => <article key={issue.type} className={`rounded-lg border p-4 ${issue.severity === 'HIGH' ? 'border-red-100 bg-red-50' : 'border-amber-100 bg-amber-50'}`}><div className="flex flex-wrap justify-between gap-2"><h4 className="font-black text-ink">{issue.message}</h4><span className="text-xs font-black">{issue.severity}</span></div><p className="mt-2 text-xs leading-5 text-muted">{issue.impactOnMatching}</p><p className="mt-2 text-xs font-bold text-primary">{issue.suggestion}</p></article>)}</div></div> : null}
          {result.improvedOfferDraft?.title ? <div className="rounded-stitch border border-line bg-canvas p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase text-ai">Proposition</p><h3 className="mt-1 font-black text-ink">{result.improvedOfferDraft.title}</h3></div><button className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs font-black text-ink" type="button" onClick={copyDraft}><ClipboardCopy className="h-4 w-4" aria-hidden="true" />Copier</button></div><p className="mt-3 text-sm leading-6 text-muted">{result.improvedOfferDraft.description}</p></div> : null}
          <details className="rounded-lg border border-line">
            <summary className="cursor-pointer px-4 py-3 text-sm font-black text-ink">Voir la trace de l analyse</summary>
            <div className="border-t border-line p-4"><DecisionTraceTimeline trace={result.decisionTrace} title="Trace de qualite" /></div>
          </details>
          <AiWarningsPanel warnings={result.warnings} />
        </div>
      ) : null}
    </section>
  );
}

export default OfferQualityPanel;
