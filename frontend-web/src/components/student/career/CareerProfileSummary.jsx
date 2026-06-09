import ScoreBadge from '../../common/ScoreBadge.jsx';

function CareerProfileSummary({ advice, offer }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Synthese</p>
      <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h2 className="text-xl font-black text-ink">Analyse pour {offer?.title || 'l offre selectionnee'}</h2>
          <p className="mt-2 text-sm font-bold text-muted">{offer?.company?.companyName || 'Entreprise non renseignee'}</p>
          <p className="mt-4 text-sm leading-7 text-muted">
            {advice.profileSummary || 'Analyse construite a partir de votre profil actuel.'}
          </p>
        </div>
        <ScoreBadge score={advice.matchingScore} size="lg" label="score" />
      </div>
      <p className="mt-4 text-xs font-bold text-muted">Analyse construite a partir de votre profil actuel. Ce score ne garantit pas une decision de recrutement.</p>
    </section>
  );
}

export default CareerProfileSummary;
