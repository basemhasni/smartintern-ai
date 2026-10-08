# SmartIntern AI : runbook local

Toutes les commandes Kubernetes se lancent dans Ubuntu/WSL avec le contexte `smartintern-ai`. Ne jamais afficher ou copier les Secrets Kubernetes dans un ticket ou un log.

## Etat rapide

```bash
minikube status -p smartintern-ai
kubectl config current-context
kubectl get nodes
kubectl get pods,pvc,ingress -n smartintern-dev
kubectl get pods,pvc,ingress -n smartintern-observability
helm list -A
helm status smartintern-dev -n smartintern-dev
helm history smartintern-dev -n smartintern-dev
```

Si Minikube est arrêté : `minikube start -p smartintern-ai --driver=docker`. Ne pas supprimer le profil ni les PVC pour dépanner un simple redémarrage.

## Accès et santé

Le frontend utilise `https://smartintern.local` via Ingress local. Le nom doit résoudre vers le contrôleur Ingress Minikube ; voir [Step 8](../devops/08-helm-ingress-environments.md). Le certificat local n'est pas signé par une autorité publique. Vérifier les services :

```bash
kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8443:443
curl -k --resolve smartintern.local:8443:127.0.0.1 https://smartintern.local:8443/api/health
curl -k --resolve smartintern.local:8443:127.0.0.1 https://smartintern.local:8443/ai/health
```

Jenkins : `http://localhost:8090` ; SonarQube : `http://localhost:9000`. Prometheus : `kubectl port-forward -n smartintern-observability service/smartintern-prometheus-server 9090:80`, puis `http://localhost:9090`. Grafana : `kubectl port-forward -n smartintern-observability service/smartintern-grafana 3000:80`, puis `http://localhost:3000`. L'utilisateur Grafana est `admin` ; récupérer son mot de passe sans le publier :

```bash
kubectl get secret smartintern-grafana-admin -n smartintern-observability -o jsonpath='{.data.admin-password}' | base64 --decode
```

## Diagnostic

```bash
kubectl describe pod -n smartintern-dev POD
kubectl logs -n smartintern-dev deployment/backend --tail=100
kubectl logs -n smartintern-dev deployment/ai-service --tail=100
kubectl logs -n smartintern-dev statefulset/postgres --tail=100
kubectl get events -n smartintern-dev --sort-by=.lastTimestamp
kubectl get pvc -n smartintern-dev
```

- `ImagePullBackOff` : vérifier le nom/tag SHA du Deployment, les droits Docker Hub et les événements du pod. Ne pas remplacer par `latest` sans validation.
- `CrashLoopBackOff` : lire `kubectl logs --previous`, puis config non sensible, migrations et health probes.
- Base indisponible : vérifier `postgres-0` Ready, PVC Bound, Job `backend-migrate` Completed et `pg_isready` dans le pod. Ne jamais lancer `prisma migrate reset`.
- RAG/IA indisponibles : vérifier `/ai/health`, logs AI et les dépendances externes. Un échec du fournisseur LLM ne doit pas masquer le reste de l'application.

## Sauvegarde et restauration

Depuis Ubuntu/WSL à la racine du dépôt :

```bash
bash devops/release/scripts/backup-postgres.sh --output artifacts/backups/manual.dump
bash devops/release/scripts/verify-restore-postgres.sh --input artifacts/backups/manual.dump
```

La restauration de validation crée et supprime une base temporaire ; elle ne touche pas à la base active. Un restore opérationnel complet sur la base active exige une fenêtre de maintenance, une sauvegarde hors machine et une procédure de changement approuvée. Conserver les dumps chiffrés et hors Git.

## Redémarrage et rollback

```bash
kubectl rollout restart deployment/backend -n smartintern-dev
kubectl rollout status deployment/backend -n smartintern-dev --timeout=300s
helm history smartintern-dev -n smartintern-dev
helm rollback smartintern-dev REVISION -n smartintern-dev --wait --timeout 10m
```

Vérifier ensuite le Job de migration, les pods, `/api/health` et les dashboards. Un rollback de code ne rétrograde pas automatiquement le schéma de base ; évaluer la compatibilité avant d'exécuter `helm rollback`.
