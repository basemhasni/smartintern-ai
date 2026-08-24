#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
NAMESPACE="smartintern"
KUBECONFIG_PATH=""
RENDER_ROOT=""

kube() {
  if [[ -n "${KUBECONFIG_PATH}" ]]; then
    kubectl --kubeconfig "${KUBECONFIG_PATH}" "$@"
  else
    kubectl "$@"
  fi
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "$1" >&2
    exit 1
  fi
}

validate_image_tag() {
  local image_tag="$1"
  if [[ ! "${image_tag}" =~ ^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$ ]]; then
    printf 'Invalid Docker image tag: %s\n' "${image_tag}" >&2
    exit 1
  fi
}

prepare_rendered_manifests() {
  local image_tag="$1"
  validate_image_tag "${image_tag}"

  RENDER_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/smartintern-k8s.XXXXXX")"
  mkdir -p "${RENDER_ROOT}/overlays"
  cp -R "${K8S_ROOT}/base" "${RENDER_ROOT}/base"
  cp -R "${K8S_ROOT}/overlays/minikube" "${RENDER_ROOT}/overlays/minikube"

  while IFS= read -r -d '' file; do
    sed -i "s/IMAGE_TAG_PLACEHOLDER/${image_tag}/g" "${file}"
  done < <(find "${RENDER_ROOT}/overlays" -name kustomization.yaml -print0)

  for phase in platform migrations apps; do
    kube kustomize "${RENDER_ROOT}/overlays/minikube/${phase}" \
      > "${RENDER_ROOT}/${phase}.yaml"
  done
}

cleanup_rendered_manifests() {
  if [[ -n "${RENDER_ROOT}" && -d "${RENDER_ROOT}" ]]; then
    rm -rf -- "${RENDER_ROOT}"
  fi
}

print_diagnostics() {
  printf '\nKubernetes diagnostics for namespace %s\n' "${NAMESPACE}" >&2
  kube get all,pvc -n "${NAMESPACE}" -o wide >&2 || :
  kube get events -n "${NAMESPACE}" --sort-by=.lastTimestamp >&2 || :
  kube describe pods -n "${NAMESPACE}" >&2 || :
  for workload in postgres backend ai-service frontend; do
    kube logs -n "${NAMESPACE}" "deployment/${workload}" --tail=100 >&2 || \
      kube logs -n "${NAMESPACE}" "statefulset/${workload}" --tail=100 >&2 || :
  done
  kube logs -n "${NAMESPACE}" job/backend-migrate --tail=100 >&2 || :
}
