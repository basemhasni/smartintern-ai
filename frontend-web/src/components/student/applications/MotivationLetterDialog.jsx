import { Copy, RefreshCw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import LoadingSkeleton from '../../common/LoadingSkeleton.jsx';
import { formatDate } from '../../../utils/formatters.js';
import GenerateLetterDialog from './GenerateLetterDialog.jsx';
import MotivationLetterEditor from './MotivationLetterEditor.jsx';

function MotivationLetterDialog({
  application,
  letter,
  status,
  error,
  message,
  tone,
  isGenerating,
  isSaving,
  onClose,
  onRetry,
  onToneChange,
  onGenerate,
  onSave,
}) {
  const closeRef = useRef(null);
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    if (!application) return undefined;

    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isGenerating && !isSaving) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [application, isGenerating, isSaving, onClose]);

  if (!application) {
    return null;
  }

  const copyLetter = async () => {
    if (!navigator.clipboard || !letter?.content) {
      setCopyMessage('La copie automatique n’est pas disponible dans ce navigateur.');
      return;
    }

    await navigator.clipboard.writeText(letter.content);
    setCopyMessage('Lettre copiee dans le presse-papiers.');
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="letter-title">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-stitch border border-line bg-white p-6 shadow-stitch">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Lettre de motivation</p>
            <h2 id="letter-title" className="mt-2 text-2xl font-black text-ink">{application.offer.title}</h2>
            <p className="mt-2 text-sm font-bold text-muted">{application.offer.company.companyName}</p>
          </div>
          <button ref={closeRef} className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-ink shadow-panel" type="button" aria-label="Fermer la lettre" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5" aria-live="polite">
          {message ? <p className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-success">{message}</p> : null}
          {copyMessage ? <p className="mt-3 rounded-lg border border-primary/10 bg-primarySoft px-4 py-3 text-sm font-bold text-primary">{copyMessage}</p> : null}
        </div>

        {status === 'loading' ? (
          <div className="mt-5"><LoadingSkeleton /></div>
        ) : null}

        {status === 'error' ? (
          <div className="mt-5 rounded-stitch border border-red-100 bg-red-50 p-5">
            <p className="text-sm font-black text-danger">{error}</p>
            <button className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-black text-danger shadow-panel" type="button" onClick={onRetry}>
              Reessayer
            </button>
          </div>
        ) : null}

        {status === 'empty' ? (
          <div className="mt-5">
            <p className="rounded-stitch border border-line bg-canvas p-5 text-sm leading-7 text-muted">
              Aucune lettre n’a encore ete generee pour cette candidature.
            </p>
            <div className="mt-4">
              <GenerateLetterDialog tone={tone} isGenerating={isGenerating} onToneChange={onToneChange} onGenerate={onGenerate} />
            </div>
          </div>
        ) : null}

        {status === 'ready' && letter ? (
          <div className="mt-5 space-y-5">
            <div className="grid gap-3 rounded-stitch bg-canvas p-4 text-sm sm:grid-cols-3">
              <div>
                <p className="font-black text-ink">Ton</p>
                <p className="text-muted">{letter.tone}</p>
              </div>
              <div>
                <p className="font-black text-ink">Generee par IA</p>
                <p className="text-muted">{letter.generatedByAI ? 'Oui' : 'Non renseigne'}</p>
              </div>
              <div>
                <p className="font-black text-ink">Mise a jour</p>
                <p className="text-muted">{formatDate(letter.updatedAt)}</p>
              </div>
            </div>

            <MotivationLetterEditor letter={letter} isSaving={isSaving} onSave={onSave} />

            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-panel" type="button" onClick={copyLetter}>
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copier le texte
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-canvas px-5 py-3 text-sm font-black text-ink" type="button" disabled={isGenerating} onClick={onGenerate}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Regenerer
              </button>
            </div>

            <GenerateLetterDialog tone={tone} isGenerating={isGenerating} onToneChange={onToneChange} onGenerate={onGenerate} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default MotivationLetterDialog;
