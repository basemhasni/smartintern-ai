import ScoreBadge from '../common/ScoreBadge.jsx';
import AiConfidenceBadge from './AiConfidenceBadge.jsx';
import AiDecisionLabelBadge from './AiDecisionLabelBadge.jsx';
import AiWarningsPanel from './AiWarningsPanel.jsx';

function AiScoreCard({ matching, compact = false }) {
  if (!matching) return null;
  const lowConfidence = matching.confidence === 'LOW';
  const warnings = [...(matching.warnings || []), ...(matching.explainability?.warnings || [])];

  return (
    <div className="rounded-stitch border border-ai/10 bg-aiSoft/35 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <ScoreBadge score={matching.score} size={compact ? 'md' : 'lg'} label="IA" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <AiDecisionLabelBadge label={matching.decisionLabel} />
            <AiConfidenceBadge confidence={matching.confidence} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">{matching.explanation || 'Le detail de l explication n est pas disponible.'}</p>
          {lowConfidence ? <p className="mt-2 text-xs font-bold text-amber-800">Ce score doit etre interprete avec prudence car les donnees disponibles sont limitees.</p> : null}
        </div>
      </div>
      <div className="mt-4"><AiWarningsPanel warnings={warnings} /></div>
    </div>
  );
}

export default AiScoreCard;
