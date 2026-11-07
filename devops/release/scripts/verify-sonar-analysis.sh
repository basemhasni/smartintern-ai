#!/usr/bin/env bash
set -Eeuo pipefail
set +x
umask 077
: "${SONAR_HOST_URL:?Missing Sonar server}"
: "${SONAR_AUTH_TOKEN:?Missing Sonar credential}"
: "${SONAR_PROJECT_KEY:?Missing Sonar project}"

mkdir -p artifacts/validation
configuration="$(mktemp "${TMPDIR:-/tmp}/smartintern-sonar-curl.XXXXXX")"
trap 'rm -f -- "$configuration"' EXIT
printf 'user = "%s:"\n' "${SONAR_AUTH_TOKEN}" > "$configuration"

read_sonar() {
  local endpoint="$1"; shift
  curl --config "$configuration" --fail --silent --show-error \
    --header 'Cache-Control: no-cache' --get "$@" \
    "${SONAR_HOST_URL%/}/api/${endpoint}"
}

read_sonar project_analyses/search \
  --data-urlencode "project=${SONAR_PROJECT_KEY}" --data-urlencode ps=1 \
  > artifacts/validation/sonar-analysis.json
revision="$(git rev-parse HEAD)"
jq --exit-status --arg revision "$revision" \
  '.analyses[0].revision == $revision' artifacts/validation/sonar-analysis.json >/dev/null

read_sonar measures/component --data-urlencode "component=${SONAR_PROJECT_KEY}" \
  --data-urlencode metricKeys=new_lines,new_coverage,coverage \
  > artifacts/validation/sonar-measures.json
new_lines="$(jq --raw-output \
  '[.component.measures[] | select(.metric == "new_lines") | (.period.value // .value) | tonumber][0] // 0' \
  artifacts/validation/sonar-measures.json)"
if ! [[ "$new_lines" =~ ^[0-9]+$ ]] || (( new_lines == 0 )); then
  printf 'Sonar reference does not cover the Step 10 changes: new_lines=%s.\n' "$new_lines" >&2
  exit 1
fi

read_sonar qualitygates/project_status --data-urlencode "projectKey=${SONAR_PROJECT_KEY}" \
  > artifacts/validation/sonar-gate.json
jq --exit-status '.projectStatus.status == "OK"' artifacts/validation/sonar-gate.json >/dev/null
printf 'Sonar verified: revision=%s, new_lines=%s, gate=OK.\n' "$revision" "$new_lines"
