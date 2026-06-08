import { useCallback, useEffect, useMemo, useState } from 'react';

import { getStudentApplications } from '../../api/applicationsApi.js';
import { generateMotivationLetter, getMotivationLetter, updateMotivationLetter } from '../../api/motivationLettersApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import ApplicationDetailsPanel from '../../components/student/applications/ApplicationDetailsPanel.jsx';
import ApplicationsEmptyState from '../../components/student/applications/ApplicationsEmptyState.jsx';
import ApplicationsFilters from '../../components/student/applications/ApplicationsFilters.jsx';
import ApplicationsHeader from '../../components/student/applications/ApplicationsHeader.jsx';
import ApplicationsList from '../../components/student/applications/ApplicationsList.jsx';
import ApplicationsStats from '../../components/student/applications/ApplicationsStats.jsx';
import MotivationLetterDialog from '../../components/student/applications/MotivationLetterDialog.jsx';
import { filterAndSortApplications, getLetterErrorMessage, normalizeApplications } from '../../utils/applications.js';

const defaultFilters = {
  query: '',
  status: 'ALL',
  sort: 'recent',
};

const getPageError = (error) => {
  if (!error.response) {
    return 'Impossible de charger vos candidatures. Verifiez que le backend est demarre.';
  }

  return error.response.data?.message || 'Impossible de charger vos candidatures.';
};

function StudentApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [letterApplication, setLetterApplication] = useState(null);
  const [letter, setLetter] = useState(null);
  const [letterStatus, setLetterStatus] = useState('idle');
  const [letterError, setLetterError] = useState('');
  const [letterMessage, setLetterMessage] = useState('');
  const [tone, setTone] = useState('PROFESSIONAL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingLetter, setIsSavingLetter] = useState(false);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setPageError('');

    try {
      const data = normalizeApplications(await getStudentApplications());
      setApplications(data);
      setSelectedApplication((current) => {
        if (!data.length) return null;
        if (current) return data.find((application) => application.id === current.id) || data[0];
        return data[0];
      });
    } catch (error) {
      setPageError(getPageError(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  useEffect(() => {
    if (!letterMessage) return undefined;
    const timeout = window.setTimeout(() => setLetterMessage(''), 4000);
    return () => window.clearTimeout(timeout);
  }, [letterMessage]);

  const filteredApplications = useMemo(() => filterAndSortApplications(applications, filters), [applications, filters]);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const openLetter = async (application) => {
    setLetterApplication(application);
    setLetter(null);
    setLetterError('');
    setLetterMessage('');
    setLetterStatus('loading');

    try {
      const nextLetter = await getMotivationLetter(application.id);
      setLetter(nextLetter);
      setTone(nextLetter.tone || 'PROFESSIONAL');
      setLetterStatus('ready');
    } catch (error) {
      const readable = getLetterErrorMessage(error);

      if (readable === 'NO_LETTER') {
        setLetterStatus('empty');
      } else {
        setLetterStatus('error');
        setLetterError(readable);
      }
    }
  };

  const generateLetter = async () => {
    if (!letterApplication) return;

    setIsGenerating(true);
    setLetterError('');
    setLetterMessage('');

    try {
      const generated = await generateMotivationLetter(letterApplication.id, { tone });
      setLetter(generated);
      setLetterStatus('ready');
      setLetterMessage('Lettre generee avec succes.');
    } catch (error) {
      setLetterStatus(letter ? 'ready' : 'error');
      setLetterError(getLetterErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  };

  const saveLetter = async (content) => {
    if (!letterApplication) return;

    setIsSavingLetter(true);
    setLetterError('');
    setLetterMessage('');

    try {
      const updated = await updateMotivationLetter(letterApplication.id, { content });
      setLetter(updated);
      setLetterStatus('ready');
      setLetterMessage('Lettre mise a jour avec succes.');
    } catch (error) {
      setLetterError(getLetterErrorMessage(error));
    } finally {
      setIsSavingLetter(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (pageError) {
    return <ErrorState title="Candidatures indisponibles" message={pageError} onRetry={loadApplications} />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <ApplicationsHeader />
      <ApplicationsStats applications={applications} />

      {!applications.length ? (
        <ApplicationsEmptyState />
      ) : (
        <>
          <ApplicationsFilters
            filters={filters}
            resultCount={filteredApplications.length}
            totalCount={applications.length}
            onChange={handleFilterChange}
            onReset={() => setFilters(defaultFilters)}
          />

          {filteredApplications.length ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
              <ApplicationsList
                applications={filteredApplications}
                selectedApplicationId={selectedApplication?.id}
                onSelect={setSelectedApplication}
                onOpenLetter={openLetter}
              />
              <ApplicationDetailsPanel application={selectedApplication} onOpenLetter={openLetter} />
            </div>
          ) : (
            <ApplicationsEmptyState variant="filters" onReset={() => setFilters(defaultFilters)} />
          )}
        </>
      )}

      <MotivationLetterDialog
        application={letterApplication}
        letter={letter}
        status={letterStatus}
        error={letterError}
        message={letterMessage}
        tone={tone}
        isGenerating={isGenerating}
        isSaving={isSavingLetter}
        onClose={() => {
          setLetterApplication(null);
          setLetter(null);
          setLetterStatus('idle');
          setLetterError('');
          setLetterMessage('');
        }}
        onRetry={() => openLetter(letterApplication)}
        onToneChange={setTone}
        onGenerate={generateLetter}
        onSave={saveLetter}
      />
    </div>
  );
}

export default StudentApplicationsPage;
