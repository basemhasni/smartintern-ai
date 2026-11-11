import { readFileSync } from 'node:fs';

// Synthetic DOCX fixture: no external service or personal information.
export function syntheticCv() {
  return {
    name: 'synthetic-step10.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: readFileSync(new URL('./fixtures/synthetic-cv.docx', import.meta.url)),
  };
}
