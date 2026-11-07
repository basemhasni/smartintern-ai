import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

function run(result) {
  const dir = mkdtempSync(join(tmpdir(), 'smartintern-policy-'));
  try {
    const file = join(dir, 'test.raw.json');
    writeFileSync(file, JSON.stringify({ Results: [result] }));
    const execution = spawnSync(process.execPath, ['devops/release/scripts/security-policy.mjs', file], { encoding: 'utf8' });
    return { ...execution, summary: JSON.parse(readFileSync(join(dir, 'test.summary.json'), 'utf8')) };
  } finally { rmSync(dir, { recursive: true }); }
}
test('a fixable critical vulnerability blocks the release', () => {
  const result = run({ Target: 'image', Vulnerabilities: [{ VulnerabilityID: 'SYNTHETIC', Severity: 'CRITICAL', FixedVersion: '1.0.1' }] });
  assert.equal(result.status, 1);
  assert.equal(result.summary.blocked, true);
});
test('unfixed critical vulnerabilities stay visible without being hidden by exclusions', () => {
  const result = run({ Target: 'image', Vulnerabilities: [{ VulnerabilityID: 'SYNTHETIC', Severity: 'CRITICAL' }] });
  assert.equal(result.status, 0);
  assert.equal(result.summary.findings[0].fixed, null);
});
test('secret matches block the release and are redacted from logs and reports', () => {
  const result = run({ Target: 'fixture', Secrets: [{ RuleID: 'synthetic', StartLine: 1, Severity: 'HIGH', Match: 'SYNTHETIC_DO_NOT_PRINT', Code: { Lines: [{ Content: 'SYNTHETIC_DO_NOT_PRINT' }] } }] });
  assert.equal(result.status, 1);
  assert.doesNotMatch(result.stdout + JSON.stringify(result.summary), /SYNTHETIC_DO_NOT_PRINT/);
});
