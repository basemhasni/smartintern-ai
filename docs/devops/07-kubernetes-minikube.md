# Kubernetes, Minikube et Jenkins

## 1. Objectif

La Step 7 déploie la stack SmartIntern AI dans un vrai cluster Kubernetes local
et ajoute une validation bloquante à Jenkins après la publication Docker Hub.

## 2. Architecture Kubernetes

```text
Docker Hub SHA images
  -> PostgreSQL StatefulSet + pgvector + PVC
  -> Prisma migration Job
  -> backend + AI service + frontend
  -> probes, rollouts and Kubernetes smoke tests
```

Les manifests sont répartis entre `base/platform`, `base/migrations` et
`base/apps`. Les overlays Minikube injectent le tag SHA dans les cinq images.

## 3. Minikube

Le profil dédié s'appelle `smartintern-ai` et utilise le driver Docker. La
configuration validée sur Docker Desktop est de 3 CPU, 3072 MiB de RAM et
20 GiB de disque avec Kubernetes 1.32.2. Sur le poste Windows audité, Minikube
est exécuté dans Ubuntu/WSL 2 avec l'intégration Docker Desktop; le nœud reste
un conteneur persistant du moteur Docker Desktop.

## 4. Namespace

Toutes les ressources applicatives utilisent le namespace `smartintern`.
Rien n'est déployé dans `default`.

## 5. Images Docker Hub

Les workloads utilisent les dépôts publics `bessem785/smartintern-frontend`,
`smartintern-backend`, `smartintern-backend-migrate`, `smartintern-ai` et
`smartintern-postgres`. Aucun `imagePullSecret` n'est nécessaire.

## 6. SHA immutable

Les overlays contiennent un tag de validation remplacé dans une copie
temporaire. Les scripts vérifient ensuite que chaque workload utilise exactement
le SHA court de 12 caractères publié par le même build Jenkins. `latest` n'est
jamais la source de vérité Kubernetes.

## 7. ConfigMaps

`smartintern-backend-config` et `smartintern-ai-config` contiennent uniquement
les ports, URLs de services internes, timeouts et options non sensibles.

## 8. Secrets

`smartintern-secrets` est généré au runtime. Au premier déploiement, les scripts
acceptent des variables d'environnement ou génèrent des valeurs aléatoires avec
une source cryptographique. Le Secret existant est réutilisé ensuite. Aucun
mot de passe, JWT, kubeconfig ou Secret encodé n'est versionné.

## 9. PostgreSQL et pgvector

PostgreSQL utilise l'image SmartIntern dérivée de `pgvector/pgvector:pg16`.
Le script `01-enable-vector.sql` active l'extension `vector` à l'initialisation,
et chaque smoke test la vérifie avec une vraie requête SQL.

## 10. PVC

Le StatefulSet demande `postgres-data-postgres-0` de 3 GiB. Un second PVC de
1 GiB conserve les CV dans `backend-uploads`. Le StorageClass par défaut de
Minikube fournit les volumes dynamiquement.

## 11. Migration Job

Le Job `backend-migrate` exécute `prisma migrate deploy`. Le script attend
PostgreSQL Ready, recrée le Job pour chaque SHA et exige `Complete` avant
d'appliquer les applications.

## 12. Backend

Le Deployment backend écoute sur 5000, monte le PVC des CV et communique avec
`postgres:5432` et `ai-service:8000`. `DATABASE_URL` et `JWT_SECRET` viennent
exclusivement du Secret.

## 13. AI service

Le service FastAPI écoute sur 8000. Les téléchargements de modèles restent
désactivés pour une validation déterministe et raisonnable en ressources.

## 14. Frontend

Nginx écoute sur 8080 et conserve son proxy `/api` vers le Service backend. Le
Service NodePort réserve 30080 pour l'accès local reproductible.

## 15. Services

PostgreSQL est headless pour le StatefulSet. Backend et AI utilisent ClusterIP.
Frontend utilise NodePort. Les communications internes reposent uniquement sur
les noms DNS Kubernetes.

## 16. Probes

Backend, AI et frontend réutilisent `/health`. PostgreSQL utilise `pg_isready`.
Chaque workload possède startup, readiness et liveness probes avec des délais
compatibles avec un poste de développement.

## 17. Resources

Des requests et limits sont définies pour chaque conteneur. L'AI peut utiliser
jusqu'à 1 GiB et 1,5 CPU, PostgreSQL jusqu'à 1 GiB, le backend 768 MiB et le
frontend 128 MiB.

## 18. Deployment

Windows peut utiliser `deploy.ps1`; WSL et Jenkins utilisent `deploy.sh`. Les
deux implémentations valident le cluster, créent le namespace et le Secret,
appliquent les trois phases, attendent le Job et vérifient chaque rollout.
Le poste de validation utilise la version WSL afin d'éviter l'interférence TLS
locale observée entre `kubectl.exe` et le port loopback de Docker Desktop.

## 19. Jenkins

Jenkins embarque kubectl 1.32.2. Après Application CI, Compose, SonarQube,
Quality Gate, Docker Build, Compose Smoke et Registry Publish, les branches
`main` et `devops/step-7-kubernetes-minikube` déploient le SHA dans Minikube.
Les autres branches effectuent seulement la validation client des manifests.

## 20. Kubeconfig

Jenkins utilise le Secret File credential `smartintern-minikube-kubeconfig`.
Le fichier est auto-contenu et cible l'API Minikube via Docker Desktop. Aucun
chemin utilisateur Windows n'apparaît dans le `Jenkinsfile`.

## 21. Smoke tests

Les scripts exigent pods Ready, Job Complete, PVC Bound, images SHA exactes,
pgvector disponible et réponses saines des trois endpoints. Le backend vérifie
aussi sa connexion au service IA.

## 22. Diagnostics

En cas d'échec, les scripts affichent ressources, PVC, événements, descriptions
de pods et logs des workloads et du Job. Un rollout ou test défaillant retourne
toujours un exit code non nul.

## 23. Cleanup

Le profil Minikube reste persistant entre les builds. Jenkins remplace les
ressources du namespace et recrée uniquement le Job de migration. Les scripts
`cleanup` exigent une confirmation explicite avant de supprimer le namespace.

## 24. Sécurité

Les conteneurs applicatifs tournent non-root, sans élévation de privilège, avec
capabilities supprimées et filesystem en lecture seule lorsque compatible. Les
secrets ne sont ni journalisés ni stockés dans les ConfigMaps. L'entrypoint
officiel PostgreSQL démarre brièvement avec ses permissions d'initialisation,
puis exécute le serveur sous l'utilisateur `postgres`; le PVC conserve un
`fsGroup` dédié.

## 25. Commandes utiles

```powershell
wsl minikube status -p smartintern-ai
wsl kubectl get all,pvc -n smartintern
wsl kubectl rollout status deployment/backend -n smartintern
wsl kubectl logs -n smartintern job/backend-migrate
wsl minikube service frontend -n smartintern -p smartintern-ai --url
```

## 26. Troubleshooting

- `ImagePullBackOff` : vérifier le tag SHA public dans Docker Hub.
- `CrashLoopBackOff` : consulter `describe`, les événements et les logs.
- PVC Pending : vérifier `kubectl get storageclass` et le provisioner Minikube.
- migration en échec : consulter le Job et confirmer la disponibilité DB.
- Jenkins ne joint pas l'API : vérifier le credential kubeconfig et l'accès à
  `host.docker.internal` depuis le conteneur Jenkins.
- validation TLS instable avec `kubectl.exe` : utiliser le client WSL avec le
  kubeconfig natif; ne pas désactiver TLS dans le credential Jenkins.
- probe en échec : tester l'endpoint depuis le pod avant de modifier les délais.

## 27. Validation finale

La Step est valide seulement si le pipeline feature puis `main` réussissent,
le Quality Gate reste `OK`, les cinq tags SHA existent dans Docker Hub, tous les
pods sont Ready, le Job est Complete, pgvector répond et le SHA `main` est celui
réellement déployé.
