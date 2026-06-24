import { aiLabels } from '../../utils/ai.js';

function SkillEvidenceBadge({ level = 'MISSING' }) {
  const value = String(level || 'MISSING').toUpperCase();
  const tones = {
    STRONG: 'border-success/20 bg-green-50 text-success',
    MEDIUM: 'border-primary/20 bg-primarySoft text-primary',
    WEAK: 'border-warning/20 bg-amber-50 text-amber-800',
    MISSING: 'border-danger/20 bg-red-50 text-danger',
  };
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${tones[value] || tones.MISSING}`}>{aiLabels.evidence[value] || value}</span>;
}

export default SkillEvidenceBadge;
