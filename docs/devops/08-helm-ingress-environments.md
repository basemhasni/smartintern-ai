# Helm, Ingress, TLS et environnements

## 1. Objectif

La Step 8 remplace le déploiement actif Kustomize de la Step 7 par un chart
Helm unique, idempotent et piloté par Jenkins. Elle ajoute un point d'entrée
HTTPS local et sépare DEV de la configuration prod-like.

## 2. Architecture

```text
Docker Hub SHA -> Jenkins -> Helm -> smartintern-dev
                                   |-- PostgreSQL + pgvector + PVC
                                   |-- migration Prisma pre-upgrade
                                   |-- backend / AI / frontend
                                   `-- NGINX Ingress + TLS runtime
```

## 3. Helm

La version validée est Helm 4.1.4 avec Kubernetes 1.32.2. WSL utilise
`~/.local/bin/helm`; l'image Jenkins l'installe avec un checksum SHA-256
épinglé. Aucun téléchargement de version flottante n'est effectué.

## 4. Chart

Le chart se trouve dans `devops/helm/smartintern-ai`. Les templates sont
séparés par composant. `devops/kubernetes` reste une référence Step 7
dépréciée et ne doit plus être modifié comme seconde source de déploiement.

## 5. Values

`values.yaml` contient les valeurs communes. `values-dev.yaml` et
`values-prod.yaml` ne contiennent que les différences d'environnement. Les
images, ports, replicas, probes, ressources et tailles de stockage sont
configurables.

## 6. Environnements

DEV utilise `smartintern-dev`, un replica applicatif et le host
`smartintern.local`. Prod-like utilise `smartintern-prod`, des ressources et
replicas plus réalistes, et `smartintern.prod.local`. Prod-like est rendu et
validé en CI mais n'est pas déployé sur le petit cluster Minikube.

## 7. Releases

La release active est `smartintern-dev` dans le namespace `smartintern-dev`.
Le chart permet aussi `smartintern-prod` dans `smartintern-prod`. Une seconde
exécution de `deploy.sh` produit un upgrade idempotent.

## 8. Namespaces

Chaque environnement possède son namespace. Le namespace Step 7
`smartintern` est conservé pendant la transition afin de ne supprimer aucune
donnée historique. Il peut être archivé manuellement après sauvegarde.

## 9. Images SHA

`global.imageTag` est obligatoire et les scripts exigent exactement 12
caractères hexadécimaux. Les cinq workloads utilisent le même SHA publié par
Jenkins. `latest` n'est jamais utilisé par Helm.

## 10. PostgreSQL

PostgreSQL reste un StatefulSet avec l'image SmartIntern pgvector. Son
entrypoint officiel conserve les permissions nécessaires pour initialiser le
volume puis exécuter PostgreSQL sous son utilisateur dédié.

## 11. Migrations

Le premier install bootstrappe PostgreSQL sans application. Le déploiement
complet est ensuite un upgrade dont le Job Prisma est un hook `pre-upgrade`,
poids `-5`, avec `before-hook-creation`. Helm attend sa réussite avant de
modifier les Deployments. Le dernier Job réussi reste observable jusqu'à
l'upgrade suivant.

## 12. Secrets

`smartintern-secrets` est créé au runtime s'il n'existe pas, puis réutilisé.
Jenkins peut fournir les variables correspondantes via Credentials. Aucun
mot de passe, JWT, kubeconfig, certificat ou valeur base64 n'est versionné.

## 13. Ingress

Le contrôleur NGINX de l'addon Minikube route `/` vers frontend, `/api` vers
backend et `/ai` vers ai-service. Deux routes health dédiées réécrivent
uniquement `/api/health` et `/ai/health` vers les endpoints `/health` réels.

## 14. TLS

Un certificat RSA auto-signé avec SAN `DNS:smartintern.local` est généré dans
un dossier temporaire. Seul le Secret Kubernetes `smartintern-dev-tls` est
créé; la clé locale est supprimée et n'entre jamais dans Git.

## 15. Hostname local

Pour un navigateur Windows, ajouter manuellement en administrateur dans
`C:\Windows\System32\drivers\etc\hosts` :

```text
127.0.0.1 smartintern.local
```

Puis lancer dans WSL :

```bash
kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8443:443
```

Ouvrir `https://smartintern.local:8443`. L'avertissement navigateur est normal
pour le certificat DEV auto-signé. Les scripts automatisent la résolution avec
`curl --resolve` et ne modifient jamais silencieusement le fichier hosts.

## 16. Probes

Backend, AI et frontend utilisent `/health` pour startup, readiness et
liveness. PostgreSQL utilise `pg_isready`. Tous les paramètres sont dans les
values.

## 17. Resources

Chaque conteneur possède requests et limits. DEV conserve les limites Step 7;
prod-like augmente les requests, limites et replicas sans prétendre être une
production cloud.

## 18. Jenkins

Le pipeline conserve Application CI, Compose, SonarQube, Quality Gate, Docker
Build, Compose Smoke et Docker Hub. Il ajoute Helm Validation pour toutes les
branches, puis Helm Deployment et Ingress/TLS Smoke sur `main` et la branche
Step 8 uniquement.

## 19. Helm lint

```bash
devops/helm/scripts/validate.sh --image-tag 0123456789ab
```

Le script exécute `helm lint`, rend DEV et prod-like, puis valide les objets
avec kubectl. Si le cluster répond, un dry-run serveur est aussi exécuté.

## 20. Deployment

```bash
devops/helm/scripts/deploy.sh --image-tag 0123456789ab
```

Le namespace, les secrets runtime et TLS précèdent le bootstrap PostgreSQL,
la migration puis les rollouts applicatifs.

## 21. Upgrade

La même commande avec un nouveau SHA exécute une migration bloquante puis un
upgrade `--wait --wait-for-jobs --rollback-on-failure`. Les PVC ne sont pas
recréés.

## 22. Rollback

```bash
helm history smartintern-dev -n smartintern-dev
helm rollback smartintern-dev REVISION -n smartintern-dev --wait --timeout 10m
```

Après un test, relancer immédiatement `deploy.sh` avec le SHA final attendu.
Un rollback ne supprime pas les PVC.

## 23. Smoke tests

```bash
devops/helm/scripts/smoke-test.sh --image-tag 0123456789ab --test-persistence
```

Le certificat étant volontairement auto-signé, `curl -k` est limité à ce test
local. Les routes HTTPS frontend, backend et AI doivent toutes répondre.

## 24. Persistence

Le test écrit un marqueur SQL, recrée `postgres-0`, relit le marqueur puis le
supprime. Les UID PVC sont aussi vérifiés pendant upgrade et rollback. Ne pas
désinstaller la release avant une sauvegarde réelle.

## 25. Security

Les applications sont non-root, sans élévation, avec capabilities supprimées,
seccomp et filesystem lecture seule lorsque compatible. PostgreSQL conserve
son entrypoint officiel et `fsGroup: 999`. Les ServiceAccount tokens ne sont
pas montés. Aucune NetworkPolicy n'est ajoutée: le CNI bridge Minikube audité
ne permet pas d'en démontrer l'application de manière fiable.

## 26. Troubleshooting

- `ImagePullBackOff` Ingress: précharger l'image officielle avec
  `minikube image load` après un pull Docker réussi.
- `pending-install`: consulter `helm status`, les événements et les logs; ne
  jamais forcer un succès CI.
- erreur TLS: vérifier le SAN et le Secret `kubernetes.io/tls`.
- port 8443 occupé: choisir un autre port local pour le port-forward.
- migration échouée: consulter `kubectl logs job/backend-migrate`.

## 27. Validation finale

La Step est valide lorsque lint/rendu, migration, rollouts, pgvector, PVC,
Ingress HTTPS, historique/rollback Helm, Jenkins feature puis Jenkins main
sont tous réussis et que le SHA main exact est déployé.
