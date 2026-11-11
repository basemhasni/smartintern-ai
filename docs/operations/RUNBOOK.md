# SmartIntern AI : runbook local

Les scripts Bash utilisent le contexte `smartintern-ai` dans un environnement disposant de Helm, kubectl, curl, jq et openssl. Sous Windows, le conteneur facultatif `devops/release/Dockerfile.tools` fournit ces outils, avec un kubeconfig privé ignoré par Git. Ne jamais afficher ou copier les Secrets Kubernetes dans un ticket ou un log.

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

Sous Windows avec port-forward 443, le navigateur utilise
`https://smartintern.local`. Le nom doit résoudre vers `127.0.0.1`.
L'ajout au fichier hosts exige un terminal administrateur ; si ces droits sont
absents, la commande `curl --resolve` ci-dessous valide le service sans modifier
le DNS système. Le certificat reste une exception locale de test.

```bash
kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 443:443 --address=127.0.0.1
curl -k --resolve smartintern.local:443:127.0.0.1 https://smartintern.local/api/health
curl -k --resolve smartintern.local:443:127.0.0.1 https://smartintern.local/ai/health
```

Jenkins : `http://localhost:8090` ; SonarQube : `http://localhost:9000`. Prometheus : `kubectl port-forward -n smartintern-observability service/smartintern-prometheus-server 9090:80`, puis `http://localhost:9090`. Grafana : `kubectl port-forward -n smartintern-observability service/smartintern-grafana 3000:80`, puis `http://localhost:3000`. L'utilisateur Grafana est `admin` ; sous PowerShell, copier son mot de passe sans l'afficher, puis effacer le presse-papiers après connexion :

```powershell
$encodedGrafanaPassword = kubectl get secret smartintern-grafana-admin -n smartintern-observability -o jsonpath='{.data.admin-password}'
Set-Clipboard ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encodedGrafanaPassword)))
Remove-Variable encodedGrafanaPassword
# Coller dans Grafana, puis :
Set-Clipboard ''
```

## Diagnostic

### Réinstallation locale de Jenkins après formatage

Sous PowerShell 7, `pwsh -File devops/jenkins/initialize-local.ps1 -Start`
recrée les services existants Jenkins/DinD et SonarQube/PostgreSQL. Démarrer
d'abord le profil Minikube `smartintern-ai`. Le script génère des mots de passe
aléatoires dans `artifacts/ci-private/bootstrap.json`, ignoré par Git et limité
au compte Windows courant et SYSTEM. Les deux administrateurs utilisent `admin`.
Jenkins désactive l'accès anonyme et conserve un seul exécuteur pour ce laptop.
SonarQube doit ensuite remplacer son mot de passe initial par celui du fichier
privé et rétablir le compte technique, les projets et le webhook décrits en Step 6.
Les credentials Docker Hub, Sonar et kubeconfig sont stockés dans Jenkins sous
les IDs du `Jenkinsfile` ; ils ne sont pas reconstruits depuis des secrets Git.
Le bootstrap conserve les mots de passe et volumes existants à chaque relance.

La version Jenkins locale est `2.580.2-lts-jdk21`, et le plugin Sonar `2.19.0`.
Ces correctifs remplacent les anciennes versions vulnérables de la Step 6.

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

Pour la base Compose jetable, les deux scripts acceptent aussi
`--compose-project smartintern-step10-validation --compose-env .env.step10-validation`.
Ajouter `--expect-test-data` à la restauration après les E2E pour vérifier les
utilisateurs synthétiques et candidatures dans le dump. Un nom de dump existant
est refusé pour éviter l'écrasement accidentel d'une sauvegarde.

Pour revalider l'application déployée :

```bash
bash devops/release/scripts/run-kubernetes-e2e.sh
bash devops/release/scripts/verify-app-recovery.sh
bash devops/helm/scripts/smoke-test.sh --image-tag SHA12 --test-persistence
bash devops/observability/scripts/smoke-test.sh
```

Les E2E Kubernetes créent un administrateur et des comptes étudiant/entreprise
synthétiques avec un identifiant unique, puis les suppriment avec leurs documents.
Les anciens comptes de démonstration ne sont pas sélectionnés par ce nettoyage.
Les scripts s'arrêtent avec un code non nul sur échec ; conserver les rapports
JUnit et traces d'échec pour le diagnostic. Ne jamais valider une release sur la
seule présence de fichiers de tests.

Pour Sonar, ouvrir le projet du SHA testé, vérifier la date d'analyse et le Quality
Gate `OK`, puis rapprocher ces références du build Jenkins. Un serveur absent ou
une analyse d'un ancien SHA signifie « non vérifié », pas `SUCCESS`.

## Redémarrage et rollback

```bash
kubectl rollout restart deployment/backend -n smartintern-dev
kubectl rollout status deployment/backend -n smartintern-dev --timeout=300s
helm history smartintern-dev -n smartintern-dev
helm rollback smartintern-dev REVISION -n smartintern-dev --wait --timeout 10m
```

Vérifier ensuite le Job de migration, les pods, `/api/health` et les dashboards. Un rollback de code ne rétrograde pas automatiquement le schéma de base ; évaluer la compatibilité avant d'exécuter `helm rollback`.
