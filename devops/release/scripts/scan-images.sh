#!/usr/bin/env bash
set -Eeuo pipefail

tag="${1:?Usage: scan-images.sh IMAGE_TAG}"
[[ "$tag" == latest || "$tag" =~ ^[a-f0-9]{12}$ ]] || {
  printf 'Expected latest for local validation or a 12-character SHA tag for CI.\n' >&2
  exit 2
}

trivy_image=aquasec/trivy:0.68.2
for name in frontend backend backend-migrate ai postgres; do
  image="smartintern-$name:$tag"
  docker image inspect "$image" >/dev/null
  printf '\nScanning %s (HIGH and CRITICAL findings, including unfixed):\n' "$image"
  docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v smartintern-trivy-cache:/root/.cache/trivy \
    "$trivy_image" image --quiet --scanners vuln --severity HIGH,CRITICAL \
    --exit-code 0 "$image"

  printf 'Enforcing fixable CRITICAL gate for %s...\n' "$image"
  docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v smartintern-trivy-cache:/root/.cache/trivy \
    "$trivy_image" image --quiet --scanners vuln --severity CRITICAL \
    --ignore-unfixed --exit-code 1 "$image" >/dev/null
done
printf 'All image security gates passed.\n'
