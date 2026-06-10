function AdminStatusBadge({ tone = 'default', children }) {
  const tones = {
    active: 'border-green-100 bg-green-50 text-success',
    inactive: 'border-red-100 bg-red-50 text-danger',
    pending: 'border-amber-100 bg-amber-50 text-amber-700',
    primary: 'border-primary/15 bg-primarySoft text-primary',
    muted: 'border-line bg-slate-50 text-muted',
    danger: 'border-red-100 bg-red-50 text-danger',
    default: 'border-line bg-white text-ink',
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${tones[tone] || tones.default}`}>
      {children}
    </span>
  );
}

export default AdminStatusBadge;
