#!/usr/bin/env bash
set -Eeuo pipefail

OBS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OBS_NAMESPACE=smartintern-observability
APP_NAMESPACE=smartintern-dev
PROMETHEUS_CHART_VERSION=29.34.0
GRAFANA_CHART_VERSION=13.2.6
POSTGRES_EXPORTER_CHART_VERSION=8.2.0
KUBECONFIG_PATH=""

kube() {
  if [[ -n "${KUBECONFIG_PATH}" ]]; then
    kubectl --kubeconfig "${KUBECONFIG_PATH}" "$@"
  else
    kubectl "$@"
  fi
}

helm_cli() {
  local helm_binary=helm
  if ! command -v helm >/dev/null 2>&1; then
    helm_binary="${HOME}/.local/bin/helm"
  fi
  if [[ -n "${KUBECONFIG_PATH}" ]]; then
    KUBECONFIG="${KUBECONFIG_PATH}" "${helm_binary}" "$@"
  else
    "${helm_binary}" "$@"
  fi
}

ensure_repositories() {
  helm_cli repo add prometheus-community https://prometheus-community.github.io/helm-charts --force-update >/dev/null
  helm_cli repo add grafana-community https://grafana-community.github.io/helm-charts --force-update >/dev/null
  helm_cli repo update >/dev/null
}

parse_kubeconfig() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --kubeconfig) KUBECONFIG_PATH="$2"; shift 2 ;;
      *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
    esac
  done
}
