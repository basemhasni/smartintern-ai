param(
    [string]$ImageTag = "validation",
    [string]$Kubeconfig,
    [switch]$Server
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Common.ps1")
$script:KubeconfigPath = $Kubeconfig

try {
    New-RenderedManifests -ImageTag $ImageTag
    $clusterAvailable = $true
    try { Invoke-Kubectl cluster-info | Out-Null } catch { $clusterAvailable = $false }
    if ($clusterAvailable) {
        Invoke-Kubectl apply --dry-run=client -f (Join-Path $script:KubernetesRoot "namespace.yaml") | Out-Null
        foreach ($phase in @("platform", "migrations", "apps")) {
            Invoke-Kubectl apply --dry-run=client -f (Join-Path $script:RenderRoot "$phase.yaml") | Out-Null
        }
    } else {
        Write-Host "Cluster unavailable: Kustomize rendering completed without API discovery."
    }

    if ($Server) {
        Invoke-Kubectl apply --dry-run=server -f (Join-Path $script:KubernetesRoot "namespace.yaml") | Out-Null
        try {
            Invoke-Kubectl get namespace $script:Namespace | Out-Null
            foreach ($phase in @("platform", "migrations", "apps")) {
                Invoke-Kubectl apply --dry-run=server -f (Join-Path $script:RenderRoot "$phase.yaml") | Out-Null
            }
        } catch {
            Write-Host "Server dry-run skipped for namespaced resources because namespace $($script:Namespace) does not exist yet."
        }
    }

    Write-Host "Kubernetes manifests are valid for image tag $ImageTag."
} finally {
    Remove-RenderedManifests
}
