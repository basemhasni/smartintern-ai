param(
    [Parameter(Mandatory = $true)]
    [string]$ImageTag,
    [string]$Kubeconfig,
    [switch]$TestPersistence
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Common.ps1")
$script:KubeconfigPath = $Kubeconfig
Assert-ImageTag -ImageTag $ImageTag

try {
    $readySelector = "--selector=app.kubernetes.io/part-of=smartintern-ai,app.kubernetes.io/component!=migrations"
    Invoke-Kubectl wait pod -n $script:Namespace --for=condition=Ready $readySelector --timeout=300s | Write-Host
    Invoke-Kubectl wait job/backend-migrate -n $script:Namespace --for=condition=complete --timeout=60s | Write-Host

    foreach ($pvc in @("postgres-data-postgres-0", "backend-uploads")) {
        $phase = (Invoke-Kubectl get pvc $pvc -n $script:Namespace "-o" "jsonpath={.status.phase}") -join ""
        if ($phase -ne "Bound") { throw "PVC $pvc is $phase." }
    }

    $expectedImages = [ordered]@{
        "statefulset/postgres" = "bessem785/smartintern-postgres:$ImageTag"
        "job/backend-migrate" = "bessem785/smartintern-backend-migrate:$ImageTag"
        "deployment/backend" = "bessem785/smartintern-backend:$ImageTag"
        "deployment/ai-service" = "bessem785/smartintern-ai:$ImageTag"
        "deployment/frontend" = "bessem785/smartintern-frontend:$ImageTag"
    }
    foreach ($workload in $expectedImages.Keys) {
        $actual = (Invoke-Kubectl get $workload -n $script:Namespace "-o" "jsonpath={.spec.template.spec.containers[0].image}") -join ""
        if ($actual -ne $expectedImages[$workload]) { throw "$workload uses $actual instead of $($expectedImages[$workload])." }
    }

    $vector = (Invoke-Kubectl exec -n $script:Namespace statefulset/postgres -- sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT extname FROM pg_extension WHERE extname = '\''vector'\'';"') -join ""
    if ($vector -ne "vector") { throw "pgvector is unavailable." }

    Invoke-Kubectl exec -n $script:Namespace deployment/backend -- node -e "fetch('http://127.0.0.1:5000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" | Out-Null
    Invoke-Kubectl exec -n $script:Namespace deployment/backend -- node -e "fetch('http://127.0.0.1:5000/health/ai').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" | Out-Null
    Invoke-Kubectl exec -n $script:Namespace deployment/ai-service -- python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=5)" | Out-Null
    Invoke-Kubectl exec -n $script:Namespace deployment/frontend -- wget -qO- http://127.0.0.1:8080/health | Out-Null
    Invoke-Kubectl exec -n $script:Namespace deployment/frontend -- wget -qO- http://backend:5000/health | Out-Null

    if ($TestPersistence) {
        $writeSql = "CREATE TABLE IF NOT EXISTS kubernetes_persistence_probe (marker text NOT NULL); TRUNCATE kubernetes_persistence_probe; INSERT INTO kubernetes_persistence_probe VALUES ('$ImageTag');"
        Invoke-Kubectl exec -n $script:Namespace statefulset/postgres -- sh -c "psql -U `"`$POSTGRES_USER`" -d `"`$POSTGRES_DB`" -v ON_ERROR_STOP=1 -c `"$writeSql`"" | Out-Null
        Invoke-Kubectl delete pod postgres-0 -n $script:Namespace --wait=true --timeout=90s | Write-Host
        Invoke-Kubectl wait pod/postgres-0 -n $script:Namespace --for=condition=Ready --timeout=240s | Write-Host
        $marker = (Invoke-Kubectl exec -n $script:Namespace statefulset/postgres -- sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT marker FROM kubernetes_persistence_probe LIMIT 1;"') -join ""
        if ($marker -ne $ImageTag) { throw "PostgreSQL persistence test failed." }
        Invoke-Kubectl exec -n $script:Namespace statefulset/postgres -- sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -c "DROP TABLE kubernetes_persistence_probe;"' | Out-Null
        Invoke-Kubectl wait pod -n $script:Namespace --for=condition=Ready $readySelector --timeout=180s | Write-Host
    }

    Invoke-Kubectl get "pods,pvc,services" -n $script:Namespace "-o" wide | Write-Host
    Write-Host "Kubernetes smoke tests succeeded for immutable tag $ImageTag."
} catch {
    Show-KubernetesDiagnostics
    throw
}
