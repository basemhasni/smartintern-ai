import { BriefcaseBusiness, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import EmptyState from '../common/EmptyState.jsx';
import ErrorState from '../common/ErrorState.jsx';
import ScoreBadge from '../common/ScoreBadge.jsx';
import SkillBadge from '../common/SkillBadge.jsx';
import { toArray } from '../../utils/formatters.js';
import { getRecommendationScore } from '../../utils/studentDashboard.js';

function RecommendedOffersPreview({ recommendations, latestCv, error, onRetry }) {
  if (error) {
    return <ErrorState title="Recommandations indisponibles" message={error} onRetry={onRetry} />;
  }

  if (!recommendations.length) {
    const message = latestCv
      ? 'Aucune recommandation disponible pour le moment. Verifiez que le service IA et des offres publiees existent.'
      : 'Importez et analysez votre CV pour generer vos premieres recommandations.';

    return (
      <EmptyState
        icon={BriefcaseBusiness}
        title="Aucune recommandation a afficher"
        message={message}
        action={<Link className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-black text-white" to="/student/cv">Preparer mon CV</Link>}
      />
    );
  }

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Matching IA</p>
          <h2 className="mt-2 text-xl font-black text-ink">Meilleures recommandations</h2>
        </div>
        <Link className="text-sm font-black text-primary hover:underline" to="/student/offers">
          Voir toutes les offres
        </Link>
      </div>

      <div className="mt-5 space-y-4">
        {recommendations.slice(0, 3).map((recommendation) => {
          const offer = recommendation.offer || {};
          const matching = recommendation.matching || {};
          const matchedSkills = toArray(matching.matchedSkills);
          const missingSkills = toArray(matching.missingSkills);

          return (
            <article key={offer.id} className="flex flex-col gap-4 rounded-stitch border border-line bg-canvas/60 p-4 md:flex-row md:items-center">
              <ScoreBadge score={getRecommendationScore(recommendation)} />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-black text-ink">{offer.title || 'Offre sans titre'}</h3>
                <p className="mt-1 text-sm text-muted">{offer.company?.companyName || 'Entreprise non renseignee'}</p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>{offer.location || 'Lieu non renseigne'}</span>
                  <span aria-hidden="true">/</span>
                  <span>{offer.duration || 'Duree non renseignee'}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {matchedSkills.slice(0, 3).map((skill) => (
                    <SkillBadge key={skill} tone="success">{skill}</SkillBadge>
                  ))}
                  {missingSkills.slice(0, 2).map((skill) => (
                    <SkillBadge key={skill} tone="danger">{skill} a travailler</SkillBadge>
                  ))}
                </div>
              </div>
              <Link className="inline-flex justify-center rounded-lg border border-line bg-white px-4 py-2 text-sm font-black text-ink shadow-panel transition hover:-translate-y-0.5 hover:text-primary" to="/student/offers">
                Voir l'offre
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RecommendedOffersPreview;
