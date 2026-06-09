import { Link } from 'react-router-dom';

import SkillBadge from '../common/SkillBadge.jsx';
import ScoreBadge from '../common/ScoreBadge.jsx';

function CompanyTopCandidates({ candidates, offer, error }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Classement IA</p>
          <h2 className="mt-2 text-xl font-black text-ink">Candidats les plus compatibles</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{offer ? `Apercu pour : ${offer.title}` : 'Selectionnez une offre avec candidatures pour obtenir un classement.'}</p>
        </div>
        <Link className="text-sm font-black text-primary hover:underline" to="/company/candidate-ranking">
          Voir le classement
        </Link>
      </div>

      {error ? (
        <p className="mt-5 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{error}</p>
      ) : null}

      {!error && candidates.length ? (
        <div className="mt-5 space-y-4">
          {candidates.slice(0, 3).map((candidate) => (
            <article key={candidate.applicationId} className="rounded-stitch border border-line bg-canvas/60 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Rang {candidate.rank}</p>
                  <h3 className="mt-1 font-black text-ink">{candidate.student.firstName} {candidate.student.lastName}</h3>
                  <p className="mt-1 text-sm font-bold text-muted">{candidate.student.targetJob || candidate.student.educationLevel || 'Profil etudiant'}</p>
                  <p className="mt-1 text-xs font-bold text-muted">{candidate.student.location || 'Localisation non renseignee'}</p>
                </div>
                <ScoreBadge score={candidate.matching.score} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {candidate.matching.matchedSkills.slice(0, 3).map((skill) => <SkillBadge key={skill} tone="success">{skill}</SkillBadge>)}
                {candidate.matching.missingSkills[0] ? <SkillBadge tone="danger">{candidate.matching.missingSkills[0]}</SkillBadge> : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!error && !candidates.length ? (
        <p className="mt-5 rounded-lg bg-canvas px-4 py-3 text-sm font-bold text-muted">Les candidats apparaitront ici apres reception des candidatures.</p>
      ) : null}

      <p className="mt-5 text-xs font-bold leading-5 text-muted">
        Le classement est une aide a la decision basee sur les competences. Il ne remplace pas l evaluation du recruteur.
      </p>
    </section>
  );
}

export default CompanyTopCandidates;
