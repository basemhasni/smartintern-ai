import fs from 'node:fs';

const file = process.argv[2];
if (!file) throw new Error('Usage: node security-policy.mjs REPORT.json');
const report = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!Array.isArray(report.Results)) throw new Error('Invalid Trivy report: Results must be an array');
const findings = [];
let blocked = false;
for (const result of report.Results || []) {
  for (const item of result.Vulnerabilities || []) {
    if (!['HIGH', 'CRITICAL'].includes(item.Severity)) continue;
    findings.push({ target: result.Target, type: 'vulnerability', id: item.VulnerabilityID, package: item.PkgName, installed: item.InstalledVersion, fixed: item.FixedVersion || null, severity: item.Severity });
    if (item.Severity === 'CRITICAL' && item.FixedVersion) blocked = true;
  }
  for (const item of result.Secrets || []) {
    // Never publish scanner matches or source snippets, including in artifacts.
    findings.push({ target: result.Target, type: 'secret', id: item.RuleID, line: item.StartLine, severity: item.Severity });
    blocked = true;
  }
  for (const item of result.Misconfigurations || []) {
    if (item.Status === 'FAIL') findings.push({ target: result.Target, type: 'configuration', id: item.ID, title: item.Title, severity: item.Severity });
  }
}
const summary = { scanner: 'Trivy 0.68.2', blocked, findings };
fs.writeFileSync(file.replace(/\.raw\.json$/, '.summary.json'), JSON.stringify(summary, null, 2));
fs.unlinkSync(file);
console.log(JSON.stringify(summary, null, 2));
if (blocked) process.exitCode = 1;
