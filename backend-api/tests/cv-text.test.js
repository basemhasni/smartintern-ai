const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { extractTextFromCV } = require('../src/services/cv-text.service');

test('extracts CV evidence from a valid synthetic DOCX', async () => {
  const result = await extractTextFromCV(path.join(__dirname, 'fixtures/synthetic-cv.docx'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  assert.match(result, /React REST API with PostgreSQL/);
  assert.doesNotMatch(result, /Detected file name/);
});

test('invalid PDF cannot turn skills in its filename into AI evidence', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'smartintern-cv-'));
  try {
    const file = path.join(dir, 'expert-React-PostgreSQL.pdf');
    await fs.writeFile(file, 'not a PDF');
    await assert.rejects(extractTextFromCV(file, 'application/pdf'), (error) => error.statusCode === 400 && error.code === 'CV_TEXT_EXTRACTION_FAILED');
  } finally {
    await fs.rm(dir, { recursive: true });
  }
});
