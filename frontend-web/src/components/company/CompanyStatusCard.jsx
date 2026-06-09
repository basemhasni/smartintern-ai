function CompanyStatusCard({ status, label }) {
  const tones = {
    PENDING: 'border-amber-100 bg-amber-50 text-amber-700',
    VALIDATED: 'border-green-100 bg-green-50 text-success',
    REJECTED: 'border-red-100 bg-red-50 text-danger',
    SUSPENDED: 'border-line bg-slate-50 text-muted',
    DRAFT: 'border-line bg-slate-50 text-muted',
    PUBLISHED: 'border-primary/15 bg-primarySoft text-primary',
    ARCHIVED: 'border-line bg-slate-50 text-muted',
    CLOSED: 'border-red-100 bg-red-50 text-danger',
    SENT: 'border-primary/15 bg-primarySoft text-primary',
    ACCEPTED: 'border-green-100 bg-green-50 text-success',
    CANCELLED: 'border-line bg-slate-50 text-muted',
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${tones[status] || tones.DRAFT}`}>
      {label || status || 'Statut inconnu'}
    </span>
  );
}

export default CompanyStatusCard;
