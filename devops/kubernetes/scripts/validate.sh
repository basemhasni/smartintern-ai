#!/usr/bin/env bash

set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

IMAGE_TAG="validation"
SERVER_DRY_RUN="false"

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
    --server)
      SERVER_DRY_RUN="true"
      shift
      ;;
    *)
      printf 'Unknown argument: %s\n' "$1" >&2
      exit 1
      ;;
  esac
done

require_command kubectl
trap cleanup_rendered_manifests EXIT
prepare_rendered_manifests "${IMAGE_TAG}"

if kube cluster-info >/dev/null 2>&1; then
  kube apply --dry-run=client -f "${K8S_ROOT}/namespace.yaml" >/dev/null
  for phase in platform migrations apps; do
    kube apply --dry-run=client -f "${RENDER_ROOT}/${phase}.yaml" >/dev/null
  done
else
  printf 'Cluster unavailable: Kustomize rendering completed without API discovery.\n'
fi

if [[ "${SERVER_DRY_RUN}" == "true" ]]; then
  kube apply --dry-run=server -f "${K8S_ROOT}/namespace.yaml" >/dev/null
  if kube get namespace "${NAMESPACE}" >/dev/null 2>&1; then
    for phase in platform migrations apps; do
      kube apply --dry-run=server -f "${RENDER_ROOT}/${phase}.yaml" >/dev/null
    done
  else
    printf 'Server dry-run skipped for namespaced resources: namespace %s does not exist yet.\n' "${NAMESPACE}"
  fi
fi

printf 'Kubernetes manifests are valid for image tag %s.\n' "${IMAGE_TAG}"
