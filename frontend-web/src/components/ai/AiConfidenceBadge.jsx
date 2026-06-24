import { aiLabels } from '../../utils/ai.js';

function AiConfidenceBadge({ confidence = 'LOW' }) {
  const value = String(confidence || 'LOW').toUpperCase();
  const tones = {
    HIGH: 'border-success/20 bg-green-50 text-success',
    MEDIUM: 'border-warning/20 bg-amber-50 text-amber-800',
    LOW: 'border-danger/20 bg-red-50 text-danger',
  };
  return <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${tones[value] || tones.LOW}`}>{aiLabels.confidence[value] || value}</span>;
}

export default AiConfidenceBadge;
