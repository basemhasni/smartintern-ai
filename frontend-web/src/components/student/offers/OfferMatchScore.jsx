import ScoreBadge from '../../common/ScoreBadge.jsx';

function OfferMatchScore({ matching, compact = false }) {
  if (!matching || matching.score === null || matching.score === undefined) {
    return (
      <div className="rounded-stitch border border-line bg-canvas px-4 py-3 text-sm font-bold text-muted">
        Score non calcule
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'rounded-stitch border border-ai/10 bg-aiSoft/40 p-4'}`}>
      <ScoreBadge score={matching.score} size={compact ? 'md' : 'lg'} />
      <div>
        <p className="text-sm font-black text-ink">Compatibilite IA</p>
        <p className="mt-1 text-xs leading-5 text-muted">Estimation basee sur votre CV analyse.</p>
      </div>
    </div>
  );
}

export default OfferMatchScore;
