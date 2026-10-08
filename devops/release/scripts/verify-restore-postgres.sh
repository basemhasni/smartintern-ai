#!/usr/bin/env bash
set -Eeuo pipefail

namespace=smartintern-dev
input=
while (($#)); do
  case "$1" in
    --namespace) namespace="$2"; shift 2 ;;
    --kubeconfig) export KUBECONFIG="$2"; shift 2 ;;
    --input) input="$2"; shift 2 ;;
    *) printf 'Unknown argument: %s\n' "$1" >&2; exit 2 ;;
  esac
done

[[ -f "$input" ]] || { printf 'Usage: verify-restore-postgres.sh --input FILE [--namespace NS] [--kubeconfig FILE]\n' >&2; exit 2; }
command -v kubectl >/dev/null
temp_db="step10_restore_$(date +%s)_$RANDOM"
created=false

query_current() {
  kubectl -n "$namespace" exec postgres-0 -- sh -c \
    'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "$1"' sh "$1"
}

query_temp() {
  kubectl -n "$namespace" exec postgres-0 -- sh -c \
    'psql -U "$POSTGRES_USER" -d "$1" -Atc "$2"' sh "$temp_db" "$1"
}

cleanup() {
  if [[ "$created" == true ]]; then
    kubectl -n "$namespace" exec postgres-0 -- sh -c \
      'dropdb --if-exists -U "$POSTGRES_USER" "$1"' sh "$temp_db" >/dev/null
  fi
}
trap cleanup EXIT

source_count="$(query_current 'SELECT COUNT(*) FROM "User";')"
source_tables="$(query_current "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")"
source_migrations="$(query_current 'SELECT COUNT(*) FROM "_prisma_migrations";')"

kubectl -n "$namespace" exec postgres-0 -- sh -c \
  'createdb -U "$POSTGRES_USER" -T template0 "$1"' sh "$temp_db"
created=true
kubectl -n "$namespace" exec -i postgres-0 -- sh -c \
  'pg_restore --exit-on-error --single-transaction --no-owner --no-acl -U "$POSTGRES_USER" -d "$1"' sh "$temp_db" < "$input"

restored_count="$(query_temp 'SELECT COUNT(*) FROM "User";')"
restored_tables="$(query_temp "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")"
restored_migrations="$(query_temp 'SELECT COUNT(*) FROM "_prisma_migrations";')"
vector="$(query_temp "SELECT extname FROM pg_extension WHERE extname = 'vector';")"
distance="$(query_temp "SELECT '[1,2,3]'::vector <-> '[1,2,4]'::vector;")"

[[ "$source_count" == "$restored_count" ]]
[[ "$source_tables" == "$restored_tables" ]]
[[ "$source_migrations" -gt 0 && "$source_migrations" == "$restored_migrations" ]]
[[ "$vector" == vector ]]
[[ "$distance" == 1 ]]
printf 'Restore verified in temporary database: users=%s, tables=%s, migrations=%s, pgvector=%s, vector distance=%s.\n' \
  "$restored_count" "$restored_tables" "$restored_migrations" "$vector" "$distance"
