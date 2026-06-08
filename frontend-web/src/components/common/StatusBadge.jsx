import { getApplicationStatusLabel } from '../../utils/formatters.js';

function StatusBadge({ status }) {
  const tones = {
    SENT: 'border-primary/15 bg-primarySoft text-primary',
    PENDING: 'border-warning/20 bg-amber-50 text-amber-700',
    ACCEPTED: 'border-success/20 bg-green-50 text-success',
    REJECTED: 'border-danger/20 bg-red-50 text-danger',
    CANCELLED: 'border-line bg-slate-50 text-muted',
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${tones[status] || tones.CANCELLED}`}>
      {getApplicationStatusLabel(status)}
    </span>
  );
}

export default StatusBadge;
