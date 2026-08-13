import * as DocumentPicker from 'expo-document-picker';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ApiError, normalizeApiError } from '@/core/api/apiError';
import type { StudentProfile } from '@/features/student/models/studentProfile';
import { cvApi } from '../api/cvApi';
import { profileApi } from '../api/profileApi';
import type { CvDocument, SelectedCvFile } from '../models/cvDocument';
import type { StudentProfileUpdate } from '../models/profileUpdate';
import { CV_MIME_TYPES, validateCvFile } from '../utils/validateCvFile';

export type UploadPhase = 'IDLE' | 'SELECTED' | 'UPLOADING_AND_ANALYZING' | 'SUCCESS' | 'ANALYSIS_FAILED';

type StudentProfileContextValue = {
  profile: StudentProfile | null;
  cvs: CvDocument[];
  latestCv: CvDocument | null;
  selectedFile: SelectedCvFile | null;
  revision: number;
  uploadPhase: UploadPhase;
  isLoading: boolean;
  isSavingProfile: boolean;
  isSelectingFile: boolean;
  isUploading: boolean;
  isDeleting: boolean;
  error: string | null;
  uploadError: string | null;
  successMessage: string | null;
  refresh: () => Promise<void>;
  updateProfile: (payload: StudentProfileUpdate) => Promise<boolean>;
  selectCvFile: () => Promise<void>;
  clearSelectedFile: () => void;
  uploadCv: () => Promise<CvDocument | null>;
  deleteCv: (cvId: string) => Promise<boolean>;
  loadCv: (cvId: string) => Promise<CvDocument | null>;
  clearMessages: () => void;
};

const StudentProfileContext = createContext<StudentProfileContextValue | null>(null);

export function StudentProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [cvs, setCvs] = useState<CvDocument[]>([]);
  const [selectedFile, setSelectedFile] = useState<SelectedCvFile | null>(null);
  const [revision, setRevision] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('IDLE');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSelectingFile, setIsSelectingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const mounted = useRef(true);
  const uploading = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const [profileResult, cvsResult] = await Promise.allSettled([profileApi.getMyProfile(), cvApi.getMyCvs()]);
    if (!mounted.current) return;
    if (profileResult.status === 'fulfilled') setProfile(profileResult.value);
    else if (profileResult.reason instanceof ApiError && profileResult.reason.status === 404) setProfile(null);
    else setError(normalizeApiError(profileResult.reason));
    if (cvsResult.status === 'fulfilled') setCvs(cvsResult.value);
    else setError((current) => current ?? normalizeApiError(cvsResult.reason));
    setIsLoading(false);
  }, []);

  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); }, [load]);

  const updateProfile = useCallback(async (payload: StudentProfileUpdate) => {
    setIsSavingProfile(true); setError(null); setSuccessMessage(null);
    try {
      const updated = await profileApi.updateMyProfile(payload);
      setProfile(updated); setRevision((value) => value + 1); setSuccessMessage('Profil mis a jour avec succes.');
      return true;
    } catch (requestError) { setError(normalizeApiError(requestError)); return false; }
    finally { setIsSavingProfile(false); }
  }, []);

  const selectCvFile = useCallback(async () => {
    setIsSelectingFile(true); setUploadError(null); setSuccessMessage(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: [...CV_MIME_TYPES], multiple: false, copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      const file: SelectedCvFile = { uri: asset.uri, name: asset.name, mimeType: asset.mimeType, size: asset.size, file: asset.file };
      const validationError = validateCvFile(file);
      setSelectedFile(file); setUploadPhase('SELECTED'); setUploadError(validationError);
    } catch (pickerError) { setUploadError(pickerError instanceof Error ? pickerError.message : 'Impossible d ouvrir le selecteur de documents.'); }
    finally { setIsSelectingFile(false); }
  }, []);

  const clearSelectedFile = useCallback(() => { setSelectedFile(null); setUploadPhase('IDLE'); setUploadError(null); }, []);

  const uploadCv = useCallback(async () => {
    if (uploading.current) return null;
    const validationError = validateCvFile(selectedFile);
    if (validationError || !selectedFile) { setUploadError(validationError); return null; }
    uploading.current = true; setIsUploading(true); setUploadPhase('UPLOADING_AND_ANALYZING'); setUploadError(null); setSuccessMessage(null);
    try {
      const result = await cvApi.upload(selectedFile);
      setCvs((current) => [result.cv, ...current.filter((cv) => cv.id !== result.cv.id)]);
      setSelectedFile(null); setRevision((value) => value + 1);
      setUploadPhase(result.analysisFailed ? 'ANALYSIS_FAILED' : 'SUCCESS');
      setSuccessMessage(result.analysisFailed ? 'CV envoye. L analyse IA est incomplete.' : 'CV envoye et analyse avec succes.');
      return result.cv;
    } catch (requestError) { setUploadError(normalizeApiError(requestError)); setUploadPhase('SELECTED'); return null; }
    finally { uploading.current = false; setIsUploading(false); }
  }, [selectedFile]);

  const deleteCv = useCallback(async (cvId: string) => {
    if (isDeleting) return false;
    setIsDeleting(true); setError(null); setSuccessMessage(null);
    try {
      await cvApi.delete(cvId); setCvs((current) => current.filter((cv) => cv.id !== cvId)); setRevision((value) => value + 1); setSuccessMessage('CV supprime avec succes.'); return true;
    } catch (requestError) { setError(normalizeApiError(requestError)); return false; }
    finally { setIsDeleting(false); }
  }, [isDeleting]);

  const loadCv = useCallback(async (cvId: string) => {
    setError(null);
    try {
      const detailed = await cvApi.getById(cvId);
      setCvs((current) => [detailed, ...current.filter((cv) => cv.id !== cvId)].sort((a, b) => new Date(b.uploadedAt ?? 0).getTime() - new Date(a.uploadedAt ?? 0).getTime()));
      return detailed;
    } catch (requestError) { setError(normalizeApiError(requestError)); return null; }
  }, []);

  const latestCv = cvs[0] ?? null;
  const clearMessages = useCallback(() => { setError(null); setUploadError(null); setSuccessMessage(null); }, []);
  const value = useMemo<StudentProfileContextValue>(() => ({ profile, cvs, latestCv, selectedFile, revision, uploadPhase, isLoading, isSavingProfile, isSelectingFile, isUploading, isDeleting, error, uploadError, successMessage, refresh: load, updateProfile, selectCvFile, clearSelectedFile, uploadCv, deleteCv, loadCv, clearMessages }), [profile, cvs, latestCv, selectedFile, revision, uploadPhase, isLoading, isSavingProfile, isSelectingFile, isUploading, isDeleting, error, uploadError, successMessage, load, updateProfile, selectCvFile, clearSelectedFile, uploadCv, deleteCv, loadCv, clearMessages]);
  return <StudentProfileContext.Provider value={value}>{children}</StudentProfileContext.Provider>;
}

export const useStudentProfile = () => {
  const context = useContext(StudentProfileContext);
  if (!context) throw new Error('useStudentProfile must be used inside StudentProfileProvider');
  return context;
};

