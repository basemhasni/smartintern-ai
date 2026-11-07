#!/usr/bin/env bash
set -Eeuo pipefail

tag="${1:?Usage: scan-images.sh IMAGE_TAG}"
[[ "$tag" == latest || "$tag" =~ ^[a-f0-9]{12}$ ]] || {
  printf 'Expected latest for local validation or a 12-character SHA tag for CI.\n' >&2
  exit 2
}
umask 077
mkdir -p artifacts/security
failed=false
for name in frontend backend backend-migrate ai postgres; do
  image="smartintern-$name:$tag"
  docker image inspect "$image" >/dev/null
  report="artifacts/security/image-$name.raw.json"
  docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v smartintern-trivy-cache:/root/.cache/trivy \
    aquasec/trivy:0.68.2 image --quiet --scanners vuln --severity HIGH,CRITICAL \
    --format json "$image" > "$report"
  if node devops/release/scripts/security-policy.mjs "$report"; then
    printf '%s security gate passed.\n' "$image"
  else
    failed=true
  fi
done
[[ "$failed" == false ]] || { printf 'At least one image failed the security gate.\n' >&2; exit 1; }
printf 'All five image security gates passed.\n'
