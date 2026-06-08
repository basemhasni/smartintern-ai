function SkillBadge({ children, tone = 'default' }) {
  const tones = {
    default: 'border-line bg-white text-ink',
    primary: 'border-primary/15 bg-primarySoft text-primary',
    ai: 'border-ai/15 bg-aiSoft text-ai',
    danger: 'border-danger/15 bg-red-50 text-danger',
    success: 'border-success/15 bg-green-50 text-success',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${tones[tone] || tones.default}`}>
      {children}
    </span>
  );
}

export default SkillBadge;
