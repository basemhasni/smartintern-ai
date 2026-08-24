param(
    [Parameter(Mandatory = $true)]
    [string]$ImageTag,
    [string]$Kubeconfig
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Common.ps1")
$script:KubeconfigPath = $Kubeconfig

try {
    New-RenderedManifests -ImageTag $ImageTag
    Invoke-Kubectl cluster-info | Out-Null
    Invoke-Kubectl apply -f (Join-Path $script:KubernetesRoot "namespace.yaml") | Write-Host

    $secretExists = $true
    try { Invoke-Kubectl get secret smartintern-secrets -n $script:Namespace | Out-Null } catch { $secretExists = $false }
    if (-not $secretExists) {
        $postgresUser = if ($env:K8S_POSTGRES_USER) { $env:K8S_POSTGRES_USER } else { "smartintern" }
        $postgresDatabase = if ($env:K8S_POSTGRES_DB) { $env:K8S_POSTGRES_DB } else { "smartintern_ai" }
        $postgresPassword = if ($env:K8S_POSTGRES_PASSWORD) { $env:K8S_POSTGRES_PASSWORD } else { New-RandomHex -Bytes 24 }
        $jwtSecret = if ($env:K8S_JWT_SECRET) { $env:K8S_JWT_SECRET } else { New-RandomHex -Bytes 32 }
        $databaseUrl = "postgresql://${postgresUser}:${postgresPassword}@postgres:5432/${postgresDatabase}?schema=public"
        $secretPath = Join-Path $script:RenderRoot "secret.yaml"
        $kubectlPrefix = @()
        if ($script:KubeconfigPath) { $kubectlPrefix += @("--kubeconfig", $script:KubeconfigPath) }
        $secretArguments = $kubectlPrefix + @(
            "create", "secret", "generic", "smartintern-secrets",
            "--namespace", $script:Namespace,
            "--from-literal=POSTGRES_USER=$postgresUser",
            "--from-literal=POSTGRES_DB=$postgresDatabase",
            "--from-literal=POSTGRES_PASSWORD=$postgresPassword",
            "--from-literal=DATABASE_URL=$databaseUrl",
            "--from-literal=JWT_SECRET=$jwtSecret",
            "--dry-run=client", "-o", "yaml"
        )
        & kubectl @secretArguments | Set-Content -LiteralPath $secretPath
        if ($LASTEXITCODE -ne 0) { throw "Unable to render the Kubernetes Secret." }
        Invoke-Kubectl apply -f $secretPath | Out-Null
        Write-Host "Generated the runtime Kubernetes secret in namespace $($script:Namespace)."
    } else {
        Write-Host "Reusing the existing runtime Kubernetes secret."
    }

    Invoke-Kubectl apply -f (Join-Path $script:RenderRoot "platform.yaml") | Write-Host
    $podRevision = ((Invoke-Kubectl get pod postgres-0 -n $script:Namespace --ignore-not-found `
        "-o=jsonpath={.metadata.labels.controller-revision-hash}") -join "").Trim()
    $targetRevision = ((Invoke-Kubectl get statefulset postgres -n $script:Namespace `
        "-o=jsonpath={.status.updateRevision}") -join "").Trim()
    if ($podRevision -and $targetRevision -and $podRevision -ne $targetRevision) {
        Write-Host "Recreating postgres-0 to move from revision $podRevision to $targetRevision."
        Invoke-Kubectl delete pod postgres-0 -n $script:Namespace --wait=true | Write-Host
    }
    Invoke-Kubectl rollout status statefulset/postgres -n $script:Namespace --timeout=240s | Write-Host
    Invoke-Kubectl wait pvc/postgres-data-postgres-0 -n $script:Namespace "--for=jsonpath={.status.phase}=Bound" --timeout=120s | Write-Host
    Invoke-Kubectl wait pvc/backend-uploads -n $script:Namespace "--for=jsonpath={.status.phase}=Bound" --timeout=120s | Write-Host

    Invoke-Kubectl delete job backend-migrate -n $script:Namespace --ignore-not-found --wait=true | Write-Host
    Invoke-Kubectl apply -f (Join-Path $script:RenderRoot "migrations.yaml") | Write-Host
    Invoke-Kubectl wait job/backend-migrate -n $script:Namespace --for=condition=complete --timeout=300s | Write-Host

    Invoke-Kubectl apply -f (Join-Path $script:RenderRoot "apps.yaml") | Write-Host
    foreach ($deployment in @("ai-service", "backend", "frontend")) {
        Invoke-Kubectl rollout status "deployment/$deployment" -n $script:Namespace --timeout=300s | Write-Host
    }

    Invoke-Kubectl annotate namespace $script:Namespace "smartintern.ai/deployed-image-tag=$ImageTag" --overwrite | Out-Null
    Invoke-Kubectl get "all,pvc" -n $script:Namespace "-o" wide | Write-Host
    Write-Host "SmartIntern Kubernetes deployment completed with immutable tag $ImageTag."
} catch {
    Show-KubernetesDiagnostics
    throw
} finally {
    Remove-RenderedManifests
}
