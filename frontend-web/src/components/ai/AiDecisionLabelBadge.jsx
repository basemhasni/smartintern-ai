import { aiLabels } from '../../utils/ai.js';

function AiDecisionLabelBadge({ label = 'INSUFFICIENT_DATA' }) {
  const value = String(label || 'INSUFFICIENT_DATA').toUpperCase();
  return <span className="inline-flex rounded-full border border-ai/15 bg-aiSoft px-3 py-1.5 text-xs font-black text-ai">{aiLabels.decision[value] || value}</span>;
}

export default AiDecisionLabelBadge;
