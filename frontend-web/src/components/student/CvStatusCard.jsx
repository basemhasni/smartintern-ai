import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

import EmptyState from '../common/EmptyState.jsx';
import SkillBadge from '../common/SkillBadge.jsx';
import { formatDate, formatFileSize } from '../../utils/formatters.js';
import { getCvAnalysis, getCvSkills } from '../../utils/studentDashboard.js';

function CvStatusCard({ latestCv }) {
  if (!latestCv) {
    return (
      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <EmptyState
          icon={FileText}
          title="Votre CV est la premiere etape du matching."
          message="Importez un CV PDF ou DOCX pour obtenir des recommandations basees sur vos competences."
          action={(
            <Link className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-black text-white" to="/student/cv">
              Importer mon CV
            </Link>
          )}
        />
      </section>
    );
  }

  const analysis = getCvAnalysis(latestCv);
  const skills = getCvSkills(latestCv);

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Document</p>
          <h2 className="mt-2 text-xl font-black text-ink">CV le plus recent</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${skills.length ? 'bg-green-50 text-success' : 'bg-amber-50 text-amber-700'}`}>
          {skills.length ? 'Analyse IA disponible' : 'Analyse indisponible'}
        </span>
      </div>

      <div className="mt-5 rounded-stitch bg-canvas p-4">
        <p className="font-black text-ink">{latestCv.fileName}</p>
        <dl className="mt-3 grid gap-3 text-sm text-muted sm:grid-cols-3">
          <div>
            <dt className="font-bold text-ink">Upload</dt>
            <dd>{formatDate(latestCv.uploadedAt)}</dd>
          </div>
          <div>
            <dt className="font-bold text-ink">Type</dt>
            <dd>{latestCv.fileType || 'Inconnu'}</dd>
          </div>
          <div>
            <dt className="font-bold text-ink">Taille</dt>
            <dd>{formatFileSize(latestCv.fileSize)}</dd>
          </div>
        </dl>
      </div>

      {analysis?.experienceLevel ? (
        <p className="mt-4 text-sm text-muted">Niveau detecte : <strong className="text-ink">{analysis.experienceLevel}</strong></p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.length ? skills.slice(0, 8).map((skill) => (
          <SkillBadge key={skill} tone="ai">{skill}</SkillBadge>
        )) : <p className="text-sm text-muted">Aucune competence exploitable n'a encore ete detectee.</p>}
      </div>
    </section>
  );
}

export default CvStatusCard;
