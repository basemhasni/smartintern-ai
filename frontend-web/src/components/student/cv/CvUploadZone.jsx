import { FileCheck2, UploadCloud, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { formatFileSize } from '../../../utils/formatters.js';

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const allowedExtensions = ['.pdf', '.docx'];
const maxFileSize = 5 * 1024 * 1024;

const getExtension = (fileName = '') => {
  const index = fileName.lastIndexOf('.');
  return index === -1 ? '' : fileName.slice(index).toLowerCase();
};

export const validateCvFile = (file) => {
  if (!file) {
    return 'Selectionnez un CV avant de lancer l’analyse.';
  }

  const extension = getExtension(file.name);
  const hasValidExtension = allowedExtensions.includes(extension);
  const hasValidMime = !file.type || allowedMimeTypes.includes(file.type);

  if (!hasValidExtension || !hasValidMime) {
    return 'Ce format n’est pas accepte. Importez un fichier PDF ou DOCX.';
  }

  if (file.size > maxFileSize) {
    return 'Le fichier depasse la limite autorisee de 5 Mo.';
  }

  return '';
};

function CvUploadZone({ selectedFile, error, disabled, onSelectFile, onClearFile, onUpload }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const openFileDialog = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleFile = (file) => {
    if (file) {
      onSelectFile(file);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFileDialog();
    }
  };

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Analyse CV</p>
          <h2 className="mt-2 text-xl font-black text-ink">Importer un nouveau CV</h2>
          <p id="cv-upload-help" className="mt-2 text-sm leading-6 text-muted">Formats acceptes : PDF ou DOCX. Taille maximale : 5 Mo.</p>
        </div>
      </div>

      <div
        className={`mt-5 cursor-pointer rounded-stitch border-2 border-dashed p-7 text-center transition focus:outline-none focus:ring-4 focus:ring-primary/10 ${
          isDragging ? 'border-primary bg-primarySoft' : selectedFile ? 'border-ai bg-aiSoft/40' : error ? 'border-danger bg-red-50' : 'border-line bg-canvas'
        } ${disabled ? 'cursor-not-allowed opacity-70' : 'hover:border-primary hover:bg-primarySoft/60'}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-describedby={error ? 'cv-upload-error cv-upload-help' : 'cv-upload-help'}
        aria-disabled={disabled}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFile(event.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          disabled={disabled}
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-primary shadow-panel">
          {selectedFile ? <FileCheck2 className="h-7 w-7" aria-hidden="true" /> : <UploadCloud className="h-7 w-7" aria-hidden="true" />}
        </span>
        <h3 className="mt-4 text-lg font-black text-ink">{selectedFile ? 'Pret pour l’analyse' : 'Deposez votre CV ici'}</h3>
        <p className="mt-2 text-sm text-muted">{selectedFile ? selectedFile.name : 'ou cliquez pour selectionner un fichier PDF ou DOCX'}</p>
        {selectedFile ? <p className="mt-1 text-sm font-bold text-primary">{formatFileSize(selectedFile.size)}</p> : null}
      </div>

      {error ? <p id="cv-upload-error" className="mt-3 text-sm font-bold text-danger" aria-live="polite">{error}</p> : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex justify-center rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          disabled={disabled}
          onClick={selectedFile ? onUpload : openFileDialog}
        >
          {selectedFile ? 'Analyser mon CV' : 'Choisir un fichier'}
        </button>
        {selectedFile ? (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-panel"
            type="button"
            disabled={disabled}
            onClick={onClearFile}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Retirer le fichier
          </button>
        ) : null}
      </div>
    </section>
  );
}

export default CvUploadZone;
