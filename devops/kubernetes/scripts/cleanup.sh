#!/usr/bin/env bash

set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

CONFIRMED="false"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --kubeconfig)
      KUBECONFIG_PATH="$2"
      shift 2
      ;;
    --confirm)
      CONFIRMED="true"
      shift
      ;;
    *)
      printf 'Unknown argument: %s\n' "$1" >&2
      exit 1
      ;;
  esac
done

if [[ "${CONFIRMED}" != "true" ]]; then
  printf 'Refusing to delete namespace %s without --confirm.\n' "${NAMESPACE}" >&2
  exit 1
fi

require_command kubectl
kube delete namespace "${NAMESPACE}" --ignore-not-found --wait=true
printf 'Namespace %s deleted. The Minikube profile was preserved.\n' "${NAMESPACE}"
