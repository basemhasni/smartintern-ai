import { AlertTriangle } from 'lucide-react';

function AiWarningsPanel({ warnings = [], title = 'Points de vigilance' }) {
  const items = (Array.isArray(warnings) ? warnings : []).filter(Boolean);
  if (!items.length) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 text-amber-900"><AlertTriangle className="h-4 w-4" aria-hidden="true" /><p className="text-sm font-black">{title}</p></div>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-800">
        {items.map((warning, index) => <li key={`${warning}-${index}`}>{typeof warning === 'string' ? warning : warning.message}</li>)}
      </ul>
    </div>
  );
}

export default AiWarningsPanel;
