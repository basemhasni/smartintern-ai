#!/usr/bin/env bash
set -Eeuo pipefail

namespace=smartintern-dev
output=
while (($#)); do
  case "$1" in
    --namespace) namespace="$2"; shift 2 ;;
    --kubeconfig) export KUBECONFIG="$2"; shift 2 ;;
    --output) output="$2"; shift 2 ;;
    *) printf 'Unknown argument: %s\n' "$1" >&2; exit 2 ;;
  esac
done

[[ -n "$output" ]] || { printf 'Usage: backup-postgres.sh --output FILE [--namespace NS] [--kubeconfig FILE]\n' >&2; exit 2; }
command -v kubectl >/dev/null
mkdir -p "$(dirname "$output")"
tmp="${output}.partial"
trap 'rm -f -- "$tmp"' EXIT

kubectl -n "$namespace" exec postgres-0 -- sh -c \
  'pg_dump --format=custom --no-owner --no-acl -U "$POSTGRES_USER" -d "$POSTGRES_DB"' > "$tmp"
[[ -s "$tmp" ]]
kubectl -n "$namespace" exec -i postgres-0 -- pg_restore --list < "$tmp" >/dev/null
mv -- "$tmp" "$output"
printf 'PostgreSQL backup created and archive validated: %s\n' "$output"
