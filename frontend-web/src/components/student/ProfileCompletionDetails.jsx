import { Link } from 'react-router-dom';

import SkillBadge from '../common/SkillBadge.jsx';
import { calculateProfileCompletion } from '../../utils/studentDashboard.js';

function ProfileCompletionDetails({ student }) {
  const completion = calculateProfileCompletion(student);

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Matching IA</p>
      <h2 className="mt-2 text-xl font-black text-ink">Qualite du signal profil</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Plus les champs utiles sont precis, plus les recommandations et conseils peuvent etre contextualises.
      </p>

      <div className="mt-5 flex items-center gap-4">
        <div className="grid h-24 w-24 place-items-center rounded-full" style={{ background: `conic-gradient(from 18deg, #6d36e8 0 ${completion.percentage}%, #e9edff ${completion.percentage}% 100%)` }}>
          <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-white text-xl font-black text-ink shadow-panel">
            {completion.percentage}%
          </div>
        </div>
        <div>
          <p className="text-sm font-black text-ink">{completion.filledFields.length} champ(s) renseignes</p>
          <p className="mt-1 text-sm text-muted">{completion.missingFields.length} champ(s) a completer</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-black text-ink">A completer</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {completion.missingFields.length ? completion.missingFields.map((field) => (
            <SkillBadge key={field}>{field}</SkillBadge>
          )) : <SkillBadge tone="success">Profil complet</SkillBadge>}
        </div>
      </div>

      <Link className="mt-6 inline-flex text-sm font-black text-primary hover:underline" to="/student/dashboard">
        Retour au dashboard
      </Link>
    </section>
  );
}

export default ProfileCompletionDetails;
