# Step 9: Prometheus et Grafana

## Architecture et choix

La stack applicative reste dans `smartintern-dev`. Prometheus et Grafana sont des
releases Helm distinctes dans `smartintern-observability`. L'exporter PostgreSQL
est installe dans `smartintern-dev` pour lire le Secret de connexion existant,
sans copier de mot de passe dans un autre namespace. Prometheus utilise la
decouverte Kubernetes des Services annotes; aucun Operator ni ServiceMonitor
n'est requis.

Sur le profil Minikube de 3 Gio, les charts separes sont plus economes que
`kube-prometheus-stack`. Alertmanager et Pushgateway sont desactives. Le
metrics-server Minikube fournit `kubectl top`; Prometheus collecte les series
historiques via kubelet/cAdvisor, node-exporter et kube-state-metrics.

| Release | Namespace | Chart | Version | Application |
| --- | --- | --- | --- | --- |
| `smartintern-prometheus` | `smartintern-observability` | `prometheus-community/prometheus` | `29.34.0` | Prometheus `3.15.0` |
| `smartintern-grafana` | `smartintern-observability` | `grafana-community/grafana` | `13.2.6` | Grafana `13.2.2` |
| `smartintern-postgres-exporter` | `smartintern-dev` | `prometheus-community/prometheus-postgres-exporter` | `8.2.0` | postgres-exporter `0.20.1` |

Repositories Helm : `https://prometheus-community.github.io/helm-charts` et
`https://grafana-community.github.io/helm-charts`. Les versions sont epinglees dans
`devops/observability/scripts/common.sh`.

## Stockage et ressources

Prometheus conserve au plus 7 jours et 1500 MB sur un PVC de 2 Gio. Grafana
utilise un PVC de 1 Gio; ses dashboards et sa datasource sont aussi provisionnes
depuis Git. Les requests et limites sont definies dans les trois fichiers
`*-values.yaml` : Prometheus 100m/256Mi a 600m/640Mi, Grafana 50m/128Mi a
400m/384Mi, kube-state-metrics 30m/64Mi a 150m/192Mi, node-exporter
20m/32Mi a 100m/96Mi, postgres-exporter 20m/32Mi a 100m/96Mi. Les volumes
survivent aux upgrades Helm et aux redemarrages des pods.

## Metriques

- Backend Express : `/metrics`, `smartintern_backend_http_requests_total`,
  `smartintern_backend_http_request_duration_seconds` et metriques Node.js.
- AI FastAPI : `/metrics`, `smartintern_ai_http_requests_total`,
  `smartintern_ai_http_request_duration_seconds`,
  `smartintern_ai_workflow_requests_total`,
  `smartintern_ai_workflow_duration_seconds` et metriques de processus.
- PostgreSQL : `pg_up`, connexions, transactions, taille et verrous via
  postgres-exporter. La verification pgvector reste dans le smoke applicatif.
- Kubernetes : etat des pods, Deployments, StatefulSets, Jobs, PVC et restarts
  via kube-state-metrics; CPU, memoire et filesystem via node-exporter;
  conteneurs via cAdvisor lorsque le kubelet expose ces metriques.
- Ingress NGINX : `nginx_ingress_controller_requests` et metriques de latence
  via le port 10254. Le deploiement active `--enable-metrics=true` de facon
  idempotente et cree un Service interne annote.

Les labels HTTP contiennent seulement methode, route declaree et code de statut.
Les routes non reconnues sont groupees sous `unmatched`; aucun identifiant,
email, token, CV, prompt ou contenu de lettre n'est collecte. `/health` reste
distinct de `/metrics`.

## Dashboards et datasource

Grafana provisionne automatiquement la datasource Prometheus interne
`http://smartintern-prometheus-server.smartintern-observability.svc.cluster.local`.
Les cinq JSON versionnes dans `devops/observability/grafana/dashboards` sont
montes par ConfigMap : SmartIntern Overview, SmartIntern Backend, SmartIntern AI
Service, SmartIntern PostgreSQL et SmartIntern Kubernetes. Le script
`generate-dashboards.js` est la source de generation de ces JSON. Executer ce
script et committer les JSON lorsque les panels changent. Certains panels de
debit ou p95 restent vides avant les premiers appels et deux scrapes.

## Installation et validation

Prerequis : cluster `smartintern-ai` en marche, application `smartintern-dev`
deployee avec les images de cette Step, `helm`, `kubectl`, `jq`, `curl`,
`openssl`, `shuf` et acces aux repositories Helm. Les scripts acceptent
`--kubeconfig CHEMIN` pour Jenkins.

```bash
devops/observability/scripts/validate.sh
devops/observability/scripts/deploy.sh
devops/observability/scripts/smoke-test.sh
kubectl get pods,pvc -n smartintern-observability
helm list -n smartintern-observability
helm list -n smartintern-dev
```

Le smoke verifie les pods, les PVC `Bound`, les endpoints `/metrics`, les
targets Prometheus `UP`, plusieurs requetes PromQL, `pg_up=1`, la datasource
Grafana et les cinq dashboards via l'API. Toute verification critique renvoie
un code de sortie non nul. Pour explorer les targets :

```bash
kubectl port-forward -n smartintern-observability service/smartintern-prometheus-server 9090:80
curl -fsS http://127.0.0.1:9090/api/v1/targets
curl -fsSG --data-urlencode 'query=up' http://127.0.0.1:9090/api/v1/query
```

Prometheus n'a pas d'Ingress public. Grafana est l'interface principale.

## Grafana et TLS local

URL : `https://grafana.smartintern.local:8443` avec le port-forward ci-dessous.
Ajouter `127.0.0.1 grafana.smartintern.local` au fichier hosts Windows, puis
lancer dans WSL :

```bash
kubectl port-forward --address=0.0.0.0 -n ingress-nginx service/ingress-nginx-controller 8443:443
```

Le certificat auto-signe est cree au deploiement avec SAN
`grafana.smartintern.local` et conserve uniquement dans le Secret Kubernetes
`smartintern-grafana-tls`. L'avertissement du navigateur est normal en local.
Le login est `admin`. Le mot de passe aleatoire n'est jamais versionne ni
affiche par Jenkins; le consulter sur une console locale privee :

```bash
kubectl get secret smartintern-grafana-admin -n smartintern-observability -o jsonpath='{.data.admin-password}' | base64 --decode
```

## Jenkins et securite

Jenkins conserve CI applicative, SonarQube, Quality Gate, Docker Build, Compose
Smoke, Docker Hub, Helm applicatif et Ingress/TLS. Il valide ensuite les charts
et JSON, deploie la stack d'observabilite et execute le smoke sur `main` et la
branche Step 9. Les autres branches ne deploient pas cette stack. `jq` est
installe dans l'image Jenkins pour valider les reponses API.

Prometheus utilise le RBAC fourni par son chart pour la decouverte Kubernetes;
aucun `cluster-admin` manuel. Les mots de passe viennent des Secrets runtime.
L'exporter PostgreSQL reutilise `smartintern-secrets` et ne journalise pas la
chaine de connexion. Grafana et Prometheus restent des Services internes hors
Ingress Grafana. Les nouveaux workloads utilisent les security contexts des
charts et des limites de ressources adaptees au cluster local.

## Diagnostic

```bash
minikube status -p smartintern-ai
kubectl top nodes
kubectl top pods -A
kubectl get events -n smartintern-observability --sort-by=.lastTimestamp
kubectl logs -n smartintern-observability deployment/smartintern-prometheus-server --tail=100
kubectl logs -n smartintern-observability deployment/smartintern-grafana --tail=100
kubectl get pvc -n smartintern-observability
```

Si `pg_up=0`, verifier PostgreSQL et les cles `POSTGRES_USER`, `POSTGRES_DB`
et `POSTGRES_PASSWORD` du Secret existant sans afficher leur valeur dans les
logs. Si Grafana n'affiche pas un dashboard, relancer `deploy.sh` : le ConfigMap
est reapplique et le pod Grafana recharge les fichiers provisionnes. Si les
targets backend/AI sont absentes, verifier que les nouveaux pods utilisent le
SHA Step 9 et que leurs Services portent les annotations de scraping.
