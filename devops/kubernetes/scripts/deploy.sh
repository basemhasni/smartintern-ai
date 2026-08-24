#!/usr/bin/env bash

set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

IMAGE_TAG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --image-tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    --kubeconfig)
      KUBECONFIG_PATH="$2"
      shift 2
      ;;
    *)
      printf 'Unknown argument: %s\n' "$1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "${IMAGE_TAG}" ]]; then
  printf 'The --image-tag argument is required.\n' >&2
  exit 1
fi

require_command kubectl
require_command openssl

on_error() {
  local exit_code=$?
  print_diagnostics
  exit "${exit_code}"
}

trap cleanup_rendered_manifests EXIT
trap on_error ERR

prepare_rendered_manifests "${IMAGE_TAG}"
kube cluster-info >/dev/null
kube apply -f "${K8S_ROOT}/namespace.yaml"

if ! kube get secret smartintern-secrets -n "${NAMESPACE}" >/dev/null 2>&1; then
  postgres_user="${K8S_POSTGRES_USER:-smartintern}"
  postgres_database="${K8S_POSTGRES_DB:-smartintern_ai}"
  postgres_password="${K8S_POSTGRES_PASSWORD:-$(openssl rand -hex 24)}"
  jwt_secret="${K8S_JWT_SECRET:-$(openssl rand -hex 32)}"
  database_url="postgresql://${postgres_user}:${postgres_password}@postgres:5432/${postgres_database}?schema=public"

  kube create secret generic smartintern-secrets \
    --namespace "${NAMESPACE}" \
    --from-literal="POSTGRES_USER=${postgres_user}" \
    --from-literal="POSTGRES_DB=${postgres_database}" \
    --from-literal="POSTGRES_PASSWORD=${postgres_password}" \
    --from-literal="DATABASE_URL=${database_url}" \
    --from-literal="JWT_SECRET=${jwt_secret}" \
    --dry-run=client -o yaml | kube apply -f - >/dev/null
  printf 'Generated the runtime Kubernetes secret in namespace %s.\n' "${NAMESPACE}"
else
  printf 'Reusing the existing runtime Kubernetes secret.\n'
fi

kube apply -f "${RENDER_ROOT}/platform.yaml"
pod_revision="$(kube get pod postgres-0 -n "${NAMESPACE}" --ignore-not-found \
  -o jsonpath='{.metadata.labels.controller-revision-hash}')"
target_revision="$(kube get statefulset postgres -n "${NAMESPACE}" \
  -o jsonpath='{.status.updateRevision}')"
if [[ -n "${pod_revision}" && -n "${target_revision}" && "${pod_revision}" != "${target_revision}" ]]; then
  printf 'Recreating postgres-0 to move from revision %s to %s.\n' \
    "${pod_revision}" "${target_revision}"
  kube delete pod postgres-0 -n "${NAMESPACE}" --wait=true
fi
kube rollout status statefulset/postgres -n "${NAMESPACE}" --timeout=240s
kube wait pvc/postgres-data-postgres-0 -n "${NAMESPACE}" \
  --for=jsonpath='{.status.phase}'=Bound --timeout=120s
kube wait pvc/backend-uploads -n "${NAMESPACE}" \
  --for=jsonpath='{.status.phase}'=Bound --timeout=120s

kube delete job backend-migrate -n "${NAMESPACE}" --ignore-not-found --wait=true
kube apply -f "${RENDER_ROOT}/migrations.yaml"
if ! kube wait job/backend-migrate -n "${NAMESPACE}" \
  --for=condition=complete --timeout=300s; then
  kube logs -n "${NAMESPACE}" job/backend-migrate --tail=200 >&2 || :
  exit 1
fi

kube apply -f "${RENDER_ROOT}/apps.yaml"
for deployment in ai-service backend frontend; do
  kube rollout status "deployment/${deployment}" -n "${NAMESPACE}" --timeout=300s
done

kube annotate namespace "${NAMESPACE}" \
  smartintern.ai/deployed-image-tag="${IMAGE_TAG}" --overwrite >/dev/null
kube get all,pvc -n "${NAMESPACE}" -o wide
printf 'SmartIntern Kubernetes deployment completed with immutable tag %s.\n' "${IMAGE_TAG}"
