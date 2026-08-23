#!/bin/sh
set -eu

jenkins_home=${JENKINS_HOME:-/var/jenkins_home}
cert_dir="${jenkins_home}/certs"
local_ca="${cert_dir}/local-root-ca.crt"
ca_bundle="${cert_dir}/ci-ca-bundle.crt"

mkdir -p "${cert_dir}"

if [ -s "${local_ca}" ]; then
  cp "${local_ca}" /usr/local/share/ca-certificates/smartintern-local-root-ca.crt
  update-ca-certificates >/dev/null
fi

cp /etc/ssl/certs/ca-certificates.crt "${ca_bundle}"
chown -R jenkins:jenkins "${cert_dir}"
chmod 0644 "${ca_bundle}"

export HOME="${jenkins_home}"
export USER=jenkins
export LOGNAME=jenkins

exec setpriv --reuid=jenkins --regid=jenkins --init-groups \
  /usr/bin/tini -- /usr/local/bin/jenkins.sh "$@"
