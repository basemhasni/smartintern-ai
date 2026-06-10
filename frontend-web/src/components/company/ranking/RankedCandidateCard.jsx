import { Link } from 'react-router-dom';

import { formatRankDate } from '../../../utils/candidateRanking.js';
import ScoreBadge from '../../common/ScoreBadge.jsx';
import SkillBadge from '../../common/SkillBadge.jsx';
import CompanyStatusCard from '../CompanyStatusCard.jsx';
import CandidateRankBadge from './CandidateRankBadge.jsx';

function Initials({ student }) {
  const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase() || 'C';
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-sm font-black text-white" aria-hidden="true">
      {initials}
    </span>
  );
}

function RankedCandidateCard({ candidate, onOpenDetails, onUpdateStatus }) {
  const topMatched = candidate.matching.matchedSkills.slice(0, 4);
  const topMissing = candidate.matching.missingSkills.slice(0, 2);

  return (
    <article className="rounded-stitch border border-line bg-white p-5 shadow-panel transition hover:-translate-y-0.5 hover:border-primary/30">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 gap-4">
          <CandidateRankBadge rank={candidate.originalRank} />
          <Initials student={candidate.student} />
          <div className="min-w-0">
            <h3 className="text-lg font-black text-ink">{candidate.student.firstName || 'Candidat'} {candidate.student.lastName}</h3>
            <p className="mt-1 text-sm font-bold text-muted">{candidate.student.targetJob || 'Objectif non renseigne'}</p>
            <p className="mt-1 text-xs font-bold text-muted">{candidate.student.educationLevel || 'Niveau non renseigne'} / {candidate.student.location || 'Lieu non renseigne'}</p>
            <p className="mt-2 text-xs font-bold text-muted">Candidature recue le {formatRankDate(candidate.appliedAt)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          {candidate.hasScore ? <ScoreBadge score={candidate.matching.score} /> : <span className="rounded-full border border-line bg-canvas px-3 py-2 text-xs font-black text-muted">Score non disponible</span>}
          <CompanyStatusCard status={candidate.applicationStatus} label={candidate.applicationStatusLabel} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-success">Competences correspondantes</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topMatched.length ? topMatched.map((skill) => <SkillBadge key={skill} tone="success">{skill}</SkillBadge>) : <span className="text-sm font-bold text-muted">Aucune detectee</span>}
          </div>
        </div>
        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-danger">A approfondir</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topMissing.length ? topMissing.map((skill) => <SkillBadge key={skill} tone="danger">{skill}</SkillBadge>) : <span className="text-sm font-bold text-muted">Aucune retournee</span>}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button className="rounded-lg bg-primary px-3 py-2 text-xs font-black text-white shadow-panel" type="button" onClick={() => onOpenDetails(candidate)}>Voir l analyse</button>
        <button className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-black text-ink shadow-panel" type="button" onClick={() => onUpdateStatus(candidate)}>Modifier le statut</button>
        <Link className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-black text-ink shadow-panel" to={`/company/applications?offerId=${candidate.offer.id}`}>Voir dans les candidatures</Link>
        <Link className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-black text-ink shadow-panel" to={`/company/offers/${candidate.offer.id}`}>Voir l offre</Link>
      </div>
    </article>
  );
}

export default RankedCandidateCard;
