const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

// Compile isolated, dependency-free TypeScript utilities with the existing
// compiler; no emulator or additional test runner is needed.
function loadUtility(relativePath) {
  const filename = path.join(__dirname, '..', relativePath);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports }, { filename });
  return exports;
}
const cv = loadUtility('src/features/profile/utils/validateCvFile.ts');
const applications = loadUtility('src/features/applications/models/applicationStatus.ts');

test('mobile CV validation accepts supported files and enforces the size boundary', () => {
  assert.equal(cv.validateCvFile({ name: 'synthetic.pdf', mimeType: 'application/pdf', size: cv.MAX_CV_SIZE }), null);
  assert.equal(cv.validateCvFile({ name: 'synthetic.DOCX', size: null }), null);
  assert.match(cv.validateCvFile({ name: 'synthetic.pdf', size: cv.MAX_CV_SIZE + 1 }), /5 Mo/);
});
test('mobile CV validation refuses missing, unsupported and misleading uploads', () => {
  assert.ok(cv.validateCvFile(null));
  assert.ok(cv.validateCvFile({ name: 'payload.exe', mimeType: 'application/pdf', size: 1 }));
  assert.ok(cv.validateCvFile({ name: 'payload.pdf', mimeType: 'text/html', size: 1 }));
});
test('unknown application status remains explicit rather than claiming acceptance', () => {
  for (const status of ['SENT', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']) assert.equal(applications.normalizeApplicationStatus(status), status);
  for (const status of [null, '', 'accepted', 'INVALID', 123]) assert.equal(applications.normalizeApplicationStatus(status), 'UNKNOWN');
});
