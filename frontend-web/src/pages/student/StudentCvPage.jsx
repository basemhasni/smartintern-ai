import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { deleteStudentCv, getStudentCvById, getStudentCvs, uploadStudentCv } from '../../api/studentCvApi.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import CvAnalysisResult from '../../components/student/cv/CvAnalysisResult.jsx';
import CvDeleteDialog from '../../components/student/cv/CvDeleteDialog.jsx';
import CvEmptyState from '../../components/student/cv/CvEmptyState.jsx';
import CvHistoryList from '../../components/student/cv/CvHistoryList.jsx';
import CvUploadProgress from '../../components/student/cv/CvUploadProgress.jsx';
import CvUploadZone, { validateCvFile } from '../../components/student/cv/CvUploadZone.jsx';

const sortCvs = (cvs) => [...cvs].sort((first, second) => new Date(second.uploadedAt) - new Date(first.uploadedAt));

const getReadableError = (error) => {
  if (error.response?.status === 403) {
    return 'FORBIDDEN';
  }

  if (error.response?.status === 404) {
    return 'Ce CV n’existe plus ou ne vous appartient pas.';
  }

  if (!error.response) {
    return 'Impossible de contacter le serveur. Verifiez que le backend et le service IA sont demarres.';
  }

  const message = error.response.data?.message;

  if (error.response.status === 400 && message?.includes('size')) {
    return 'Le fichier depasse la limite autorisee de 5 Mo.';
  }

  if (error.response.status === 400 && message?.includes('format')) {
    return 'Ce fichier n’est pas un PDF ou un document DOCX valide.';
  }

  if (error.response.status === 400 && message?.includes('required')) {
    return 'Aucun fichier n’a ete recu.';
  }

  return message || 'Une erreur est survenue. Veuillez reessayer.';
};

function StudentCvPage() {
  const [cvs, setCvs] = useState([]);
  const [selectedCv, setSelectedCv] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [pageError, setPageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [lastRagIndexed, setLastRagIndexed] = useState(undefined);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [cvToDelete, setCvToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shouldRedirectDenied, setShouldRedirectDenied] = useState(false);

  const loadCvs = useCallback(async () => {
    setIsLoading(true);
    setPageError('');

    try {
      const data = sortCvs(await getStudentCvs());
      setCvs(data);
      setSelectedCv((current) => {
        if (!data.length) return null;
        if (current) return data.find((cv) => cv.id === current.id) || data[0];
        return data[0];
      });
    } catch (error) {
      const readable = getReadableError(error);

      if (readable === 'FORBIDDEN') {
        setShouldRedirectDenied(true);
      } else {
        setPageError(readable);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCvs();
  }, [loadCvs]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timeout = window.setTimeout(() => setSuccessMessage(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const hasCvs = cvs.length > 0;
  const isBusy = isUploading || isDeleting;

  const handleSelectFile = (file) => {
    const validationError = validateCvFile(file);
    setSelectedFile(file);
    setFileError(validationError);
    setPageError('');
    setSuccessMessage('');
  };

  const handleUpload = async () => {
    const validationError = validateCvFile(selectedFile);

    if (validationError) {
      setFileError(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setPageError('');
    setSuccessMessage('');
    setUploadMessage('');

    try {
      const result = await uploadStudentCv(selectedFile, setUploadProgress);
      setUploadProgress(100);
      setSelectedFile(null);
      setUploadMessage(result.message);
      setLastRagIndexed(result.ragIndexed);
      setSuccessMessage(result.analysisFailed ? 'CV importe. Analyse IA incomplete.' : 'CV importe et analyse avec succes.');

      const refreshed = sortCvs(await getStudentCvs());
      setCvs(refreshed);
      setSelectedCv(refreshed.find((cv) => cv.id === result.cv?.id) || result.cv || refreshed[0] || null);
    } catch (error) {
      const readable = getReadableError(error);

      if (readable === 'FORBIDDEN') {
        setShouldRedirectDenied(true);
      } else {
        setPageError(readable);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectCv = async (cv) => {
    setPageError('');

    try {
      const detailedCv = await getStudentCvById(cv.id);
      setSelectedCv(detailedCv);
      setLastRagIndexed(undefined);
      setUploadMessage('');
    } catch (error) {
      const readable = getReadableError(error);
      if (readable === 'FORBIDDEN') setShouldRedirectDenied(true);
      else setPageError(readable);
    }
  };

  const handleConfirmDelete = async () => {
    if (!cvToDelete) return;

    setIsDeleting(true);
    setPageError('');

    try {
      await deleteStudentCv(cvToDelete.id);
      const nextCvs = cvs.filter((cv) => cv.id !== cvToDelete.id);
      setCvs(nextCvs);
      setSelectedCv((current) => {
        if (current?.id !== cvToDelete.id) return current;
        return nextCvs[0] || null;
      });
      setCvToDelete(null);
      setSuccessMessage('CV supprime avec succes.');
    } catch (error) {
      const readable = getReadableError(error);
      if (readable === 'FORBIDDEN') setShouldRedirectDenied(true);
      else setPageError(readable);
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedCvInHistory = useMemo(() => cvs.find((cv) => cv.id === selectedCv?.id) || selectedCv, [cvs, selectedCv]);

  if (shouldRedirectDenied) {
    return <Navigate to="/access-denied" replace />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (pageError && !hasCvs) {
    return <ErrorState title="CV indisponibles" message={pageError} onRetry={loadCvs} />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Documents</p>
            <h1 className="mt-2 text-2xl font-black leading-tight text-ink md:text-3xl">Mon CV</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              Importez votre CV pour permettre a SmartIntern AI d’identifier vos competences et de trouver les offres les plus pertinentes.
            </p>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-primary">Formats acceptes : PDF ou DOCX — 5 Mo maximum</p>
          </div>
          <Link className="inline-flex justify-center rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-panel transition hover:-translate-y-0.5" to="/student/dashboard">
            Retour au dashboard
          </Link>
        </div>
      </section>

      <div aria-live="polite">
        {successMessage ? <p className="rounded-stitch border border-green-100 bg-green-50 p-4 text-sm font-bold text-success">{successMessage}</p> : null}
        {pageError && hasCvs ? <p className="rounded-stitch border border-red-100 bg-red-50 p-4 text-sm font-bold text-danger">{pageError}</p> : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <CvUploadZone
            selectedFile={selectedFile}
            error={fileError}
            disabled={isBusy}
            onSelectFile={handleSelectFile}
            onClearFile={() => {
              setSelectedFile(null);
              setFileError('');
            }}
            onUpload={handleUpload}
          />

          {isUploading ? <CvUploadProgress fileName={selectedFile?.name} progress={uploadProgress} /> : null}

          {selectedCvInHistory ? (
            <CvAnalysisResult cv={selectedCvInHistory} ragIndexed={lastRagIndexed} uploadMessage={uploadMessage} />
          ) : (
            <CvEmptyState
              action={(
                <button className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-black text-white" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  Importer mon premier CV
                </button>
              )}
            />
          )}
        </div>

        <div className="space-y-5">
          {hasCvs ? (
            <CvHistoryList
              cvs={cvs}
              selectedCvId={selectedCv?.id}
              onSelect={handleSelectCv}
              onDelete={setCvToDelete}
            />
          ) : (
            <EmptyState
              title="Aucun CV dans l’historique"
              message="Les CV importes apparaitront ici avec leur statut d’analyse."
            />
          )}
        </div>
      </div>

      <CvDeleteDialog
        cv={cvToDelete}
        isDeleting={isDeleting}
        onCancel={() => setCvToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default StudentCvPage;
