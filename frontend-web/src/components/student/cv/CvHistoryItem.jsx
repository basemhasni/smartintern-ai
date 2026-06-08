import { Eye, Trash2 } from 'lucide-react';

import SkillBadge from '../../common/SkillBadge.jsx';
import { formatDate, formatFileSize } from '../../../utils/formatters.js';
import { getCvSkills, hasValidCvAnalysis } from '../../../utils/studentDashboard.js';

function CvHistoryItem({ cv, isLatest, isSelected, onSelect, onDelete }) {
  const skillsCount = getCvSkills(cv).length;
  const analyzed = hasValidCvAnalysis(cv);

  return (
    <article className={`rounded-stitch border p-4 transition ${isSelected ? 'border-primary bg-primarySoft/40' : 'border-line bg-white hover:border-primary/40'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-sm font-black text-ink">{cv.fileName}</h3>
            {isLatest ? <SkillBadge tone="primary">CV le plus recent</SkillBadge> : null}
          </div>
          <p className="mt-2 text-sm text-muted">{formatDate(cv.uploadedAt)} / {formatFileSize(cv.fileSize)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <SkillBadge tone={analyzed ? 'success' : 'default'}>{analyzed ? 'Analyse' : 'Non analyse'}</SkillBadge>
            <SkillBadge>{skillsCount} competence(s)</SkillBadge>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-black text-ink shadow-panel transition hover:text-primary"
            type="button"
            onClick={() => onSelect(cv)}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Voir
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-black text-danger shadow-panel transition hover:-translate-y-0.5"
            type="button"
            onClick={() => onDelete(cv)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Supprimer
          </button>
        </div>
      </div>
    </article>
  );
}

export default CvHistoryItem;
