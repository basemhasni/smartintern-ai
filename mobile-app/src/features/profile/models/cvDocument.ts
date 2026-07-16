export type CvAnalysisStatus = 'UPLOADED' | 'ANALYZED' | 'ANALYSIS_FAILED';

export type CvEvidenceItem = {
  skill?: string | null;
  type?: string | null;
  text?: string | null;
  confidence?: number | null;
};

export type CvAnalysis = {
  summary?: string | null;
  skills: string[];
  detectedSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  educationLevel?: string | null;
  experienceLevel?: string | null;
  experienceLevelV2?: string | null;
  projectSignals: string[];
  domainSignals: string[];
  languages: string[];
  tools: string[];
  warnings: string[];
  rawTextQuality?: {
    quality?: string | null;
    wordCount?: number | null;
    characterCount?: number | null;
  } | null;
  evidence: CvEvidenceItem[];
  error?: string | null;
  details?: string | null;
};

export type CvDocument = {
  id: string;
  studentId?: string | null;
  fileName: string;
  fileType?: string | null;
  fileSize?: number | null;
  uploadedAt?: string | null;
  status: CvAnalysisStatus;
  skills: string[];
  analysis?: CvAnalysis | null;
};

export type SelectedCvFile = {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
  file?: File | null;
};

export type CvUploadResult = {
  cv: CvDocument;
  message: string;
  analysisFailed: boolean;
  ragIndexed: boolean;
};
