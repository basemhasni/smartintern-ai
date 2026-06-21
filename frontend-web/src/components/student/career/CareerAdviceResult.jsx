import { Link } from 'react-router-dom';

import CareerActionPlan from './CareerActionPlan.jsx';
import CareerAnalysisOverview from './CareerAnalysisOverview.jsx';
import CareerFinalAdvice from './CareerFinalAdvice.jsx';
import CareerFocusedAnswer from './CareerFocusedAnswer.jsx';
import CareerStrengths from './CareerStrengths.jsx';
import RagInsightsPanel from './RagInsightsPanel.jsx';
import SkillsToImprove from './SkillsToImprove.jsx';

function CareerAdviceResult({ advice, offer, question, onAskAnother }) {
  if (!advice) {
    return null;
  }

  return (
    <div className="space-y-6">
      {advice.v2.available ? <CareerFocusedAnswer advice={advice} question={question} /> : <CareerFinalAdvice finalAdvice={advice.finalAdvice} />}

      <details className="group border-y border-line bg-white" open={advice.v2.questionIntent === 'FULL_ANALYSIS'}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-black text-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 sm:px-7">
          <span>Voir l analyse detaillee du profil et du matching</span>
          <span className="text-xl text-primary transition group-open:rotate-45" aria-hidden="true">+</span>
        </summary>
        <div className="space-y-5 border-t border-line bg-canvas/50 px-4 py-5 sm:px-6">
          <CareerAnalysisOverview advice={advice} />
          <div className="grid gap-5 xl:grid-cols-2">
            <CareerStrengths strengths={advice.strengths} />
            <SkillsToImprove skills={advice.skillsToImprove} />
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <CareerActionPlan actionPlan={advice.v2.learningRoadmap.length ? advice.v2.learningRoadmap : advice.actionPlan} />
            <RagInsightsPanel ragInsights={advice.ragInsights} ragContext={advice.ragContext} />
          </div>
        </div>
      </details>

      <nav className="flex flex-wrap gap-3" aria-label="Actions apres les conseils">
        <button className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel" type="button" onClick={onAskAnother}>Poser une autre question</button>
        <Link className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink" to={`/student/offers/${offer?.id}`}>Voir l offre</Link>
        <Link className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink" to="/student/cv">Mettre a jour mon CV</Link>
        <Link className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink" to="/student/applications">Mes candidatures</Link>
      </nav>
    </div>
  );
}

export default CareerAdviceResult;
