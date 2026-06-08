import { DatabaseZap, FileText, Sparkles } from 'lucide-react';

import { formatDate, formatFileSize } from '../../../utils/formatters.js';

function CvSummaryCard({ cv, analysis, ragIndexed }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">CV selectionne</p>
          <h2 className="mt-2 text-xl font-black text-ink">{cv.fileName}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${analysis?.error ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-success'}`}>
          {analysis?.error ? 'Analyse incomplete' : 'Analyse disponible'}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-canvas p-3">
          <dt className="flex items-center gap-2 font-black text-ink"><FileText className="h-4 w-4 text-primary" aria-hidden="true" /> Type</dt>
          <dd className="mt-1 text-muted">{cv.fileType || 'Inconnu'}</dd>
        </div>
        <div className="rounded-lg bg-canvas p-3">
          <dt className="font-black text-ink">Taille</dt>
          <dd className="mt-1 text-muted">{formatFileSize(cv.fileSize)}</dd>
        </div>
        <div className="rounded-lg bg-canvas p-3">
          <dt className="font-black text-ink">Upload</dt>
          <dd className="mt-1 text-muted">{formatDate(cv.uploadedAt)}</dd>
        </div>
      </dl>

      <div className="mt-5 rounded-stitch border border-ai/10 bg-aiSoft/50 p-4">
        <p className="flex items-center gap-2 text-sm font-black text-ai"><Sparkles className="h-4 w-4" aria-hidden="true" /> Ce que SmartIntern AI comprend de votre profil</p>
        <p className="mt-2 text-sm leading-7 text-muted">
          {analysis?.summary || 'Le resume IA n’est pas encore disponible.'}
        </p>
      </div>

      {ragIndexed !== undefined ? (
        <div className="mt-4 flex items-start gap-3 rounded-stitch bg-canvas p-4">
          <DatabaseZap className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
          <p className="text-sm leading-6 text-muted">
            {ragIndexed ? 'CV pret pour la recherche intelligente.' : 'L’indexation avancee pourra etre completee ulterieurement.'}
          </p>
        </div>
      ) : null}
    </section>
  );
}

export default CvSummaryCard;
