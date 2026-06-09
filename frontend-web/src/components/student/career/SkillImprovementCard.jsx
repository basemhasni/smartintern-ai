import SkillBadge from '../../common/SkillBadge.jsx';

function SkillImprovementCard({ item }) {
  const tone = item.priority === 'HIGH' ? 'danger' : item.priority === 'MEDIUM' ? 'ai' : 'default';

  return (
    <article className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-black text-ink">{item.skill}</h3>
        <SkillBadge tone={tone}>{item.priorityLabel}</SkillBadge>
      </div>
      <p className="mt-3 text-sm leading-7 text-muted">{item.reason}</p>
      {item.actions.length ? (
        <ol className="mt-4 space-y-2">
          {item.actions.map((action, index) => (
            <li key={action} className="flex gap-3 rounded-lg bg-canvas px-4 py-3 text-sm font-bold leading-6 text-ink">
              <span className="text-primary">{index + 1}</span>
              <span>{action}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </article>
  );
}

export default SkillImprovementCard;
