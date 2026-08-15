import { CheckCircle2, CircleAlert, Info } from 'lucide-react';
import AiEmptyState from './AiEmptyState.jsx';
import AiSectionCard from './AiSectionCard.jsx';

function DecisionTraceTimeline({ trace, title = 'Trace de decision IA' }) {
  const items = Array.isArray(trace) ? trace : [];
  return (
    <AiSectionCard title={title} description="Les etapes qui ont produit ce resultat, dans un langage lisible.">
      {!items.length ? <AiEmptyState message="La trace de decision n est pas disponible pour cette analyse." /> : (
        <ol className="relative space-y-5 border-l border-line pl-6">
          {items.filter((item) => item && typeof item === 'object').map((item, index) => {
            const Icon = item.status === 'WARNING' || item.status === 'LIMITED' ? CircleAlert : item.status === 'INFO' ? Info : CheckCircle2;
            return (
              <li key={`${item.step || item.title}-${index}`} className="relative">
                <span className="absolute -left-[31px] grid h-5 w-5 place-items-center rounded-full bg-white text-primary"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <p className="text-xs font-black uppercase tracking-[0.1em] text-muted">{item.step || `Etape ${index + 1}`}</p>
                <h3 className="mt-1 font-black text-ink">{item.title || 'Etape IA'}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{item.summary || 'Aucun resume disponible.'}</p>
                {Array.isArray(item.details) && item.details.length ? <ul className="mt-2 space-y-1 text-xs leading-5 text-muted">{item.details.slice(0, 4).map((detail, detailIndex) => <li key={detailIndex}>• {detail}</li>)}</ul> : null}
              </li>
            );
          })}
        </ol>
      )}
    </AiSectionCard>
  );
}

export default DecisionTraceTimeline;
