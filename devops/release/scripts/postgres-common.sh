#!/usr/bin/env bash
set -Eeuo pipefail

namespace=smartintern-dev
compose_project=
compose_env=.env.ci.example
pg_exec() {
  if [[ -n "$compose_project" ]]; then
    docker compose -p "$compose_project" --env-file "$compose_env" exec -T postgres "$@"
  else
    kubectl --request-timeout=30s -n "$namespace" exec -i postgres-0 -- "$@"
  fi
}
