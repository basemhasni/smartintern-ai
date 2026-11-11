const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

// Isolate database/AI boundaries, keeping the actual extraction and filesystem.
const loadCVService = (prisma, analyzeCV) => {
  const replacements = new Map([
    [require.resolve('../src/config/prisma'), prisma],
    [require.resolve('../src/services/ai.service'), { analyzeCV }],
    [require.resolve('../src/services/rag.service'), {
      indexCVDocument: async () => false,
      deleteDocumentChunks: async () => {},
    }],
  ]);
  const servicePath = require.resolve('../src/services/cv.service');
  const previous = new Map([...replacements.keys(), servicePath].map((key) => [key, require.cache[key]]));
  try {
    for (const [filename, exports] of replacements) {
      require.cache[filename] = { id: filename, filename, loaded: true, exports };
    }
    delete require.cache[servicePath];
    return require(servicePath);
  } finally {
    for (const [filename, cached] of previous) {
      if (cached) require.cache[filename] = cached;
      else delete require.cache[filename];
    }
  }
};

test('unreadable upload removes its file without persisting or calling AI', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'smartintern-upload-'));
  const filePath = path.join(directory, 'React-PostgreSQL.pdf');
  let persistenceCalls = 0;
  let aiCalls = 0;
  const service = loadCVService({
    student: { findUnique: async () => ({ id: 'synthetic-student' }) },
    cV: { create: async () => { persistenceCalls += 1; } },
  }, async () => { aiCalls += 1; });
  try {
    await fs.writeFile(filePath, 'invalid PDF containing no document structure');
    await assert.rejects(service.createCV('synthetic-user', {
      path: filePath, filename: path.basename(filePath), mimetype: 'application/pdf', size: 55,
    }), (error) => error.statusCode === 400 && error.code === 'CV_TEXT_EXTRACTION_FAILED');
    await assert.rejects(fs.access(filePath), { code: 'ENOENT' });
    assert.equal(persistenceCalls, 0);
    assert.equal(aiCalls, 0);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('AI outage preserves a readable CV and records a controlled analysis failure', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'smartintern-upload-'));
  const filePath = path.join(directory, 'synthetic-cv.docx');
  const service = loadCVService({
    student: { findUnique: async () => ({ id: 'synthetic-student' }) },
    cV: { create: async ({ data }) => ({ id: 'synthetic-cv', ...data }) },
  }, async () => { throw Object.assign(new Error('Synthetic provider timeout'), { code: 'ETIMEDOUT' }); });
  try {
    await fs.copyFile(path.join(__dirname, 'fixtures/synthetic-cv.docx'), filePath);
    const result = await service.createCV('synthetic-user', {
      path: filePath, filename: path.basename(filePath),
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1024,
    });
    assert.equal(result.analysisFailed, true);
    assert.equal(result.cv.analysisJson.code, 'ETIMEDOUT');
    assert.match(result.cv.parsedText, /React REST API with PostgreSQL/);
    await fs.access(filePath);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
