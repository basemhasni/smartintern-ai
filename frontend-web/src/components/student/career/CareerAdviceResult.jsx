import { Link } from 'react-router-dom';

import CareerActionPlan from './CareerActionPlan.jsx';
import CareerFinalAdvice from './CareerFinalAdvice.jsx';
import CareerProfileSummary from './CareerProfileSummary.jsx';
import CareerStrengths from './CareerStrengths.jsx';
import RagInsightsPanel from './RagInsightsPanel.jsx';
import SkillsToImprove from './SkillsToImprove.jsx';

function CareerAdviceResult({ advice, offer, onAskAnother }) {
  if (!advice) {
    return null;
  }

  return (
    <div className="space-y-5">
      <CareerProfileSummary advice={advice} offer={offer} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <CareerStrengths strengths={advice.strengths} />
          <SkillsToImprove skills={advice.skillsToImprove} />
          <CareerFinalAdvice finalAdvice={advice.finalAdvice} />
        </div>
        <div className="space-y-5">
          <CareerActionPlan actionPlan={advice.actionPlan} />
          <RagInsightsPanel ragInsights={advice.ragInsights} ragContext={advice.ragContext} />
          <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Actions</p>
            <div className="mt-4 grid gap-3">
              <Link className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-black text-white shadow-panel" to={`/student/offers/${offer?.id}`}>
                Voir l offre
              </Link>
              <Link className="rounded-lg border border-line bg-white px-4 py-3 text-center text-sm font-black text-ink shadow-panel" to="/student/cv">
                Mettre a jour mon CV
              </Link>
              <Link className="rounded-lg border border-line bg-white px-4 py-3 text-center text-sm font-black text-ink shadow-panel" to="/student/profile">
                Completer mon profil
              </Link>
              <Link className="rounded-lg border border-line bg-white px-4 py-3 text-center text-sm font-black text-ink shadow-panel" to="/student/applications">
                Voir mes candidatures
              </Link>
              <button className="rounded-lg border border-line bg-canvas px-4 py-3 text-sm font-black text-ink" type="button" onClick={onAskAnother}>
                Poser une autre question
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CareerAdviceResult;
