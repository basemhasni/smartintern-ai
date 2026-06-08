import { Link } from 'react-router-dom';

import SkillBadge from '../common/SkillBadge.jsx';
import { calculateProfileCompletion } from '../../utils/studentDashboard.js';

function ProfileCompletionCard({ student }) {
  const completion = calculateProfileCompletion(student);

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Profil</p>
          <h2 className="mt-2 text-xl font-black text-ink">Completion du profil</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Estimation locale basee sur les champs utiles au matching.
          </p>
        </div>
        <div className="grid h-20 w-20 place-items-center rounded-full text-center" style={{ background: `conic-gradient(from 18deg, #0f5bd7 0 ${completion.percentage}%, #e9edff ${completion.percentage}% 100%)` }}>
          <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-lg font-black text-primary shadow-panel">
            {completion.percentage}%
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-black text-ink">Champs renseignes</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {completion.filledFields.length ? completion.filledFields.map((field) => (
            <SkillBadge key={field} tone="success">{field}</SkillBadge>
          )) : <p className="text-sm text-muted">Aucun champ optionnel n'est encore complete.</p>}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-black text-ink">A completer</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {completion.missingFields.length ? completion.missingFields.map((field) => (
            <SkillBadge key={field}>{field}</SkillBadge>
          )) : <p className="text-sm text-muted">Votre profil contient les informations principales.</p>}
        </div>
      </div>

      <Link className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-black text-white shadow-panel transition hover:-translate-y-0.5" to="/student/profile">
        Completer mon profil
      </Link>
    </section>
  );
}

export default ProfileCompletionCard;
