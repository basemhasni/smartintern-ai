$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$script:KubernetesRoot = Split-Path -Parent $PSScriptRoot
$script:KubeconfigPath = $null
$script:RenderRoot = $null
$script:Namespace = "smartintern"

function Invoke-Kubectl {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Arguments
    )

    $commandArguments = @()
    if ($script:KubeconfigPath) {
        $commandArguments += @("--kubeconfig", $script:KubeconfigPath)
    }
    $commandArguments += $Arguments

    $output = & kubectl @commandArguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "kubectl failed: $($Arguments -join ' ')`n$($output -join "`n")"
    }
    return $output
}

function Assert-ImageTag {
    param([Parameter(Mandatory = $true)][string]$ImageTag)

    if ($ImageTag -notmatch '^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$') {
        throw "Invalid Docker image tag: $ImageTag"
    }
}

function New-RenderedManifests {
    param([Parameter(Mandatory = $true)][string]$ImageTag)

    Assert-ImageTag -ImageTag $ImageTag
    $script:RenderRoot = Join-Path ([System.IO.Path]::GetTempPath()) "smartintern-k8s-$PID-$([guid]::NewGuid().ToString('N'))"
    New-Item -ItemType Directory -Path (Join-Path $script:RenderRoot "overlays") -Force | Out-Null
    Copy-Item -Recurse -Path (Join-Path $script:KubernetesRoot "base") -Destination (Join-Path $script:RenderRoot "base")
    Copy-Item -Recurse -Path (Join-Path $script:KubernetesRoot "overlays\minikube") -Destination (Join-Path $script:RenderRoot "overlays\minikube")

    Get-ChildItem -Path (Join-Path $script:RenderRoot "overlays") -Filter kustomization.yaml -Recurse | ForEach-Object {
        $content = Get-Content -Raw -LiteralPath $_.FullName
        Set-Content -LiteralPath $_.FullName -Value $content.Replace("IMAGE_TAG_PLACEHOLDER", $ImageTag) -NoNewline
    }

    foreach ($phase in @("platform", "migrations", "apps")) {
        $manifest = Invoke-Kubectl kustomize (Join-Path $script:RenderRoot "overlays\minikube\$phase")
        Set-Content -LiteralPath (Join-Path $script:RenderRoot "$phase.yaml") -Value $manifest
    }
}

function Remove-RenderedManifests {
    if ($script:RenderRoot -and (Test-Path -LiteralPath $script:RenderRoot)) {
        Remove-Item -Recurse -Force -LiteralPath $script:RenderRoot
    }
}

function Show-KubernetesDiagnostics {
    Write-Warning "Kubernetes diagnostics for namespace $($script:Namespace)"
    $diagnosticCommands = @(
        @("get", "all,pvc", "-n", $script:Namespace, "-o", "wide"),
        @("get", "events", "-n", $script:Namespace, "--sort-by=.lastTimestamp"),
        @("describe", "pods", "-n", $script:Namespace)
    )
    foreach ($arguments in $diagnosticCommands) {
        try { Invoke-Kubectl @arguments | Write-Host } catch { Write-Warning $_ }
    }
    foreach ($workload in @("deployment/backend", "deployment/ai-service", "deployment/frontend", "statefulset/postgres", "job/backend-migrate")) {
        try { Invoke-Kubectl logs -n $script:Namespace $workload --tail=100 | Write-Host } catch { Write-Warning $_ }
    }
}

function New-RandomHex {
    param([int]$Bytes = 32)

    $buffer = New-Object byte[] $Bytes
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($buffer)
    return [Convert]::ToHexString($buffer).ToLowerInvariant()
}
