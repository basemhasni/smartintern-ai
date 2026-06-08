import { CalendarDays, GraduationCap, Mail, MapPin, Target, UserRound } from 'lucide-react';

import SkillBadge from '../common/SkillBadge.jsx';
import { formatDate } from '../../utils/formatters.js';
import { calculateProfileCompletion } from '../../utils/studentDashboard.js';

function ProfileSummaryCard({ student }) {
  const completion = calculateProfileCompletion(student);
  const user = student?.user || {};
  const details = [
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'Objectif', value: student?.targetJob, icon: Target },
    { label: 'Localisation', value: student?.location, icon: MapPin },
    { label: 'Niveau', value: student?.educationLevel, icon: GraduationCap },
    { label: 'Disponibilite', value: student?.availabilityDate ? formatDate(student.availabilityDate) : null, icon: CalendarDays },
  ];

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex items-start gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primarySoft text-primary">
          <UserRound className="h-7 w-7" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Profil etudiant</p>
          <h2 className="mt-1 truncate text-2xl font-black text-ink">
            {user.firstName} {user.lastName}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <SkillBadge tone="primary">{user.role || 'STUDENT'}</SkillBadge>
            <SkillBadge tone={completion.percentage >= 80 ? 'success' : 'ai'}>{completion.percentage}% complete</SkillBadge>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {details.map((detail) => {
          const Icon = detail.icon;

          return (
            <div key={detail.label} className="flex items-start gap-3 rounded-lg bg-canvas px-3 py-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">{detail.label}</p>
                <p className="mt-1 break-words text-sm font-bold text-ink">{detail.value || 'Non renseigne'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ProfileSummaryCard;
