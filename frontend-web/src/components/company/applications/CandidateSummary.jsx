const getInitials = (student) => `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase() || 'SI';

function CandidateSummary({ student }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-sm font-black text-white shadow-panel">
        {getInitials(student)}
      </span>
      <div className="min-w-0">
        <h3 className="font-black text-ink">{student.firstName || 'Candidat'} {student.lastName || ''}</h3>
        <p className="mt-1 text-sm font-bold text-muted">{student.targetJob || student.educationLevel || 'Profil etudiant'}</p>
        <p className="mt-1 text-xs font-bold text-muted">{student.location || 'Localisation non renseignee'}</p>
      </div>
    </div>
  );
}

export default CandidateSummary;
