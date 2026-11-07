#!/usr/bin/env bash
set -Eeuo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/postgres-common.sh"
output=
while (($#)); do
  case "$1" in
    --namespace) namespace="$2"; shift 2 ;;
    --kubeconfig) export KUBECONFIG="$2"; shift 2 ;;
    --compose-project) compose_project="$2"; shift 2 ;;
    --compose-env) compose_env="$2"; shift 2 ;;
    --output) output="$2"; shift 2 ;;
    *) printf 'Unknown argument: %s\n' "$1" >&2; exit 2 ;;
  esac
done

[[ -n "$output" ]] || { printf 'Usage: backup-postgres.sh --output FILE [--namespace NS] [--kubeconfig FILE]\n' >&2; exit 2; }
umask 077
[[ ! -e "$output" ]] || { printf 'Refusing to overwrite an existing backup.\n' >&2; exit 2; }
mkdir -p "$(dirname "$output")"
tmp="${output}.partial"
trap 'rm -f -- "$tmp"' EXIT

pg_exec sh -c \
  'pg_dump --format=custom --no-owner --no-acl -U "$POSTGRES_USER" -d "$POSTGRES_DB"' > "$tmp"
[[ -s "$tmp" ]]
pg_exec pg_restore --list < "$tmp" >/dev/null
mv -- "$tmp" "$output"
printf 'PostgreSQL backup created and archive validated: %s\n' "$output"
