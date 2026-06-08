import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import SkillBadge from '../../common/SkillBadge.jsx';
import CvSkillsSection from './CvSkillsSection.jsx';
import CvSummaryCard from './CvSummaryCard.jsx';
import { getCvAnalysis, getCvSkills, getExperienceLevelLabel, getParsedTextPreview } from '../../../utils/studentDashboard.js';

function CvAnalysisResult({ cv, ragIndexed, uploadMessage }) {
  const [showExtractedText, setShowExtractedText] = useState(false);
  const analysis = getCvAnalysis(cv);
  const skills = getCvSkills(cv);
  const preview = getParsedTextPreview(cv?.parsedText);
  const analysisFailed = Boolean(analysis?.error) || uploadMessage?.includes('AI analysis failed');

  return (
    <div className="space-y-5">
      {analysisFailed ? (
        <div className="rounded-stitch border border-amber-100 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-800" role="status">
          Votre CV a bien ete importe, mais l’analyse IA n’a pas pu etre terminee. Vous pourrez reessayer plus tard.
        </div>
      ) : null}

      <CvSummaryCard cv={cv} analysis={analysis} ragIndexed={ragIndexed} />

      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-aiSoft text-ai">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Profil IA</p>
            <h2 className="mt-2 text-xl font-black text-ink">Analyse des competences</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_220px]">
          <CvSkillsSection skills={skills} />
          <div className="rounded-stitch bg-canvas p-4">
            <p className="text-sm font-black text-ink">Niveau d'experience</p>
            <p className="mt-3 text-2xl font-black text-primary">{getExperienceLevelLabel(analysis?.experienceLevel)}</p>
            <p className="mt-2 text-xs font-bold leading-5 text-muted">Estimation automatique basee sur le contenu du CV.</p>
          </div>
        </div>

        {preview ? (
          <div className="mt-5 rounded-stitch border border-line bg-canvas p-4">
            <button
              className="flex w-full items-center justify-between gap-3 text-left text-sm font-black text-ink"
              type="button"
              onClick={() => setShowExtractedText((current) => !current)}
              aria-expanded={showExtractedText}
            >
              Voir un apercu du texte extrait
              {showExtractedText ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
            </button>
            {showExtractedText ? <p className="mt-3 text-sm leading-7 text-muted">{preview}</p> : null}
          </div>
        ) : null}
      </section>

      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Prochaine etape</p>
        <h2 className="mt-2 text-xl font-black text-ink">Transformez cette analyse en opportunites</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <SkillBadge tone="primary">Matching explicable</SkillBadge>
          <SkillBadge tone="ai">Recommandations</SkillBadge>
          <SkillBadge>Profil enrichi</SkillBadge>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link className="inline-flex justify-center rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel" to="/student/offers">
            Voir mes recommandations
          </Link>
          <Link className="inline-flex justify-center rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-panel" to="/student/profile">
            Completer mon profil
          </Link>
        </div>
      </section>
    </div>
  );
}

export default CvAnalysisResult;
