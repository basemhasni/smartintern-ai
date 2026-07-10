import type { AuthUser } from '@/features/auth/models/userModel';

export type CvStatus = 'ABSENT' | 'UPLOADED' | 'ANALYZED' | 'ANALYSIS_FAILED';

export type StudentProfile = {
  id: string;
  userId: string;
  phone?: string | null;
  location?: string | null;
  educationLevel?: string | null;
  targetJob?: string | null;
  bio?: string | null;
  availabilityDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  user: AuthUser;
};

export type StudentCvSummary = {
  id: string;
  fileName: string;
  fileUrl?: string | null;
  uploadedAt?: string | null;
  status: CvStatus;
  skills: string[];
};

export type ProfileCompletion = {
  completed: number;
  total: number;
  percentage: number;
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? value as UnknownRecord : {};

const asOptionalString = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value : null;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : [];

export const normalizeStudentProfile = (value: unknown): StudentProfile => {
  const student = asRecord(value);
  const rawUser = asRecord(student.user);

  return {
    id: String(student.id ?? ''),
    userId: String(student.userId ?? rawUser.id ?? ''),
    phone: asOptionalString(student.phone),
    location: asOptionalString(student.location),
    educationLevel: asOptionalString(student.educationLevel),
    targetJob: asOptionalString(student.targetJob),
    bio: asOptionalString(student.bio),
    availabilityDate: asOptionalString(student.availabilityDate),
    createdAt: asOptionalString(student.createdAt),
    updatedAt: asOptionalString(student.updatedAt),
    user: {
      id: String(rawUser.id ?? student.userId ?? ''),
      email: String(rawUser.email ?? ''),
      role: rawUser.role === 'COMPANY' || rawUser.role === 'ADMIN' ? rawUser.role : 'STUDENT',
      firstName: asOptionalString(rawUser.firstName),
      lastName: asOptionalString(rawUser.lastName),
    },
  };
};

export const normalizeStudentCv = (value: unknown): StudentCvSummary => {
  const cv = asRecord(value);
  const analysis = asRecord(cv.analysisJson);
  const hasAnalysis = Object.keys(analysis).length > 0;
  const hasAnalysisError = typeof analysis.error === 'string';

  return {
    id: String(cv.id ?? ''),
    fileName: String(cv.fileName ?? 'CV'),
    fileUrl: asOptionalString(cv.fileUrl),
    uploadedAt: asOptionalString(cv.uploadedAt),
    status: hasAnalysisError ? 'ANALYSIS_FAILED' : hasAnalysis ? 'ANALYZED' : 'UPLOADED',
    skills: asStringArray(analysis.skills),
  };
};

/**
 * UI-only indicator based on eight fields already exposed by the backend.
 * It is not a backend business score and is never sent to the API.
 */
export const getProfileCompletion = (
  profile: StudentProfile | null,
  latestCv: StudentCvSummary | null,
): ProfileCompletion => {
  if (!profile) return { completed: 0, total: 8, percentage: 0 };

  const values = [
    profile.user.firstName,
    profile.user.lastName,
    profile.location,
    profile.educationLevel,
    profile.targetJob,
    profile.bio,
    profile.availabilityDate,
    latestCv,
  ];
  const completed = values.filter(Boolean).length;

  return {
    completed,
    total: values.length,
    percentage: Math.round((completed / values.length) * 100),
  };
};
