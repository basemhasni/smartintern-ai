import type { CvAnalysis, CvDocument, CvEvidenceItem } from '../models/cvDocument';

type UnknownRecord = Record<string, unknown>;
const asRecord = (value: unknown): UnknownRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {};
const asString = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null;
const asNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : null;
const asStrings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim()) : [];

const normalizeEvidence = (value: unknown): CvEvidenceItem[] => {
  const evidence = asRecord(value);
  const candidates = Array.isArray(value)
    ? value
    : [...(Array.isArray(evidence.strongEvidence) ? evidence.strongEvidence : []), ...(Array.isArray(evidence.mediumEvidence) ? evidence.mediumEvidence : [])];
  return candidates.map((item) => {
    const entry = asRecord(item);
    return {
      skill: asString(entry.skill),
      type: asString(entry.type ?? entry.evidenceType),
      text: asString(entry.text ?? entry.evidence),
      confidence: asNumber(entry.confidence),
    };
  }).filter((item) => item.skill || item.text);
};

export const normalizeCvAnalysis = (value: unknown): CvAnalysis | null => {
  const analysis = asRecord(value);
  if (!Object.keys(analysis).length) return null;
  const rawQuality = asRecord(analysis.rawTextQuality);
  const evidenceProfile = asRecord(analysis.evidenceProfile);
  const detectedSkills = asStrings(analysis.detectedSkills);
  return {
    summary: asString(analysis.summary),
    skills: asStrings(analysis.skills),
    detectedSkills,
    technicalSkills: asStrings(analysis.technicalSkills),
    softSkills: asStrings(analysis.softSkills),
    educationLevel: asString(analysis.educationLevel),
    experienceLevel: asString(analysis.experienceLevel),
    experienceLevelV2: asString(analysis.experienceLevelV2),
    projectSignals: asStrings(analysis.projectSignals),
    domainSignals: asStrings(analysis.domainSignals),
    languages: asStrings(analysis.languages),
    tools: asStrings(analysis.tools),
    warnings: asStrings(analysis.warnings),
    rawTextQuality: Object.keys(rawQuality).length ? {
      quality: asString(rawQuality.quality),
      wordCount: asNumber(rawQuality.wordCount),
      characterCount: asNumber(rawQuality.characterCount),
    } : null,
    evidence: normalizeEvidence(evidenceProfile),
    error: asString(analysis.error),
    details: asString(analysis.details),
  };
};

export const normalizeCvDocument = (value: unknown): CvDocument => {
  const cv = asRecord(value);
  const analysis = normalizeCvAnalysis(cv.analysisJson ?? cv.analysis);
  return {
    id: String(cv.id ?? ''),
    studentId: asString(cv.studentId),
    fileName: asString(cv.fileName ?? cv.filename) ?? 'CV',
    fileType: asString(cv.fileType ?? cv.mimeType),
    fileSize: asNumber(cv.fileSize ?? cv.size),
    uploadedAt: asString(cv.uploadedAt),
    status: analysis?.error ? 'ANALYSIS_FAILED' : analysis ? 'ANALYZED' : 'UPLOADED',
    skills: analysis?.detectedSkills.length ? analysis.detectedSkills : analysis?.skills ?? [],
    analysis,
  };
};

export const normalizeCvList = (value: unknown): CvDocument[] => {
  const response = asRecord(value);
  const items = Array.isArray(response.cvs) ? response.cvs : Array.isArray(value) ? value : [];
  return items.map(normalizeCvDocument).filter((cv) => cv.id);
};
