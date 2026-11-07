param([switch]$Start)
$ErrorActionPreference = 'Stop'
$repository = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$privateDirectory = Join-Path $repository 'artifacts/ci-private'
$privateFile = Join-Path $privateDirectory 'bootstrap.json'
New-Item -ItemType Directory -Force $privateDirectory | Out-Null
$identity = [Security.Principal.WindowsIdentity]::GetCurrent().Name
& icacls $privateDirectory /inheritance:r /grant:r "${identity}:(OI)(CI)F" 'SYSTEM:(OI)(CI)F' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not restrict the private bootstrap directory' }
if (-not (Test-Path -LiteralPath $privateFile)) {
    function New-LocalPassword {
        'Si!A7' + [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(24)).ToLowerInvariant()
    }
    @{
        jenkinsAdminPassword = New-LocalPassword
        sonarAdminPassword = New-LocalPassword
        sonarDbPassword = New-LocalPassword
    } | ConvertTo-Json | Set-Content -LiteralPath $privateFile
}
$private = Get-Content -Raw -LiteralPath $privateFile | ConvertFrom-Json
$sonarEnvironment = Join-Path $repository 'devops/sonarqube/.env.sonarqube'
if (-not (Test-Path -LiteralPath $sonarEnvironment)) {
    @(
        'SONAR_DB_NAME=sonarqube'
        'SONAR_DB_USER=sonarqube'
        "SONAR_DB_PASSWORD=$($private.sonarDbPassword)"
        "SONAR_ADMIN_PASSWORD=$($private.sonarAdminPassword)"
        'SONAR_HTTP_PORT=9000'
    ) | Set-Content -LiteralPath $sonarEnvironment
}
if ($Start) {
    Push-Location $repository
    try {
        & docker network inspect jenkins *> $null
        if ($LASTEXITCODE -ne 0) { & docker network create jenkins | Out-Null }
        & docker network inspect minikube *> $null
        if ($LASTEXITCODE -ne 0) { throw 'Start the smartintern-ai Minikube profile before Jenkins' }
        & docker compose --env-file $sonarEnvironment -f devops/sonarqube/compose.yaml up -d
        if ($LASTEXITCODE -ne 0) { throw 'SonarQube startup failed' }
        & docker compose -p smartintern-jenkins -f devops/jenkins/compose.yaml -f devops/jenkins/compose.local.yaml up -d --build
        if ($LASTEXITCODE -ne 0) { throw 'Jenkins startup failed' }
    } finally { Pop-Location }
}
Write-Output "Private administrator credentials: $privateFile (never commit or share)."
Write-Output 'Jenkins: http://localhost:8090 ; SonarQube: http://localhost:9000'
