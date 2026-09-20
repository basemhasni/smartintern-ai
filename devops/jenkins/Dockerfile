# syntax=docker/dockerfile:1.7

FROM jenkins/jenkins:2.568.1-lts-jdk21

ARG DOCKER_CLI_VERSION=5:29.7.2-1~debian.13~trixie
ARG DOCKER_COMPOSE_VERSION=5.5.0-1~debian.13~trixie
ARG DOCKER_BUILDX_VERSION=0.36.1-1~debian.13~trixie
ARG KUBECTL_VERSION=1.32.2
ARG TARGETARCH

USER root

RUN --mount=type=secret,id=local_ca,uid=1000,gid=1000,mode=0400 \
  set -eu; \
  if [ -s /run/secrets/local_ca ]; then \
    cat /etc/ssl/certs/ca-certificates.crt /run/secrets/local_ca > /tmp/build-ca.crt; \
    export CURL_CA_BUNDLE=/tmp/build-ca.crt SSL_CERT_FILE=/tmp/build-ca.crt; \
  fi \
  && DEBIAN_FRONTEND=noninteractive apt-get update \
  && apt-get install --yes --no-install-recommends ca-certificates curl git gnupg \
  && install -m 0755 -d /etc/apt/keyrings \
  && curl -fsSL https://download.docker.com/linux/debian/gpg \
    -o /etc/apt/keyrings/docker.asc \
  && chmod a+r /etc/apt/keyrings/docker.asc \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo \"${VERSION_CODENAME}\") stable" \
    > /etc/apt/sources.list.d/docker.list \
  && apt-get update \
  && apt-get install --yes --no-install-recommends \
    docker-ce-cli="${DOCKER_CLI_VERSION}" \
    docker-buildx-plugin="${DOCKER_BUILDX_VERSION}" \
    docker-compose-plugin="${DOCKER_COMPOSE_VERSION}" \
  && kubectl_arch="${TARGETARCH:-amd64}" \
  && curl -fsSLo /tmp/kubectl \
    "https://dl.k8s.io/release/v${KUBECTL_VERSION}/bin/linux/${kubectl_arch}/kubectl" \
  && curl -fsSLo /tmp/kubectl.sha256 \
    "https://dl.k8s.io/release/v${KUBECTL_VERSION}/bin/linux/${kubectl_arch}/kubectl.sha256" \
  && echo "$(cat /tmp/kubectl.sha256)  /tmp/kubectl" | sha256sum --check \
  && install -m 0755 /tmp/kubectl /usr/local/bin/kubectl \
  && rm -rf /var/lib/apt/lists/* /tmp/build-ca.crt /tmp/kubectl /tmp/kubectl.sha256

COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/ref/plugins.txt

USER jenkins

RUN --mount=type=secret,id=local_ca,uid=1000,gid=1000,mode=0400 \
  set -eu; \
  if [ -s /run/secrets/local_ca ]; then \
    cp "${JAVA_HOME}/lib/security/cacerts" /tmp/jenkins-cacerts; \
    "${JAVA_HOME}/bin/keytool" -importcert -noprompt -trustcacerts \
      -alias smartintern-local-root-ca \
      -file /run/secrets/local_ca \
      -keystore /tmp/jenkins-cacerts \
      -storepass changeit >/dev/null; \
    export JAVA_TOOL_OPTIONS="-Djavax.net.ssl.trustStore=/tmp/jenkins-cacerts -Djavax.net.ssl.trustStorePassword=changeit"; \
  fi; \
  jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt; \
  test -f /usr/share/jenkins/ref/plugins/sonar.jpi; \
  rm -f /tmp/jenkins-cacerts

USER root

ARG HELM_VERSION=4.1.4

RUN --mount=type=secret,id=local_ca,uid=0,gid=0,mode=0400 \
  set -eu; \
  test "${TARGETARCH:-amd64}" = "amd64"; \
  if [ -s /run/secrets/local_ca ]; then \
    cat /etc/ssl/certs/ca-certificates.crt /run/secrets/local_ca > /tmp/build-ca.crt; \
    export CURL_CA_BUNDLE=/tmp/build-ca.crt SSL_CERT_FILE=/tmp/build-ca.crt; \
  fi; \
  curl -fsSLo /tmp/helm.tar.gz \
    "https://get.helm.sh/helm-v${HELM_VERSION}-linux-amd64.tar.gz"; \
  echo "70b2c30a19da4db264dfd68c8a3664e05093a361cefd89572ffb36f8abfa3d09  /tmp/helm.tar.gz" \
    | sha256sum --check; \
  tar -xzf /tmp/helm.tar.gz -C /tmp; \
  install -m 0755 /tmp/linux-amd64/helm /usr/local/bin/helm; \
  rm -rf /tmp/build-ca.crt /tmp/helm.tar.gz /tmp/linux-amd64

COPY --chmod=0755 trust-local-ca-entrypoint.sh /usr/local/bin/trust-local-ca-entrypoint
RUN sed -i 's/\r$//' /usr/local/bin/trust-local-ca-entrypoint

ENTRYPOINT ["/usr/local/bin/trust-local-ca-entrypoint"]
