import CandidateRankingEmptyState from './CandidateRankingEmptyState.jsx';
import CandidateWithoutCvCard from './CandidateWithoutCvCard.jsx';
import RankedCandidateCard from './RankedCandidateCard.jsx';

function CandidateRankingList({ candidates, hasAnyCandidate, selectedOffer, onOpenDetails, onUpdateStatus, onResetFilters }) {
  if (!hasAnyCandidate) {
    return <CandidateRankingEmptyState variant="noCandidates" selectedOffer={selectedOffer} />;
  }

  if (!candidates.length) {
    return <CandidateRankingEmptyState variant="filtered" onResetFilters={onResetFilters} />;
  }

  const hasOnlyWithoutScore = candidates.every((candidate) => !candidate.hasScore);

  return (
    <section className="space-y-4" aria-label="Liste classee des candidats">
      {hasOnlyWithoutScore ? (
        <p className="rounded-stitch border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-bold leading-6 text-amber-800">
          Les candidatures sont disponibles, mais aucun score n a pu etre calcule pour cette selection.
        </p>
      ) : null}
      {candidates.map((candidate) => (
        candidate.hasAnalyzedCv ? (
          <RankedCandidateCard key={candidate.applicationId} candidate={candidate} onOpenDetails={onOpenDetails} onUpdateStatus={onUpdateStatus} />
        ) : (
          <CandidateWithoutCvCard key={candidate.applicationId} candidate={candidate} onOpenDetails={onOpenDetails} onUpdateStatus={onUpdateStatus} />
        )
      ))}
    </section>
  );
}

export default CandidateRankingList;
