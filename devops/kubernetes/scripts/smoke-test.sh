#!/usr/bin/env bash

set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

IMAGE_TAG=""
TEST_PERSISTENCE="false"

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
    --test-persistence)
      TEST_PERSISTENCE="true"
      shift
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
trap 'print_diagnostics' ERR
validate_image_tag "${IMAGE_TAG}"

ready_selector='app.kubernetes.io/part-of=smartintern-ai,app.kubernetes.io/component!=migrations'
kube wait pod -n "${NAMESPACE}" \
  --for=condition=Ready \
  --selector="${ready_selector}" \
  --timeout=300s
kube wait job/backend-migrate -n "${NAMESPACE}" \
  --for=condition=complete --timeout=60s

for pvc in postgres-data-postgres-0 backend-uploads; do
  phase="$(kube get pvc "${pvc}" -n "${NAMESPACE}" -o jsonpath='{.status.phase}')"
  [[ "${phase}" == "Bound" ]] || { printf 'PVC %s is %s.\n' "${pvc}" "${phase}" >&2; exit 1; }
done

declare -A expected_images=(
  [statefulset/postgres]="bessem785/smartintern-postgres:${IMAGE_TAG}"
  [job/backend-migrate]="bessem785/smartintern-backend-migrate:${IMAGE_TAG}"
  [deployment/backend]="bessem785/smartintern-backend:${IMAGE_TAG}"
  [deployment/ai-service]="bessem785/smartintern-ai:${IMAGE_TAG}"
  [deployment/frontend]="bessem785/smartintern-frontend:${IMAGE_TAG}"
)

for workload in "${!expected_images[@]}"; do
  actual_image="$(kube get "${workload}" -n "${NAMESPACE}" -o jsonpath='{.spec.template.spec.containers[0].image}')"
  if [[ "${actual_image}" != "${expected_images[${workload}]}" ]]; then
    printf '%s uses %s instead of %s.\n' "${workload}" "${actual_image}" "${expected_images[${workload}]}" >&2
    exit 1
  fi
done

vector_extension="$(kube exec -n "${NAMESPACE}" statefulset/postgres -- sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT extname FROM pg_extension WHERE extname = '\''vector'\'';"')"
[[ "${vector_extension}" == "vector" ]] || { printf 'pgvector is unavailable.\n' >&2; exit 1; }

kube exec -n "${NAMESPACE}" deployment/backend -- node -e \
  "fetch('http://127.0.0.1:5000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
kube exec -n "${NAMESPACE}" deployment/backend -- node -e \
  "fetch('http://127.0.0.1:5000/health/ai').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
kube exec -n "${NAMESPACE}" deployment/ai-service -- python -c \
  "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=5)"
kube exec -n "${NAMESPACE}" deployment/frontend -- wget -qO- http://127.0.0.1:8080/health >/dev/null
kube exec -n "${NAMESPACE}" deployment/frontend -- wget -qO- http://backend:5000/health >/dev/null

if [[ "${TEST_PERSISTENCE}" == "true" ]]; then
  kube exec -n "${NAMESPACE}" statefulset/postgres -- sh -c \
    "psql -U \"\$POSTGRES_USER\" -d \"\$POSTGRES_DB\" -v ON_ERROR_STOP=1 -c \"CREATE TABLE IF NOT EXISTS kubernetes_persistence_probe (marker text NOT NULL); TRUNCATE kubernetes_persistence_probe; INSERT INTO kubernetes_persistence_probe VALUES ('${IMAGE_TAG}');\"" >/dev/null
  kube delete pod postgres-0 -n "${NAMESPACE}" --wait=true --timeout=90s
  kube wait pod/postgres-0 -n "${NAMESPACE}" --for=condition=Ready --timeout=240s
  persisted_marker="$(kube exec -n "${NAMESPACE}" statefulset/postgres -- sh -c \
    'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT marker FROM kubernetes_persistence_probe LIMIT 1;"')"
  [[ "${persisted_marker}" == "${IMAGE_TAG}" ]] || { printf 'PostgreSQL persistence test failed.\n' >&2; exit 1; }
  kube exec -n "${NAMESPACE}" statefulset/postgres -- sh -c \
    'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -c "DROP TABLE kubernetes_persistence_probe;"' >/dev/null
  kube wait pod -n "${NAMESPACE}" --for=condition=Ready \
    --selector="${ready_selector}" --timeout=180s
fi

kube get pods,pvc,services -n "${NAMESPACE}" -o wide
printf 'Kubernetes smoke tests succeeded for immutable tag %s.\n' "${IMAGE_TAG}"
