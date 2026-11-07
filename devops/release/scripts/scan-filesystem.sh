#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
mkdir -p artifacts/security
report=artifacts/security/filesystem.raw.json
trap 'rm -f -- "$report"' EXIT
docker run --rm -v "${PWD}:/workspace:ro" -v "${PWD}/artifacts/security:/reports" \
  -v smartintern-trivy-cache:/root/.cache/trivy aquasec/trivy:0.68.2 fs \
  --scanners vuln,secret,misconfig --severity HIGH,CRITICAL \
  --helm-kube-version 1.37.0 --helm-set global.imageTag=000000000000 \
  --skip-dirs /workspace/.git,/workspace/artifacts,/workspace/devops/helm/.runtime,/workspace/frontend-web/test-results,/workspace/frontend-web/test-results-kubernetes,/workspace/frontend-web/playwright-report,/workspace/frontend-web/node_modules,/workspace/backend-api/node_modules,/workspace/mobile-app/node_modules,/workspace/frontend-web/dist,/workspace/frontend-web/coverage,/workspace/backend-api/coverage \
  --format json --output /reports/filesystem.raw.json /workspace
node devops/release/scripts/security-policy.mjs "$report"
