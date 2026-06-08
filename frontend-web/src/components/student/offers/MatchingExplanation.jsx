import OfferMatchScore from './OfferMatchScore.jsx';
import OfferSkills from './OfferSkills.jsx';

function MatchingExplanation({ matching, matchingError }) {
  if (matchingError) {
    return (
      <section className="rounded-stitch border border-amber-100 bg-amber-50 p-6 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-800">Matching IA</p>
        <h2 className="mt-2 text-xl font-black text-amber-900">Score indisponible</h2>
        <p className="mt-3 text-sm leading-7 text-amber-800">{matchingError}</p>
      </section>
    );
  }

  if (!matching) {
    return null;
  }

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Matching explicable</p>
      <h2 className="mt-2 text-xl font-black text-ink">Pourquoi cette offre peut vous correspondre</h2>
      <div className="mt-5">
        <OfferMatchScore matching={matching} />
      </div>
      <p className="mt-4 text-sm leading-7 text-muted">
        {matching.explanation || 'Le backend a calcule le score a partir des competences du CV et de l’offre.'}
      </p>
      <p className="mt-2 text-xs font-bold leading-5 text-muted">
        Ce score est une estimation basee sur votre CV analyse et les competences mentionnees dans l’offre. Il ne constitue pas une decision de recrutement.
      </p>
      <div className="mt-5">
        <OfferSkills
          matchedSkills={matching.matchedSkills}
          missingSkills={matching.missingSkills}
          optionalMatchedSkills={matching.optionalMatchedSkills}
        />
      </div>
    </section>
  );
}

export default MatchingExplanation;
