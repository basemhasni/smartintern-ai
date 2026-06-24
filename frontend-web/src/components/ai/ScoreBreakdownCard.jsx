import AiEmptyState from './AiEmptyState.jsx';
import AiSectionCard from './AiSectionCard.jsx';

const labels = {
  criticalSkills: 'Competences critiques',
  requiredSkills: 'Competences obligatoires',
  optionalSkills: 'Competences optionnelles',
  evidenceQuality: 'Qualite des preuves',
  domainAlignment: 'Alignement domaine',
  seniorityAlignment: 'Alignement niveau',
  cvQuality: 'Qualite du CV',
  rawTotal: 'Total brut',
  total: 'Score final',
};

function ScoreBreakdownCard({ breakdown }) {
  const entries = Object.entries(breakdown || {}).filter(([, value]) => Number.isFinite(Number(value)));
  return (
    <AiSectionCard title="Detail du score" description="Contribution des differents signaux au resultat final.">
      {!entries.length ? <AiEmptyState message="Le backend n a pas retourne la decomposition du score." /> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map(([key, value]) => (
            <div key={key} className="rounded-lg bg-canvas p-3">
              <div className="flex items-center justify-between gap-3 text-sm"><span className="font-bold text-muted">{labels[key] || key}</span><strong className="text-ink">{Number(value).toFixed(Number(value) % 1 ? 1 : 0)}</strong></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, Number(value)))}%` }} /></div>
            </div>
          ))}
        </div>
      )}
    </AiSectionCard>
  );
}

export default ScoreBreakdownCard;
