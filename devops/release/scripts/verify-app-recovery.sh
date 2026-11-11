#!/usr/bin/env bash
set -Eeuo pipefail

namespace=smartintern-dev
while (($#)); do
  case "$1" in
    --namespace) namespace="$2"; shift 2 ;;
    --kubeconfig) export KUBECONFIG="$2"; shift 2 ;;
    *) printf 'Unknown argument: %s\n' "$1" >&2; exit 2 ;;
  esac
done

for component in frontend backend ai-service; do
  selector="app.kubernetes.io/component=$component"
  before="$(kubectl -n "$namespace" get pods -l "$selector" -o jsonpath='{.items[0].metadata.uid}')"
  [[ -n "$before" ]] || { printf 'No pod found for %s\n' "$component" >&2; exit 1; }
  kubectl -n "$namespace" delete pod -l "$selector" --wait=true --timeout=120s
  kubectl -n "$namespace" rollout status "deployment/$component" --timeout=300s
  kubectl -n "$namespace" wait pods -l "$selector" --for=condition=Ready --timeout=300s
  after="$(kubectl -n "$namespace" get pods -l "$selector" -o jsonpath='{.items[0].metadata.uid}')"
  [[ -n "$after" && "$after" != "$before" ]] || {
    printf '%s pod was not replaced after deletion\n' "$component" >&2
    exit 1
  }
  printf '%s recovery verified: replacement pod Ready.\n' "$component"
done
