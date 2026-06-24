import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';

import { simulateSkillGaps } from '../../api/aiApi.js';
import { getAiErrorMessage } from '../../utils/ai.js';
import AiWarningsPanel from './AiWarningsPanel.jsx';
import AiSectionCard from './AiSectionCard.jsx';

function SkillGapSimulatorPanel({ matching }) {
  const gaps = useMemo(() => matching?.v3?.criticalMissingSkills?.length
    ? matching.v3.criticalMissingSkills
    : matching?.v3?.missingRequiredSkills || matching?.missingSkills || [], [matching]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [mode, setMode] = useState('REALISTIC');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!matching) return null;

  const toggleSkill = (skill) => setSelectedSkills((current) => (
    current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill].slice(0, 3)
  ));

  const runSimulation = async () => {
    setIsLoading(true);
    setError('');
    try {
      setResult(await simulateSkillGaps(matching, selectedSkills, { simulationMode: mode }));
    } catch (requestError) {
      setError(getAiErrorMessage(requestError, 'La simulation n a pas pu etre calculee.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AiSectionCard
      title="Simuler une progression"
      description="Estimez l impact potentiel de vraies nouvelles preuves sur ce matching."
      action={<Sparkles className="h-6 w-6 text-ai" aria-hidden="true" />}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px]">
        <fieldset>
          <legend className="text-sm font-black text-ink">Competences a simuler, jusqu a trois</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {gaps.length ? gaps.slice(0, 8).map((skill) => (
              <label key={skill} className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-black ${selectedSkills.includes(skill) ? 'border-primary bg-primary text-white' : 'border-line bg-white text-ink'}`}>
                <input className="sr-only" type="checkbox" checked={selectedSkills.includes(skill)} onChange={() => toggleSkill(skill)} />{skill}
              </label>
            )) : <p className="text-sm text-muted">Aucun gap obligatoire prioritaire. Le simulateur peut tout de meme analyser les preuves faibles.</p>}
          </div>
        </fieldset>
        <div>
          <label className="text-sm font-black text-ink" htmlFor="simulation-mode">Mode</label>
          <select id="simulation-mode" className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm font-bold" value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="CONSERVATIVE">Prudent</option>
            <option value="REALISTIC">Realiste</option>
            <option value="OPTIMISTIC">Optimiste</option>
          </select>
        </div>
      </div>
      <button className="mt-4 rounded-lg bg-ai px-5 py-3 text-sm font-black text-white shadow-panel disabled:opacity-60" type="button" disabled={isLoading} onClick={runSimulation}>{isLoading ? 'Simulation...' : 'Calculer le score potentiel'}</button>
      {error ? <p className="mt-4 rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-bold text-danger" aria-live="polite">{error}</p> : null}
      {result ? (
        <div className="mt-5 space-y-5 border-t border-line pt-5" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-canvas p-4"><p className="text-xs font-black text-muted">Score actuel</p><p className="mt-2 text-2xl font-black text-ink">{result.currentScore}%</p></div>
            <div className="rounded-lg bg-aiSoft p-4"><p className="text-xs font-black text-ai">Potentiel estime</p><p className="mt-2 text-2xl font-black text-ai">{result.potentialBestScore}%</p></div>
            <div className="rounded-lg bg-green-50 p-4"><p className="text-xs font-black text-success">Gain estime</p><p className="mt-2 text-2xl font-black text-success">+{result.scoreGain}</p></div>
          </div>
          <p className="text-sm leading-6 text-muted">{result.summary}</p>
          {result.recommendedPath.length ? <div><h3 className="text-sm font-black text-ink">Chemin recommande</h3><ol className="mt-3 space-y-3">{result.recommendedPath.map((item) => <li key={item.order} className="rounded-lg border border-line p-4"><p className="font-black text-ink">{item.order}. {item.skill} <span className="text-primary">+{item.expectedGain}</span></p><p className="mt-1 text-xs leading-5 text-muted">{item.recommendedEvidence}</p></li>)}</ol></div> : null}
          {result.recommendedProjects.length ? <div><h3 className="text-sm font-black text-ink">Projet pour produire une preuve</h3>{result.recommendedProjects.map((project) => <article key={project.title} className="mt-3 rounded-lg bg-canvas p-4"><h4 className="font-black text-ink">{project.title}</h4><p className="mt-2 text-sm leading-6 text-muted">{project.description}</p><p className="mt-2 text-xs font-bold text-primary">{project.estimatedTime}</p></article>)}</div> : null}
          <AiWarningsPanel warnings={[...result.warnings, ...result.scoreCapsApplied.map((item) => item.reason), ...result.assumptions]} title="Hypotheses et plafonds" />
        </div>
      ) : null}
    </AiSectionCard>
  );
}

export default SkillGapSimulatorPanel;
