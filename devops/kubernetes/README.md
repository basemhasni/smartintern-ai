# SmartIntern AI Kubernetes (Step 7 reference)

> Deprecated for active deployments since DevOps Step 8. These Kustomize
> manifests remain as a historical and troubleshooting reference. The Helm
> chart in `devops/helm/smartintern-ai` is now the deployment source of truth.

This directory contains the Kubernetes deployment used by the dedicated
Minikube profile `smartintern-ai`. Workloads run only in the `smartintern`
namespace and use immutable Docker Hub SHA tags.

## Layout

- `namespace.yaml`: dedicated namespace.
- `base/platform`: ConfigMaps, PostgreSQL StatefulSet, services and PVCs.
- `base/migrations`: Prisma migration Job.
- `base/apps`: backend, AI service and frontend workloads.
- `overlays/minikube`: Kustomize image transformations for Minikube.
- `scripts`: Linux/Jenkins and Windows deployment utilities.

## Local deployment

Validated Windows setup through Ubuntu/WSL 2:

```powershell
wsl minikube start -p smartintern-ai --driver=docker --cpus=3 --memory=3072mb --disk-size=20g --kubernetes-version=v1.32.2
wsl bash -lc "cd '/mnt/c/New project 3/smartintern-ai' && bash devops/kubernetes/scripts/validate.sh --image-tag <SHA_12> --server"
wsl bash -lc "cd '/mnt/c/New project 3/smartintern-ai' && bash devops/kubernetes/scripts/deploy.sh --image-tag <SHA_12>"
wsl bash -lc "cd '/mnt/c/New project 3/smartintern-ai' && bash devops/kubernetes/scripts/smoke-test.sh --image-tag <SHA_12> --test-persistence"
```

Native PowerShell clients can use the equivalent scripts when their kubeconfig
can reach the Docker driver API normally:

```powershell
minikube start -p smartintern-ai --driver=docker --cpus=3 --memory=3072mb --disk-size=20g
kubectl config use-context smartintern-ai
pwsh ./devops/kubernetes/scripts/validate.ps1 -ImageTag <SHA_12> -Server
pwsh ./devops/kubernetes/scripts/deploy.ps1 -ImageTag <SHA_12>
pwsh ./devops/kubernetes/scripts/smoke-test.ps1 -ImageTag <SHA_12> -TestPersistence
```

The first deployment creates `smartintern-secrets` with random runtime values.
Set `K8S_POSTGRES_USER`, `K8S_POSTGRES_DB`, `K8S_POSTGRES_PASSWORD` and
`K8S_JWT_SECRET` before the first deployment to provide explicit values. The
Secret is reused afterward and is never written to Git.

The frontend is exposed as NodePort `30080`. On Windows with the Docker driver,
use `minikube service frontend -n smartintern -p smartintern-ai --url` when a
tunnel URL is needed.

## Cleanup

Cleanup is intentionally explicit and preserves the Minikube cluster:

```powershell
pwsh ./devops/kubernetes/scripts/cleanup.ps1 -ConfirmCleanup
```

See [../../docs/devops/07-kubernetes-minikube.md](../../docs/devops/07-kubernetes-minikube.md)
for architecture, Jenkins integration and troubleshooting.
