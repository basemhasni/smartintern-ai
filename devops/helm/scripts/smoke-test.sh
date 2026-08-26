#!/usr/bin/env bash

set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

TEST_PERSISTENCE="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --image-tag) IMAGE_TAG="$2"; shift 2 ;;
    --kubeconfig) KUBECONFIG_PATH="$2"; shift 2 ;;
    --namespace) NAMESPACE="$2"; shift 2 ;;
    --release) RELEASE="$2"; shift 2 ;;
    --test-persistence) TEST_PERSISTENCE="true"; shift ;;
    *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
  esac
done

validate_image_tag "${IMAGE_TAG}"
require_command kubectl
require_command curl
trap print_diagnostics ERR

helm_status="$(helm_cli status "${RELEASE}" -n "${NAMESPACE}" -o json)"
printf '%s' "${helm_status}" | grep -Eq '"status"[[:space:]]*:[[:space:]]*"deployed"'

kube wait pod -n "${NAMESPACE}" \
  --for=condition=Ready \
  --selector='app.kubernetes.io/part-of=smartintern-ai,app.kubernetes.io/component!=migrations' \
  --timeout=300s
kube wait job/backend-migrate -n "${NAMESPACE}" --for=condition=complete --timeout=60s

for pvc in postgres-data-postgres-0 backend-uploads; do
  [[ "$(kube get pvc "${pvc}" -n "${NAMESPACE}" -o jsonpath='{.status.phase}')" == "Bound" ]]
done

declare -A expected_images=(
  [statefulset/postgres]="bessem785/smartintern-postgres:${IMAGE_TAG}"
  [job/backend-migrate]="bessem785/smartintern-backend-migrate:${IMAGE_TAG}"
  [deployment/backend]="bessem785/smartintern-backend:${IMAGE_TAG}"
  [deployment/ai-service]="bessem785/smartintern-ai:${IMAGE_TAG}"
  [deployment/frontend]="bessem785/smartintern-frontend:${IMAGE_TAG}"
)
for workload in "${!expected_images[@]}"; do
  actual="$(kube get "${workload}" -n "${NAMESPACE}" -o jsonpath='{.spec.template.spec.containers[0].image}')"
  [[ "${actual}" == "${expected_images[${workload}]}" ]] || {
    printf '%s uses %s instead of %s.\n' "${workload}" "${actual}" "${expected_images[${workload}]}" >&2
    exit 1
  }
done

[[ "$(kube get secret smartintern-dev-tls -n "${NAMESPACE}" -o jsonpath='{.type}')" == "kubernetes.io/tls" ]]
kube get ingress smartintern smartintern-health -n "${NAMESPACE}" >/dev/null

vector="$(kube exec -n "${NAMESPACE}" statefulset/postgres -- sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT extname FROM pg_extension WHERE extname = '\''vector'\'';"')"
[[ "${vector}" == "vector" ]]

if [[ "${TEST_PERSISTENCE}" == "true" ]]; then
  kube exec -n "${NAMESPACE}" statefulset/postgres -- sh -c \
    "psql -U \"\$POSTGRES_USER\" -d \"\$POSTGRES_DB\" -v ON_ERROR_STOP=1 -c \"CREATE TABLE IF NOT EXISTS helm_persistence_probe (marker text NOT NULL); TRUNCATE helm_persistence_probe; INSERT INTO helm_persistence_probe VALUES ('${IMAGE_TAG}');\"" >/dev/null
  kube delete pod postgres-0 -n "${NAMESPACE}" --wait=true --timeout=120s
  kube wait pod/postgres-0 -n "${NAMESPACE}" --for=condition=Ready --timeout=300s
  marker="$(kube exec -n "${NAMESPACE}" statefulset/postgres -- sh -c \
    'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT marker FROM helm_persistence_probe LIMIT 1;"')"
  [[ "${marker}" == "${IMAGE_TAG}" ]]
  kube exec -n "${NAMESPACE}" statefulset/postgres -- sh -c \
    'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -c "DROP TABLE helm_persistence_probe;"' >/dev/null
fi

local_port="$((20000 + RANDOM % 10000))"
port_forward_log="$(mktemp "${TMPDIR:-/tmp}/smartintern-ingress-forward.XXXXXX")"
kube port-forward -n ingress-nginx service/ingress-nginx-controller "${local_port}:443" >"${port_forward_log}" 2>&1 &
port_forward_pid=$!
cleanup_forward() {
  kill "${port_forward_pid}" >/dev/null 2>&1 || :
  wait "${port_forward_pid}" >/dev/null 2>&1 || :
  rm -f -- "${port_forward_log}"
}
trap cleanup_forward EXIT

for _ in $(seq 1 30); do
  if curl -ksS --resolve "${TLS_HOST}:${local_port}:127.0.0.1" \
    "https://${TLS_HOST}:${local_port}/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

curl -kfsS --resolve "${TLS_HOST}:${local_port}:127.0.0.1" \
  "https://${TLS_HOST}:${local_port}/" | grep -qi '<!doctype html'
curl -kfsS --resolve "${TLS_HOST}:${local_port}:127.0.0.1" \
  "https://${TLS_HOST}:${local_port}/api/health" | grep -q '"status"'
curl -kfsS --resolve "${TLS_HOST}:${local_port}:127.0.0.1" \
  "https://${TLS_HOST}:${local_port}/ai/health" | grep -q '"status"'

kube get pods,ingresses,pvc -n "${NAMESPACE}" -o wide
printf 'HTTPS Ingress, TLS, workloads, pgvector, migration and PVC smoke tests succeeded for %s.\n' "${IMAGE_TAG}"
