param(
    [string]$Kubeconfig,
    [switch]$ConfirmCleanup
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Common.ps1")
$script:KubeconfigPath = $Kubeconfig

if (-not $ConfirmCleanup) {
    throw "Refusing to delete namespace $($script:Namespace) without -ConfirmCleanup."
}

Invoke-Kubectl delete namespace $script:Namespace --ignore-not-found --wait=true | Write-Host
Write-Host "Namespace $($script:Namespace) deleted. The Minikube profile was preserved."
