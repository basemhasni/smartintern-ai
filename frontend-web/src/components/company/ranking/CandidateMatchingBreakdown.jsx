import ScoreBadge from '../../common/ScoreBadge.jsx';
import SkillBadge from '../../common/SkillBadge.jsx';
import CandidateComparisonSummary from './CandidateComparisonSummary.jsx';

function SkillsRow({ title, skills, tone, empty }) {
  return (
    <div>
      <p className="text-sm font-black text-ink">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {skills.length ? skills.map((skill) => <SkillBadge key={skill} tone={tone}>{skill}</SkillBadge>) : <span className="text-sm font-bold text-muted">{empty}</span>}
      </div>
    </div>
  );
}

function CandidateMatchingBreakdown({ candidate }) {
  const { matching } = candidate;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Lecture du matching</p>
          <h3 className="mt-2 text-lg font-black text-ink">Pourquoi ce score ?</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Le score reflete uniquement la correspondance entre les informations analysees et l offre.
          </p>
        </div>
        {candidate.hasScore ? <ScoreBadge score={matching.score} label="score" /> : <span className="rounded-full border border-line bg-canvas px-3 py-2 text-sm font-black text-muted">Score non disponible</span>}
      </div>
      <CandidateComparisonSummary matching={matching} />
      <div className="space-y-4">
        <SkillsRow title="Competences correspondantes" skills={matching.matchedSkills} tone="success" empty="Aucune competence commune detectee." />
        <SkillsRow title="Competences a approfondir" skills={matching.missingSkills} tone="danger" empty="Aucune competence manquante retournee." />
        <SkillsRow title="Competences optionnelles presentes" skills={matching.optionalMatchedSkills} tone="ai" empty="Aucune competence optionnelle detectee." />
      </div>
      {matching.explanation ? (
        <p className="rounded-lg bg-canvas p-4 text-sm leading-7 text-muted">{matching.explanation}</p>
      ) : (
        <p className="rounded-lg bg-canvas p-4 text-sm leading-7 text-muted">Le backend n a pas retourne d explication detaillee pour ce matching.</p>
      )}
    </section>
  );
}

export default CandidateMatchingBreakdown;
