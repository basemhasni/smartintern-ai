#!/bin/sh
set -eu

local_ca=/var/jenkins_home/certs/local-root-ca.crt

if [ -s "${local_ca}" ]; then
  cp "${local_ca}" /usr/local/share/ca-certificates/smartintern-local-root-ca.crt
  update-ca-certificates >/dev/null
fi

exec dockerd-entrypoint.sh "$@"
