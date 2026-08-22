# SmartIntern AI SonarQube stack

This independent stack runs SonarQube Community Build with its own PostgreSQL
database. It does not use the SmartIntern application database.

## Start

Create the ignored local environment file from `.env.sonarqube.example`, replace
the placeholders, then run from the repository root:

```powershell
docker compose --env-file devops/sonarqube/.env.sonarqube `
  -f devops/sonarqube/compose.yaml up -d
```

SonarQube is available at `http://localhost:9000` by default. Readiness must be
checked through `GET /api/system/status`; a running container is not sufficient.

## Stop and inspect

```powershell
docker compose --env-file devops/sonarqube/.env.sonarqube `
  -f devops/sonarqube/compose.yaml ps

docker compose --env-file devops/sonarqube/.env.sonarqube `
  -f devops/sonarqube/compose.yaml logs sonarqube

docker compose --env-file devops/sonarqube/.env.sonarqube `
  -f devops/sonarqube/compose.yaml down
```

`down` keeps all named volumes. Do not use `down --volumes` unless permanent
deletion of SonarQube analyses and configuration is intentional.

## Networking

The `sonarqube` service joins the external `jenkins` network with the stable DNS
alias `smartintern-sonarqube`. Jenkins uses
`http://smartintern-sonarqube:9000`; SonarQube reaches the Jenkins webhook at
`http://jenkins:8080/sonarqube-webhook/`.
