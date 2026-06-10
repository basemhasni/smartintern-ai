function CandidateRankBadge({ rank }) {
  const tone = rank === 1
    ? 'border-primary/20 bg-primarySoft text-primary'
    : rank === 2
      ? 'border-ai/20 bg-aiSoft text-ai'
      : rank === 3
        ? 'border-cyan-100 bg-cyanSoft text-cyan-700'
        : 'border-line bg-canvas text-muted';

  return (
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border text-sm font-black ${tone}`} aria-label={`Rang original ${rank}`}>
      #{rank}
    </span>
  );
}

export default CandidateRankBadge;
