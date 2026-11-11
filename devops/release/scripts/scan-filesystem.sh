#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
mkdir -p artifacts/security
report=artifacts/security/filesystem.raw.json
trap 'rm -f -- "$report"' EXIT
commit="$(git -c safe.directory="${PWD}" rev-parse HEAD)"
# Scan the exact tracked commit. Runtime credentials, dumps and files concurrently
# produced by tests never enter this source snapshot, even on Docker Desktop.
git -c safe.directory="${PWD}" archive HEAD | docker run --rm -i \
  -v smartintern-trivy-cache:/root/.cache/trivy --entrypoint sh aquasec/trivy:0.68.2 -ec \
  'mkdir -p /tmp/source; tar -xf - -C /tmp/source; trivy fs --quiet --skip-version-check --scanners vuln,secret,misconfig --helm-kube-version 1.37.0 --helm-set global.imageTag=000000000000 --format json /tmp/source' > "$report"
SCANNED_COMMIT="$commit" node devops/release/scripts/security-policy.mjs "$report"
