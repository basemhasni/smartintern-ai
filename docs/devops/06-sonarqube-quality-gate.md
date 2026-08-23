# SonarQube et Quality Gate Jenkins

## 1. Objectif

La Step 6 ajoute une analyse statique du monorepo et un Quality Gate bloquant
dans Jenkins. Une analyse ou un gate en erreur arrête le pipeline avant la
construction, les smoke tests et toute publication Docker Hub.

## 2. Architecture

La stack `devops/sonarqube/compose.yaml` est indépendante de la stack
applicative. Elle contient SonarQube Community Build et un PostgreSQL dédié.
SonarQube rejoint également le réseau externe `jenkins`.

## 3. SonarQube

L'image officielle versionnée est
`sonarqube:26.8.0.126808-community`. Le service écoute sur le port hôte `9000`
par défaut et expose une sonde basée sur `/api/system/status`.

## 4. PostgreSQL SonarQube

La base utilise `postgres:17.11-bookworm`, compatible avec cette version de
SonarQube. Elle n'expose aucun port hôte et reste sur le réseau interne
`smartintern-sonarqube-internal`.

Les volumes persistants sont :

- `smartintern-sonarqube-postgres-data` ;
- `smartintern-sonarqube-data` ;
- `smartintern-sonarqube-extensions` ;
- `smartintern-sonarqube-logs`.

## 5. Jenkins integration

Le plugin Jenkins `sonar:2.18.3` configure le serveur nommé
`SmartIntern SonarQube`. Jenkins utilise l'URL Docker stable
`http://smartintern-sonarqube:9000`.

## 6. Credentials

Le token appartient au compte technique local `jenkins-smartintern`, limité au
droit `Execute Analysis` sur les projets concernés. Jenkins le conserve comme
Secret Text sous l'ID `sonarqube-smartintern-token`. Aucun token n'est présent
dans Git ou dans le `Jenkinsfile`.

## 7. Scanner

Le scanner officiel `8.1.0.6389` est géré comme outil Jenkins sous le nom
`SmartIntern SonarScanner`. La version est explicite et son installation est
pilotée par le plugin Jenkins.

## 8. Project key

Le projet canonique de `main` est `smartintern-ai`. Community Build ne prenant
pas en charge l'analyse de branches, la validation de la branche Step 6 utilise
temporairement `smartintern-ai-step6`.

## 9. Monorepo analysis

`sonar-project.properties` analyse les sources réelles de :

- `frontend-web/src` ;
- `backend-api/src` ;
- `ai-service/app` ;
- `mobile-app/src`.

Les exclusions couvrent uniquement les dépendances, caches, sorties de build,
rapports de couverture et fichiers générés.

## 10. Coverage

Frontend et backend produisent LCOV avec `c8`. Le service IA produit
`ai-service/coverage.xml` avec `coverage.py`. Le mobile reste analysé
statiquement car il ne possède pas encore de suite de tests générant une
couverture fiable.

Avant l'analyse, Jenkins supprime uniquement les répertoires `node_modules`
créés par les agents CI. Le code et les rapports de couverture restent dans le
workspace, tandis que l'analyse TypeScript évite de parcourir les dépendances.

## 11. Quality Gate

Le Quality Gate `Sonar way` reste actif. Jenkins attend le résultat avec
`waitForQualityGate`; tout statut différent de `OK` provoque un échec explicite.
Le stage précède `Docker Build` et rend donc `Registry Publish` inaccessible en
cas d'échec.

## 12. New Code

La définition de New Code utilise `Previous version`. Une analyse de référence
du commit `main` précédent initialise chaque projet, puis chaque SHA Jenkins est
fourni comme `sonar.projectVersion`. Cette stratégie protège les changements
nouveaux sans masquer la dette historique dans les métriques globales.

## 13. Webhook

Le webhook global `Jenkins SmartIntern` cible
`http://jenkins:8080/sonarqube-webhook/`. Il permet à
`waitForQualityGate` de reprendre dès la fin du Compute Engine task.

## 14. Networking Docker/Jenkins/SonarQube

Jenkins et SonarQube partagent le réseau Docker externe `jenkins`. Les noms
`smartintern-sonarqube` et `jenkins` assurent la résolution dans les deux sens,
sans adresse IP codée en dur.

## 15. Pipeline

```text
Checkout -> Preflight -> Application CI -> Compose Validation
-> SonarQube Analysis -> Quality Gate -> Docker Build
-> Compose Smoke Test -> Registry Publish -> Final Summary -> Cleanup
```

## 16. Sécurité

Le fichier réel `devops/sonarqube/.env.sonarqube` est ignoré. Les mots de passe
et tokens ne sont ni injectés dans les images ni affichés. Le mot de passe admin
SonarQube par défaut doit être remplacé pendant le bootstrap.

## 17. Commandes d'administration

```powershell
docker compose --env-file devops/sonarqube/.env.sonarqube `
  -f devops/sonarqube/compose.yaml up -d

docker compose --env-file devops/sonarqube/.env.sonarqube `
  -f devops/sonarqube/compose.yaml ps

Invoke-RestMethod http://localhost:9000/api/system/status
```

Un `docker compose down` conserve les volumes. Ne pas ajouter `--volumes` pour
une opération courante.

## 18. Troubleshooting

- SonarQube reste `starting` : consulter les logs, la santé PostgreSQL et les
  limites mémoire/`vm.max_map_count` de Docker Desktop.
- Jenkins ne résout pas SonarQube : vérifier que les deux conteneurs sont sur le
  réseau `jenkins` et que l'alias `smartintern-sonarqube` existe.
- `waitForQualityGate` expire : vérifier le webhook et l'accès de SonarQube à
  `jenkins:8080`.
- rapport coverage absent : exécuter les scripts CI avant le scanner et ne pas
  inventer de rapport vide.
- erreurs TLS simultanées npm/PyPI : si un antivirus ou proxy intercepte HTTPS,
  déposer sa CA publique locale dans
  `/var/jenkins_home/certs/local-root-ca.crt`. Le wrapper DinD et le pipeline
  ainsi que le wrapper Jenkins l'ajoutent alors au bundle de confiance sans
  désactiver la validation TLS. Recréer les deux services Jenkins après l'ajout
  afin d'appliquer la CA aux opérations Git, npm, pip et BuildKit. Ce
  fichier local n'est jamais versionné ni copié dans les images finales ; les
  Dockerfiles le consomment uniquement comme secret BuildKit éphémère.
  Pour reconstruire l'image du contrôleur dans cet environnement, fournir la CA
  publique avec `docker build --secret id=local_ca,src=<chemin-ca>`. En réseau
  sans interception TLS, ce secret optionnel n'est pas nécessaire.
- coupure réseau brève pendant npm ou pip : les installations CI sont reprises
  au maximum trois fois. Une panne persistante reste bloquante et fait échouer
  le pipeline ; aucune vérification TLS n'est désactivée.
- connexion GitHub lente ou figée : le checkout est limité à cinq minutes par
  tentative et repris au maximum trois fois avant de bloquer la CI.

## 19. Validation finale

La validation exige SonarQube et PostgreSQL sains, une analyse terminée, un
Quality Gate `OK`, puis la réussite des builds/smoke tests et de la publication
Docker Hub. Le projet canonique doit finalement correspondre au commit `main`
mergé.
