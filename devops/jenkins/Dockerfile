FROM jenkins/jenkins:2.568.1-lts-jdk21

ARG DOCKER_CLI_VERSION=5:29.7.2-1~debian.13~trixie
ARG DOCKER_COMPOSE_VERSION=5.5.0-1~debian.13~trixie

USER root

RUN DEBIAN_FRONTEND=noninteractive apt-get update \
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
    docker-compose-plugin="${DOCKER_COMPOSE_VERSION}" \
  && rm -rf /var/lib/apt/lists/*

COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/ref/plugins.txt

USER jenkins

RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
