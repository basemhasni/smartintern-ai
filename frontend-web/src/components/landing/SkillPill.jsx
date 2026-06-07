function SkillPill({ children, tone = 'blue' }) {
  const tones = {
    blue: 'bg-primarySoft text-primary',
    violet: 'bg-aiSoft text-ai',
    cyan: 'bg-cyanSoft text-[#08758a]',
    red: 'bg-red-50 text-danger',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.blue}`}>
      {children}
    </span>
  );
}

export default SkillPill;
