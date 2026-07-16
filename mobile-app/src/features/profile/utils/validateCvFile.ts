import type { SelectedCvFile } from '../models/cvDocument';

export const MAX_CV_SIZE = 5 * 1024 * 1024;
export const CV_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

const allowedExtensions = ['pdf', 'docx'];

export const getCvMimeType = (file: SelectedCvFile) => {
  if (file.mimeType) return file.mimeType;
  return file.name.toLowerCase().endsWith('.pdf')
    ? CV_MIME_TYPES[0]
    : CV_MIME_TYPES[1];
};

export const validateCvFile = (file: SelectedCvFile | null): string | null => {
  if (!file) return 'Selectionnez un fichier CV.';
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !allowedExtensions.includes(extension)) return 'Selectionnez un fichier PDF ou DOCX.';
  if (file.mimeType && !CV_MIME_TYPES.includes(file.mimeType as typeof CV_MIME_TYPES[number])) return 'Le type du fichier selectionne n est pas supporte.';
  if (file.size !== null && file.size !== undefined && file.size > MAX_CV_SIZE) return 'Le fichier selectionne depasse la limite de 5 Mo.';
  if (!file.name.trim() || file.name.length > 255) return 'Le nom du fichier est invalide.';
  return null;
};

export const formatFileSize = (size?: number | null) => {
  if (size === null || size === undefined) return 'Taille non renseignee';
  if (size < 1024) return `${size} octets`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
};
