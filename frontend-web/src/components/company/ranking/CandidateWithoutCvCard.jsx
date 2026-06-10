import RankedCandidateCard from './RankedCandidateCard.jsx';

function CandidateWithoutCvCard(props) {
  return (
    <div className="space-y-3">
      <RankedCandidateCard {...props} />
      <p className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-800">
        Le score n a pas pu etre calcule car aucun CV analyse exploitable n est disponible pour ce candidat.
      </p>
    </div>
  );
}

export default CandidateWithoutCvCard;
