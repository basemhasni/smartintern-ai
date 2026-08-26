#!/usr/bin/env bash

set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --image-tag) IMAGE_TAG="$2"; shift 2 ;;
    --kubeconfig) KUBECONFIG_PATH="$2"; shift 2 ;;
    --namespace) NAMESPACE="$2"; shift 2 ;;
    --release) RELEASE="$2"; shift 2 ;;
    --values) VALUES_FILE="$2"; shift 2 ;;
    *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
  esac
done

validate_image_tag "${IMAGE_TAG}"
require_command kubectl
require_command openssl
trap print_diagnostics ERR

kube cluster-info >/dev/null
ensure_namespace
ensure_runtime_secret
ensure_tls_secret

if ! helm_cli status "${RELEASE}" -n "${NAMESPACE}" >/dev/null 2>&1; then
  helm_cli upgrade --install "${RELEASE}" "${CHART_ROOT}" \
    --namespace "${NAMESPACE}" \
    --values "${VALUES_FILE}" \
    --set-string "global.imageTag=${IMAGE_TAG}" \
    --set apps.enabled=false \
    --set migration.enabled=false \
    --set ingress.enabled=false \
    --wait --rollback-on-failure --timeout 10m
  kube rollout status statefulset/postgres -n "${NAMESPACE}" --timeout=300s
fi

helm_cli upgrade "${RELEASE}" "${CHART_ROOT}" \
  --namespace "${NAMESPACE}" \
  --values "${VALUES_FILE}" \
  --set-string "global.imageTag=${IMAGE_TAG}" \
  --wait --wait-for-jobs --rollback-on-failure --timeout 12m \
  --description "SmartIntern immutable image tag ${IMAGE_TAG}"

for deployment in backend ai-service frontend; do
  kube rollout status "deployment/${deployment}" -n "${NAMESPACE}" --timeout=300s
done
kube wait job/backend-migrate -n "${NAMESPACE}" --for=condition=complete --timeout=60s
kube annotate namespace "${NAMESPACE}" smartintern.ai/deployed-image-tag="${IMAGE_TAG}" --overwrite >/dev/null

helm_cli list -n "${NAMESPACE}"
helm_cli status "${RELEASE}" -n "${NAMESPACE}"
printf 'Helm deployment completed for %s with immutable tag %s.\n' "${RELEASE}" "${IMAGE_TAG}"
