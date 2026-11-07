#!/usr/bin/env bash
set -Eeuo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/postgres-common.sh"
input=
expect_test_data=false
while (($#)); do
  case "$1" in
    --namespace) namespace="$2"; shift 2 ;;
    --kubeconfig) export KUBECONFIG="$2"; shift 2 ;;
    --input) input="$2"; shift 2 ;;
    --compose-project) compose_project="$2"; shift 2 ;;
    --compose-env) compose_env="$2"; shift 2 ;;
    --expect-test-data) expect_test_data=true; shift ;;
    *) printf 'Unknown argument: %s\n' "$1" >&2; exit 2 ;;
  esac
done

[[ -f "$input" ]] || { printf 'Usage: verify-restore-postgres.sh --input FILE [--namespace NS] [--kubeconfig FILE]\n' >&2; exit 2; }
temp_db="step10_restore_$(date +%s)_$RANDOM"
created=false

query_temp() {
  pg_exec sh -c \
    'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$1" -Atc "$2"' sh "$temp_db" "$1"
}

cleanup() {
  if [[ "$created" == true ]]; then
    pg_exec sh -c \
      'dropdb --if-exists -U "$POSTGRES_USER" "$1"' sh "$temp_db" >/dev/null
  fi
}
trap cleanup EXIT

# Do not compare with live row counts: writes since the dump are legitimate.
# Validate the archive's own schema, migration state, synthetic data and vectors.
pg_exec sh -c \
  'createdb -U "$POSTGRES_USER" -T template0 "$1"' sh "$temp_db"
created=true
pg_exec sh -c \
  'pg_restore --exit-on-error --single-transaction --no-owner --no-acl -U "$POSTGRES_USER" -d "$1"' sh "$temp_db" < "$input"

restored_count="$(query_temp 'SELECT COUNT(*) FROM "User";')"
restored_tables="$(query_temp "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")"
restored_migrations="$(query_temp 'SELECT COUNT(*) FROM "_prisma_migrations";')"
vector="$(query_temp "SELECT extname FROM pg_extension WHERE extname = 'vector';")"
distance="$(query_temp "SELECT '[1,2,3]'::vector <-> '[1,2,4]'::vector;")"

[[ "$restored_tables" -ge 10 && "$restored_migrations" -gt 0 ]]
[[ "$(query_temp 'SELECT COUNT(*) FROM "_prisma_migrations" WHERE finished_at IS NULL AND rolled_back_at IS NULL;')" == 0 ]]
for table in User Student Company InternshipOffer Application CV MatchingResult MotivationLetter VectorDocument _prisma_migrations; do
  [[ "$(query_temp "SELECT to_regclass('public.\"$table\"') IS NOT NULL;")" == t ]]
done
for migration_dir in backend-api/prisma/migrations/*/; do
  migration="${migration_dir%/}"; migration="${migration##*/}"
  [[ "$migration" =~ ^[A-Za-z0-9_]+$ ]]
  migration_query="SELECT COUNT(*) FROM \"_prisma_migrations\" WHERE migration_name = '$migration' AND finished_at IS NOT NULL AND rolled_back_at IS NULL;"
  [[ "$(query_temp "$migration_query")" == 1 ]]
done
if [[ "$expect_test_data" == true ]]; then
  test_user_query="SELECT COUNT(*) FROM \"User\" WHERE email LIKE '%@example.invalid';"
  [[ "$(query_temp "$test_user_query")" -gt 0 ]]
  [[ "$(query_temp 'SELECT COUNT(*) FROM "Application";')" -gt 0 ]]
fi
[[ "$vector" == vector ]]
[[ "$distance" == 1 ]]
printf 'Restore verified in temporary database: users=%s, tables=%s, migrations=%s, pgvector=%s, vector distance=%s.\n' \
  "$restored_count" "$restored_tables" "$restored_migrations" "$vector" "$distance"
