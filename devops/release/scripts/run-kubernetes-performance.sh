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
pod="step10-performance-$(openssl rand -hex 6)"
cleanup() { kubectl -n "$namespace" delete pod "$pod" --ignore-not-found --wait=true --timeout=60s; }
trap cleanup EXIT
kubectl -n "$namespace" run "$pod" --restart=Never --image=grafana/k6:0.55.2 \
  --overrides='{"spec":{"automountServiceAccountToken":false,"activeDeadlineSeconds":300}}' \
  --command -- sh -c 'sleep 300'
kubectl -n "$namespace" wait "pod/$pod" --for=condition=Ready --timeout=180s
result=0
if kubectl -n "$namespace" exec -i "$pod" -- k6 run --summary-export /tmp/performance.json - \
  < devops/release/performance/smoke.js; then
  printf 'Kubernetes performance thresholds passed.\n'
else
  result=$?
fi
mkdir -p artifacts/validation
if kubectl -n "$namespace" exec "$pod" -- test -f /tmp/performance.json; then
  kubectl -n "$namespace" exec "$pod" -- cat /tmp/performance.json > artifacts/validation/performance-kubernetes.json
fi
exit "$result"
