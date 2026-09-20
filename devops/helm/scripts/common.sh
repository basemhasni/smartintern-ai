#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HELM_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CHART_ROOT="${HELM_ROOT}/smartintern-ai"
VALUES_FILE="${CHART_ROOT}/values-dev.yaml"
RELEASE="smartintern-dev"
NAMESPACE="smartintern-dev"
IMAGE_TAG=""
KUBECONFIG_PATH=""
TLS_HOST="smartintern.local"

kube() {
  if [[ -n "${KUBECONFIG_PATH}" ]]; then
    kubectl --kubeconfig "${KUBECONFIG_PATH}" "$@"
  else
    kubectl "$@"
  fi
}

helm_cli() {
  local -a helm_command
  if command -v helm >/dev/null 2>&1; then
    helm_command=(helm)
  elif [[ -x "${HOME}/.local/bin/helm" ]]; then
    helm_command=("${HOME}/.local/bin/helm")
  else
    printf 'Required command not found: helm\n' >&2
    exit 1
  fi

  if [[ -n "${KUBECONFIG_PATH}" ]]; then
    KUBECONFIG="${KUBECONFIG_PATH}" "${helm_command[@]}" "$@"
  else
    "${helm_command[@]}" "$@"
  fi
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "$1" >&2
    exit 1
  fi
}

validate_image_tag() {
  if [[ ! "$1" =~ ^[0-9a-f]{12}$ ]]; then
    printf 'Image tag must be an immutable 12-character lowercase Git SHA: %s\n' "$1" >&2
    exit 1
  fi
}

ensure_namespace() {
  kube create namespace "${NAMESPACE}" --dry-run=client -o yaml | kube apply -f - >/dev/null
  kube label namespace "${NAMESPACE}" \
    app.kubernetes.io/name=smartintern-ai \
    app.kubernetes.io/part-of=smartintern-ai \
    smartintern.ai/environment=dev --overwrite >/dev/null
}

ensure_runtime_secret() {
  if kube get secret smartintern-secrets -n "${NAMESPACE}" >/dev/null 2>&1; then
    printf 'Reusing runtime secret smartintern-secrets in %s.\n' "${NAMESPACE}"
    return
  fi

  local postgres_user postgres_database postgres_password jwt_secret database_url
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
  printf 'Created runtime-only application secret in %s.\n' "${NAMESPACE}"
}

ensure_tls_secret() {
  local secret_name="smartintern-dev-tls"
  if kube get secret "${secret_name}" -n "${NAMESPACE}" >/dev/null 2>&1; then
    printf 'Reusing runtime TLS secret %s.\n' "${secret_name}"
    return
  fi

  local tls_dir
  tls_dir="$(mktemp -d "${TMPDIR:-/tmp}/smartintern-tls.XXXXXX")"
  openssl req -x509 -nodes -newkey rsa:2048 -sha256 -days 365 \
    -keyout "${tls_dir}/tls.key" \
    -out "${tls_dir}/tls.crt" \
    -subj "/CN=${TLS_HOST}/O=SmartIntern Local Development" \
    -addext "subjectAltName=DNS:${TLS_HOST}" >/dev/null 2>&1
  kube create secret tls "${secret_name}" \
    --namespace "${NAMESPACE}" \
    --cert="${tls_dir}/tls.crt" \
    --key="${tls_dir}/tls.key" \
    --dry-run=client -o yaml | kube apply -f - >/dev/null
  rm -rf -- "${tls_dir}"
  printf 'Created local self-signed TLS secret for %s.\n' "${TLS_HOST}"
}

print_diagnostics() {
  printf '\nHelm/Kubernetes diagnostics for %s/%s\n' "${NAMESPACE}" "${RELEASE}" >&2
  helm_cli status "${RELEASE}" -n "${NAMESPACE}" >&2 || :
  kube get pods,deployments,statefulsets,jobs,services,ingresses,pvc -n "${NAMESPACE}" -o wide >&2 || :
  kube get events -n "${NAMESPACE}" --sort-by=.lastTimestamp >&2 || :
  for workload in deployment/backend deployment/ai-service deployment/frontend statefulset/postgres job/backend-migrate; do
    kube logs -n "${NAMESPACE}" "${workload}" --tail=100 >&2 || :
  done
}
