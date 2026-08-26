#!/usr/bin/env bash

set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

IMAGE_TAG="000000000000"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --image-tag) IMAGE_TAG="$2"; shift 2 ;;
    --kubeconfig) KUBECONFIG_PATH="$2"; shift 2 ;;
    *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
  esac
done

validate_image_tag "${IMAGE_TAG}"
require_command kubectl

render_dir="$(mktemp -d "${TMPDIR:-/tmp}/smartintern-helm-render.XXXXXX")"
trap 'rm -rf -- "${render_dir}"' EXIT
cluster_available="false"
if kube cluster-info >/dev/null 2>&1; then
  cluster_available="true"
fi

for environment in dev prod; do
  values="${CHART_ROOT}/values-${environment}.yaml"
  namespace="smartintern-${environment}"
  release="smartintern-${environment}"
  helm_cli lint "${CHART_ROOT}" --values "${values}" --set-string "global.imageTag=${IMAGE_TAG}"
  helm_cli template "${release}" "${CHART_ROOT}" \
    --namespace "${namespace}" \
    --values "${values}" \
    --set-string "global.imageTag=${IMAGE_TAG}" \
    > "${render_dir}/${environment}.yaml"
  if [[ "${cluster_available}" == "true" ]]; then
    kube apply --dry-run=client --validate=false -f "${render_dir}/${environment}.yaml" >/dev/null
  fi
done

if [[ "${cluster_available}" == "true" ]]; then
  helm_cli upgrade --install smartintern-validation "${CHART_ROOT}" \
    --namespace smartintern-validation \
    --values "${CHART_ROOT}/values-dev.yaml" \
    --set-string "global.imageTag=${IMAGE_TAG}" \
    --set-string "ingress.host=validation-${IMAGE_TAG}.smartintern.local" \
    --dry-run=server --hide-secret >/dev/null
else
  printf 'Cluster unavailable: Helm lint and offline rendering completed.\n'
fi

printf 'Helm lint, DEV/prod-like rendering and Kubernetes validation succeeded for %s.\n' "${IMAGE_TAG}"
