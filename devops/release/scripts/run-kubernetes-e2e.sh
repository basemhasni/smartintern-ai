#!/usr/bin/env bash
set -Eeuo pipefail
namespace=smartintern-dev
while (($#)); do
  case "$1" in
    --kubeconfig) export KUBECONFIG="$2"; shift 2 ;;
    --namespace) namespace="$2"; shift 2 ;;
    *) printf 'Unknown argument: %s\n' "$1" >&2; exit 2 ;;
  esac
done
run_id="$(openssl rand -hex 8)"
pod="step10-e2e-$run_id"
created=false
cleanup() {
  if [[ "$created" == true ]]; then
    kubectl -n "$namespace" exec deployment/backend -- env E2E_RUN_ID="$run_id" node scripts/cleanup-e2e.js
    kubectl -n "$namespace" delete pod "$pod" --ignore-not-found --wait=true --timeout=60s
  fi
}
trap cleanup EXIT
kubectl -n "$namespace" exec deployment/backend -- env E2E_RUN_ID="$run_id" node scripts/seed-e2e-admin.js
created=true
ingress_ip="$(kubectl -n ingress-nginx get service ingress-nginx-controller -o jsonpath='{.spec.clusterIP}')"
overrides="$(jq -n --arg ip "$ingress_ip" '{spec: {automountServiceAccountToken: false, activeDeadlineSeconds: 900, securityContext: {runAsUser: 1000, runAsGroup: 1000, seccompProfile: {type: "RuntimeDefault"}}, hostAliases: [{ip: $ip, hostnames: ["smartintern.local"]}]}}')"
kubectl -n "$namespace" run "$pod" --restart=Never \
  --image=mcr.microsoft.com/playwright:v1.63.0-noble --overrides="$overrides" \
  --command -- sleep 900
kubectl -n "$namespace" wait "pod/$pod" --for=condition=Ready --timeout=300s
kubectl -n "$namespace" exec "$pod" -- mkdir -p /tmp/e2e
tar -C frontend-web -cf - package.json package-lock.json playwright.config.js e2e \
  | kubectl -n "$namespace" exec -i "$pod" -- tar -xf - -C /tmp/e2e
result=0
if kubectl -n "$namespace" exec "$pod" -- env CI=true E2E_RUN_ID="$run_id" \
  E2E_BASE_URL=https://smartintern.local E2E_IGNORE_HTTPS_ERRORS=true \
  sh -ec 'cd /tmp/e2e; npm ci --no-audit; npm run test:e2e'; then
  printf 'Kubernetes HTTPS browser/API E2E passed.\n'
else
  result=$?
fi
mkdir -p frontend-web/test-results-kubernetes
if kubectl -n "$namespace" exec "$pod" -- test -d /tmp/e2e/test-results; then
  kubectl -n "$namespace" exec "$pod" -- tar -cf - -C /tmp/e2e/test-results . \
    | tar -xf - -C frontend-web/test-results-kubernetes
fi
exit "$result"
