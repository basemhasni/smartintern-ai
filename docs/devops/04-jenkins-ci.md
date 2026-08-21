# Jenkins CI - SmartIntern AI

## Objective

This step adds continuous integration without deployment. Jenkins validates the
four application workspaces, builds the five local Docker images and starts an
isolated Compose stack for smoke tests. No image is pushed to a registry.

## Architecture

```text
GitHub Multibranch Pipeline
  -> Jenkins controller (JDK 21, port 8090)
     -> Docker CLI over mutual TLS
        -> Docker-in-Docker daemon
           -> application test containers
           -> CI Docker images
           -> isolated Compose project and volumes
```

The Docker daemon is the only privileged container. The Jenkins controller is
not privileged and runs as the image's `jenkins` user. Jenkins and the daemon
share `jenkins-data` so Docker Pipeline containers can mount the checked-out
workspace. Docker client certificates are stored in the dedicated
`jenkins-docker-certs` volume and mounted read-only in Jenkins. Docker layers
and build cache use the named `jenkins-docker-data` volume instead of anonymous
volumes.

## Jenkins Installation

Prerequisites:

- Docker Desktop or Docker Engine with Compose v2;
- ports `8090` and `50000` available, or overridden at runtime;
- access from Jenkins to the Git repository and the public package registries.

Build and start the controller and its Docker daemon:

```powershell
docker compose -f devops/jenkins/compose.yaml up -d --build
docker compose -f devops/jenkins/compose.yaml ps
docker compose -f devops/jenkins/compose.yaml logs -f jenkins
```

Open `http://localhost:8090`. Retrieve the initial password locally without
publishing it in logs or documentation:

```powershell
docker compose -f devops/jenkins/compose.yaml exec jenkins `
  cat /var/jenkins_home/secrets/initialAdminPassword
```

Complete the setup wizard, create the local administrator and keep the Jenkins
URL set to the URL used by operators.

Stop Jenkins without deleting its state:

```powershell
docker compose -f devops/jenkins/compose.yaml down
```

Do not add `--volumes` unless the Jenkins configuration and build history must
be permanently deleted.

## Jenkins Docker Image

[`devops/jenkins/Dockerfile`](../../devops/jenkins/Dockerfile) extends the
Jenkins LTS JDK 21 image. It adds only Git, the Docker CLI and Docker Compose v2.
Plugins are pinned by the controller image through
[`plugins.txt`](../../devops/jenkins/plugins.txt).

Installed plugin families:

- Declarative Pipeline and Pipeline aggregation;
- Git and GitHub Branch Source;
- credentials binding;
- Docker Pipeline;
- timestamps.

Jenkins core is pinned to `2.568.1-lts-jdk21`, Docker CLI to `29.7.2`, Compose
to `5.5.0` and Docker-in-Docker to `28.3.2-dind`. Top-level plugin versions are
also pinned. Upgrade these versions deliberately and rebuild the image.

## Docker-in-Docker

The controller uses these runtime variables:

```text
DOCKER_HOST=tcp://docker:2376
DOCKER_CERT_PATH=/certs/client
DOCKER_TLS_VERIFY=1
```

Verify that Jenkins can reach the TLS-protected daemon:

```powershell
docker compose -f devops/jenkins/compose.yaml exec jenkins docker version
docker compose -f devops/jenkins/compose.yaml exec jenkins docker compose version
```

The DinD daemon is intentionally isolated from the host Docker socket. A
container escape would still have serious impact inside the DinD environment,
so Jenkins access and plugin updates must remain controlled.

## Persistent Data

The `jenkins-data` volume persists configuration, credentials, jobs, build
history and workspaces. `jenkins-docker-certs` persists the generated client
certificates, while `jenkins-docker-data` persists daemon layers and caches.
Normal `down` and subsequent `up -d` preserve all three volumes.

Back up `jenkins-data` before controller upgrades. Never commit data exported
from this volume because it may contain encrypted credentials and sensitive job
metadata.

## GitHub Configuration

For a private repository, create a Jenkins credential in **Manage Jenkins >
Credentials**. Prefer an SSH username/private-key credential scoped only to the
repository, or a narrowly scoped GitHub token when HTTPS is required. Never put
the credential in the `Jenkinsfile`.

Create a **Multibranch Pipeline**:

1. Add a GitHub branch source.
2. Enter the repository URL and select the Jenkins credential.
3. Keep the script path as `Jenkinsfile`.
4. Enable branch and pull-request discovery appropriate to the repository.
5. Run **Scan Multibranch Pipeline Now**.

The first scan can only see this pipeline after the user commits and pushes the
new `Jenkinsfile`. This DevOps step deliberately does not create that commit.

## Jenkinsfile

The root [`Jenkinsfile`](../../Jenkinsfile) is Declarative Pipeline syntax. It
uses a 90-minute timeout, timestamps, build retention and one active build per
branch. Repeated build requests are queued instead of aborting the active build,
and interrupted builds are not resumed after a controller restart. Every
checkout receives:

- a 12-character commit tag for Docker images;
- a Compose project named `smartintern-ci-BUILD_NUMBER`;
- unique PostgreSQL and upload volume names.

### CI Stages

| Stage | Validation |
| --- | --- |
| Checkout / Preflight | Git revision, Docker Engine and Compose v2 |
| Frontend CI | `npm ci`, deterministic tests, Vite production build |
| Backend CI | `npm ci`, Prisma Client generation, Node tests |
| AI Service CI | dependency install, `compileall`, 96 unit tests |
| Mobile CI | `npm ci`, Expo lint, TypeScript, Expo Doctor |
| Compose Validation | resolved CI Compose configuration |
| Docker Build | frontend, backend runtime/migrate, AI and PostgreSQL |
| Compose Smoke Test | DB, pgvector, migration and three health endpoints |

The four application validations run in parallel with pinned Node 20.19.4 and
Python 3.11.9 containers. Evaluation scripts that may call external models or
incur cost are excluded; the deterministic AI unit suite is included.

## Docker Validation And Builds

The pipeline builds local images tagged with the checked-out commit:

```text
smartintern-frontend:COMMIT
smartintern-backend:COMMIT
smartintern-backend-migrate:COMMIT
smartintern-ai:COMMIT
smartintern-postgres:COMMIT
```

There is no registry login and no `docker push`. The final cleanup removes only
images with the current build tag.

## CI Isolation

`.env.ci.example` contains disposable non-production CI values. It is safe to
version because it contains no real secret and must never be reused outside CI.
Host ports are set to `0`, so Docker chooses ephemeral ports and concurrent
local development ports are not claimed.

The CI Compose project uses new names for:

- project/network: `smartintern-ci-BUILD_NUMBER`;
- PostgreSQL volume: `smartintern-ci-BUILD_NUMBER-postgres-data`;
- uploads volume: `smartintern-ci-BUILD_NUMBER-backend-uploads`.

The regular `smartintern-postgres-data` development volume is never mounted or
removed by the pipeline. `POSTGRES_VOLUME_EXTERNAL` remains `true` by default,
so the normal development workflow from Step 3 is unchanged.

## Cleanup

The `post { always { ... } }` block runs even after a failed stage. It executes
`docker compose down --volumes --remove-orphans` only for the current CI project,
removes only current-tag images and deletes the current Jenkins workspace.

If Jenkins is interrupted before post actions complete, inspect and remove only
the affected project:

```powershell
docker compose -p smartintern-ci-BUILD_NUMBER `
  --env-file .env.ci.example down --volumes --remove-orphans
```

Do not use a global Docker prune on a shared workstation.

## Troubleshooting

### Jenkins remains unhealthy

```powershell
docker compose -f devops/jenkins/compose.yaml ps
docker compose -f devops/jenkins/compose.yaml logs docker
docker compose -f devops/jenkins/compose.yaml logs jenkins
```

Confirm that port `8090` is free or start with another port:

```powershell
$env:JENKINS_HTTP_PORT = "8091"
docker compose -f devops/jenkins/compose.yaml up -d
```

### Build is aborted or superseded

An `Aborted by admin` message means the build was stopped from Jenkins; it is
not a test failure. Let the first build finish because downloading runtime
images and installing all monorepo dependencies can take several minutes. New
requests now wait in the queue instead of replacing the running build.

After an intentional abort, wait until the executor is idle before restarting
Jenkins or launching another build. Pipelines interrupted by a controller
restart are deliberately not resumed; rerun them from a clean checkout.

The Docker Workflow warning saying that the controller workspace `could not be
found among []` is expected with the separate TLS DinD daemon. It is harmless
when the following `docker run` and `docker top` commands succeed, because both
containers share `jenkins-data` at the same absolute path.

### Docker commands fail in Jenkins

Check that the `docker` service is healthy, the certificate volume is mounted
and `DOCKER_HOST`, `DOCKER_CERT_PATH` and `DOCKER_TLS_VERIFY` are unchanged.

### Private repository checkout fails

Verify the Multibranch source URL, credential selection, key permissions and
repository access. Do not disable host-key or TLS verification as a shortcut.

### Package install fails

Confirm DNS, proxy and CA configuration inside the relevant build container.
Add a corporate CA only when the organization requires it; do not disable TLS
verification in the pipeline.

### Compose smoke test fails

Open the failing service logs through the exact CI project name printed by the
build. Check the migration container first, then PostgreSQL, backend, AI and
frontend in dependency order.

## Security

- no production secret is stored in Git or Docker build arguments;
- GitHub credentials stay in the Jenkins credential store;
- no host Docker socket is mounted into Jenkins;
- the Jenkins controller runs non-root;
- only the isolated Docker daemon is privileged;
- external AI evaluation and deployment actions are absent;
- generated workspaces, CI volumes and current-build images are cleaned.

Dependency audit findings are reported by package managers but are not repaired
with forced major upgrades in this infrastructure-only step.

## Next Step

The next DevOps step may add SonarQube analysis and quality gates. Registry push,
Kubernetes and continuous deployment remain outside this pipeline.
