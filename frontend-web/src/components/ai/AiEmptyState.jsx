import { BrainCircuit } from 'lucide-react';

function AiEmptyState({ title = 'Analyse IA detaillee non disponible', message = 'Ce resultat provient peut-etre d une ancienne analyse. Relancez le matching pour obtenir les nouveaux indicateurs.' }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-canvas p-5 text-center">
      <BrainCircuit className="mx-auto h-6 w-6 text-ai" aria-hidden="true" />
      <p className="mt-3 text-sm font-black text-ink">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted">{message}</p>
    </div>
  );
}

export default AiEmptyState;
