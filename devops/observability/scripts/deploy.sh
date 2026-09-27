#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
parse_kubeconfig "$@"

kube get --raw=/readyz >/dev/null
kube get secret smartintern-secrets -n "${APP_NAMESPACE}" >/dev/null
ensure_repositories
kube create namespace "${OBS_NAMESPACE}" --dry-run=client -o yaml | kube apply -f - >/dev/null

if ! kube get secret smartintern-grafana-admin -n "${OBS_NAMESPACE}" >/dev/null 2>&1; then
  admin_password="$(openssl rand -base64 36)"
  kube create secret generic smartintern-grafana-admin -n "${OBS_NAMESPACE}" \
    --from-literal=admin-user=admin \
    --from-literal="admin-password=${admin_password}" \
    --dry-run=client -o yaml | kube apply -f - >/dev/null
  unset admin_password
fi

if ! kube get secret smartintern-grafana-tls -n "${OBS_NAMESPACE}" >/dev/null 2>&1; then
  tls_directory="$(mktemp -d)"
  trap 'rm -rf -- "${tls_directory}"' EXIT
  openssl req -x509 -nodes -newkey rsa:2048 -sha256 -days 365 \
    -keyout "${tls_directory}/tls.key" -out "${tls_directory}/tls.crt" \
    -subj '/CN=grafana.smartintern.local/O=SmartIntern Local Development' \
    -addext 'subjectAltName=DNS:grafana.smartintern.local' >/dev/null 2>&1
  kube create secret tls smartintern-grafana-tls -n "${OBS_NAMESPACE}" \
    --cert="${tls_directory}/tls.crt" --key="${tls_directory}/tls.key" \
    --dry-run=client -o yaml | kube apply -f - >/dev/null
  rm -rf -- "${tls_directory}"
  trap - EXIT
fi

kube create configmap smartintern-dashboards -n "${OBS_NAMESPACE}" \
  --from-file="${OBS_ROOT}/grafana/dashboards" \
  --dry-run=client -o yaml | kube apply -f - >/dev/null

if ! kube get deployment ingress-nginx-controller -n ingress-nginx -o json \
  | jq -e '.spec.template.spec.containers[0].args | index("--enable-metrics=true") != null' >/dev/null; then
  kube patch deployment ingress-nginx-controller -n ingress-nginx --type=json \
    -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--enable-metrics=true"}]' >/dev/null
  kube rollout status deployment/ingress-nginx-controller -n ingress-nginx --timeout=240s
fi
kube apply -f "${OBS_ROOT}/ingress-metrics-service.yaml" >/dev/null

postgres_database="$(kube get secret smartintern-secrets -n "${APP_NAMESPACE}" -o jsonpath='{.data.POSTGRES_DB}' | base64 --decode)"
helm_cli upgrade --install smartintern-postgres-exporter \
  prometheus-community/prometheus-postgres-exporter \
  --version "${POSTGRES_EXPORTER_CHART_VERSION}" -n "${APP_NAMESPACE}" \
  --values "${OBS_ROOT}/postgres-exporter-values.yaml" \
  --set-string "config.datasource.database=${postgres_database}" \
  --wait --timeout 5m

helm_cli upgrade --install smartintern-prometheus prometheus-community/prometheus \
  --version "${PROMETHEUS_CHART_VERSION}" -n "${OBS_NAMESPACE}" \
  --values "${OBS_ROOT}/prometheus-values.yaml" \
  --wait --timeout 8m

helm_cli upgrade --install smartintern-grafana grafana-community/grafana \
  --version "${GRAFANA_CHART_VERSION}" -n "${OBS_NAMESPACE}" \
  --values "${OBS_ROOT}/grafana-values.yaml" \
  --wait --timeout 8m

kube rollout restart deployment/smartintern-grafana -n "${OBS_NAMESPACE}" >/dev/null
kube rollout status deployment/smartintern-grafana -n "${OBS_NAMESPACE}" --timeout=240s
kube get pods,pvc,ingress -n "${OBS_NAMESPACE}"
