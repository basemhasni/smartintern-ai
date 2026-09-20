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
else
  # The database may have been paused while resource-intensive CI checks ran.
  # Restore it before Helm executes the pre-upgrade migration hook.
  kube scale statefulset/postgres -n "${NAMESPACE}" --replicas=1 >/dev/null
  kube rollout status statefulset/postgres -n "${NAMESPACE}" --timeout=300s

  claim_template_version="$(kube get statefulset/postgres -n "${NAMESPACE}" \
    -o jsonpath='{.spec.volumeClaimTemplates[0].metadata.labels.app\.kubernetes\.io/version}' 2>/dev/null || :)"
  if [[ -n "${claim_template_version}" ]]; then
    printf 'Migrating legacy PostgreSQL claim template labels without deleting its pod or PVC.\n'
    kube delete statefulset/postgres -n "${NAMESPACE}" --cascade=orphan --wait=true >/dev/null
  fi
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
