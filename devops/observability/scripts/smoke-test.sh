#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
parse_kubeconfig "$@"

forward_pids=()
forward_logs=()
cleanup() {
  for pid in "${forward_pids[@]}"; do
    kill "${pid}" >/dev/null 2>&1 || :
    wait "${pid}" >/dev/null 2>&1 || :
  done
  for log in "${forward_logs[@]}"; do rm -f -- "${log}"; done
}
trap cleanup EXIT

forward_service() {
  local namespace="$1" service="$2" remote_port="$3"
  local port log
  port="$(shuf -i 20000-45000 -n 1)"
  log="$(mktemp)"
  kube port-forward -n "${namespace}" "service/${service}" "${port}:${remote_port}" >"${log}" 2>&1 &
  forward_pids+=("$!")
  forward_logs+=("${log}")
  FORWARD_PORT="${port}"
}

wait_http() {
  local url="$1"
  for _ in {1..30}; do
    if curl --fail --silent --max-time 3 "${url}" >/dev/null; then return 0; fi
    sleep 2
  done
  printf 'Endpoint did not become ready: %s\n' "${url}" >&2
  return 1
}

query_prometheus() {
  curl --fail --silent --show-error --get \
    --data-urlencode "query=$1" "${prometheus_url}/api/v1/query"
}

check_query() {
  query_prometheus "$1" | jq -e '.status == "success" and (.data.result | length > 0)' >/dev/null
}

for deployment in smartintern-prometheus-server smartintern-prometheus-kube-state-metrics smartintern-grafana; do
  kube rollout status "deployment/${deployment}" -n "${OBS_NAMESPACE}" --timeout=240s
done
kube rollout status daemonset/smartintern-prometheus-prometheus-node-exporter -n "${OBS_NAMESPACE}" --timeout=240s
kube rollout status deployment/smartintern-postgres-exporter-prometheus-postgres-exporter -n "${APP_NAMESPACE}" --timeout=240s

if [[ "$(kube get pvc -n "${OBS_NAMESPACE}" -o json | jq '[.items[] | select(.status.phase == "Bound")] | length')" -lt 2 ]]; then
  printf 'Prometheus and Grafana PVCs are not both Bound.\n' >&2
  exit 1
fi

forward_service "${APP_NAMESPACE}" backend 5000
backend_url="http://127.0.0.1:${FORWARD_PORT}"
wait_http "${backend_url}/health"
curl --fail --silent --show-error "${backend_url}/metrics" | grep 'smartintern_backend_http_requests_total' >/dev/null

forward_service "${APP_NAMESPACE}" ai-service 8000
ai_url="http://127.0.0.1:${FORWARD_PORT}"
wait_http "${ai_url}/health"
curl --fail --silent --show-error "${ai_url}/metrics" | grep 'smartintern_ai_http_requests_total' >/dev/null

exporter_service="$(kube get service -n "${APP_NAMESPACE}" -o json | jq -r '.items[] | select(.metadata.name | contains("postgres-exporter")) | .metadata.name' | head -1)"
[[ -n "${exporter_service}" ]]
forward_service "${APP_NAMESPACE}" "${exporter_service}" 80
exporter_url="http://127.0.0.1:${FORWARD_PORT}"
wait_http "${exporter_url}/metrics"
curl --fail --silent --show-error "${exporter_url}/metrics" | grep 'pg_up 1' >/dev/null

forward_service "${OBS_NAMESPACE}" smartintern-prometheus-server 80
prometheus_url="http://127.0.0.1:${FORWARD_PORT}"
wait_http "${prometheus_url}/-/ready"

targets_ready=false
for _ in {1..18}; do
  targets="$(curl --fail --silent --show-error "${prometheus_url}/api/v1/targets?state=active")"
  if printf '%s' "${targets}" | jq -e '
    [.data.activeTargets[] | select(.health == "up") | .labels.service // ""] as $services |
    ($services | index("backend") != null) and
    ($services | index("ai-service") != null) and
    any($services[]; contains("postgres-exporter")) and
    any($services[]; contains("kube-state-metrics")) and
    ($services | index("smartintern-ingress-metrics") != null)
  ' >/dev/null; then
    targets_ready=true
    break
  fi
  sleep 10
done
if [[ "${targets_ready}" != true ]]; then
  printf 'Required Prometheus targets did not become UP.\n' >&2
  printf '%s' "${targets}" | jq -r '.data.activeTargets[] | [.labels.job, .labels.service, .health, .lastError] | @tsv' >&2
  exit 1
fi

for metric in \
  'up{namespace="smartintern-dev",service="backend"}' \
  'up{namespace="smartintern-dev",service="ai-service"}' \
  'smartintern_backend_http_requests_total' \
  'smartintern_ai_http_requests_total' \
  'pg_up{namespace="smartintern-dev"}' \
  'kube_pod_status_phase{namespace="smartintern-dev"}' \
  'node_cpu_seconds_total' \
  'container_cpu_usage_seconds_total{job="kubernetes-nodes-resource",namespace="smartintern-dev",pod="postgres-0",container="postgres"}' \
  'container_memory_working_set_bytes{job="kubernetes-nodes-resource",namespace="smartintern-dev",pod="postgres-0",container="postgres"}'; do
  check_query "${metric}"
done
check_query 'nginx_ingress_controller_requests'
query_prometheus 'pg_up{namespace="smartintern-dev"}' | jq -e '[.data.result[] | select(.value[1] == "1")] | length > 0' >/dev/null

forward_service "${OBS_NAMESPACE}" smartintern-grafana 80
grafana_url="http://127.0.0.1:${FORWARD_PORT}"
wait_http "${grafana_url}/api/health"
grafana_password="$(kube get secret smartintern-grafana-admin -n "${OBS_NAMESPACE}" -o jsonpath='{.data.admin-password}' | base64 --decode)"
curl --fail --silent --show-error --user "admin:${grafana_password}" \
  "${grafana_url}/api/datasources/uid/prometheus/health" | jq -e '.status == "OK"' >/dev/null
dashboards="$(curl --fail --silent --show-error --user "admin:${grafana_password}" \
  "${grafana_url}/api/search?type=dash-db&limit=1000")"
unset grafana_password
for uid in smartintern-overview smartintern-backend smartintern-ai smartintern-postgres smartintern-kubernetes; do
  printf '%s' "${dashboards}" | jq -e --arg uid "${uid}" \
    '[.[] | select(.uid == $uid)] | length == 1' >/dev/null
done

[[ "$(kube get ingress smartintern-grafana -n "${OBS_NAMESPACE}" -o jsonpath='{.spec.tls[0].secretName}')" == smartintern-grafana-tls ]]
printf 'Observability smoke passed: targets, metrics, PVCs, datasource, dashboards and Grafana ingress.\n'
