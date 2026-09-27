#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
parse_kubeconfig "$@"

ensure_repositories
chart_dir="$(mktemp -d)"
trap 'rm -rf -- "${chart_dir}"' EXIT
for dashboard in "${OBS_ROOT}"/grafana/dashboards/*.json; do
  jq -e '.uid and .title and (.panels | length > 0) and all(.panels[]; .targets[0].expr != "")' "${dashboard}" >/dev/null
done

helm_cli pull prometheus-community/prometheus --version "${PROMETHEUS_CHART_VERSION}" --untar --untardir "${chart_dir}"
helm_cli pull grafana-community/grafana --version "${GRAFANA_CHART_VERSION}" --untar --untardir "${chart_dir}"
helm_cli pull prometheus-community/prometheus-postgres-exporter --version "${POSTGRES_EXPORTER_CHART_VERSION}" --untar --untardir "${chart_dir}"
helm_cli lint "${chart_dir}/prometheus" --values "${OBS_ROOT}/prometheus-values.yaml"
helm_cli lint "${chart_dir}/grafana" --values "${OBS_ROOT}/grafana-values.yaml"
helm_cli lint "${chart_dir}/prometheus-postgres-exporter" --values "${OBS_ROOT}/postgres-exporter-values.yaml"

for spec in \
  "smartintern-prometheus prometheus-community/prometheus ${PROMETHEUS_CHART_VERSION} prometheus-values.yaml ${OBS_NAMESPACE}" \
  "smartintern-grafana grafana-community/grafana ${GRAFANA_CHART_VERSION} grafana-values.yaml ${OBS_NAMESPACE}" \
  "smartintern-postgres-exporter prometheus-community/prometheus-postgres-exporter ${POSTGRES_EXPORTER_CHART_VERSION} postgres-exporter-values.yaml ${APP_NAMESPACE}"; do
  read -r release chart version values namespace <<< "${spec}"
  helm_cli template "${release}" "${chart}" --version "${version}" \
    --namespace "${namespace}" --values "${OBS_ROOT}/${values}" >/dev/null
done
printf 'Observability chart rendering and five dashboard JSON files validated.\n'
