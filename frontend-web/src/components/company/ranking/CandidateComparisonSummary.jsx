function CandidateComparisonSummary({ matching }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-lg bg-green-50 p-3">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-success">Correspondances</p>
        <p className="mt-2 text-2xl font-black text-ink">{matching.matchedSkills.length}</p>
      </div>
      <div className="rounded-lg bg-red-50 p-3">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-danger">A approfondir</p>
        <p className="mt-2 text-2xl font-black text-ink">{matching.missingSkills.length}</p>
      </div>
      <div className="rounded-lg bg-primarySoft p-3">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">Optionnelles</p>
        <p className="mt-2 text-2xl font-black text-ink">{matching.optionalMatchedSkills.length}</p>
      </div>
    </div>
  );
}

export default CandidateComparisonSummary;
