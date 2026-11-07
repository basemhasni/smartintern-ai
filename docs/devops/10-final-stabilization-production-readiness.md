# Step 10: final stabilization and production readiness

Cette validation couvre la démonstration PFE locale sur Docker Desktop et Minikube.
Elle ne constitue pas une homologation cloud ni un SLA de production publique.

## Parcours et tests

- `frontend-web/e2e/student-company.spec.js` utilise Chromium et la vraie UI pour inscrire une entreprise, publier une offre, inscrire un étudiant, postuler et vérifier le suivi. Les comptes et offres utilisent des identifiants aléatoires dans la base Compose jetable.
- `frontend-web/e2e/api-integration.spec.js` vérifie auth, JWT, rôles, validation d'offre, candidature unique, listing et CSRF web.
- `npm run test:e2e` depuis `frontend-web` utilise `E2E_BASE_URL` (par défaut `http://localhost:8088`). En CI, Playwright `1.63.0` tourne sur le réseau Compose et utilise `http://frontend:8080`.
- Les tests unitaires backend, frontend, IA et les contrôles mobile restent dans `Application CI`. Les workflows IA sont couverts par les tests Python déterministes existants, sans API LLM payante.
- Le rapport JUnit E2E est publié par Jenkins. Les traces et captures ne sont conservées qu'en échec.
- Le stage SonarQube utilise le Node installé dans Jenkins et un verrou partagé pour éviter deux analyses concurrentes sur le même hôte.

## Sécurité

Trivy `0.68.2` scanne les cinq images runtime pour les vulnérabilités HIGH/CRITICAL. Les résultats non corrigés restent visibles ; le pipeline échoue sur les vulnérabilités CRITICAL avec correctif disponible. Le scan local du 4 octobre 2026 passe ce seuil sur les cinq images. Il reste des avis HIGH et des CRITICAL sans correctif publié, notamment dans les images de base ; ils exigent un suivi régulier. Ce contrôle ne constitue pas une promesse de zéro risque.

Le scan CI du 8 octobre a ensuite détecté deux correctifs publiés après cette validation : `perl-base` et `proxy-addr` dans les images backend. La mise à jour vers `perl-base 5.36.0-7+deb12u4` et `proxy-addr 2.0.8` a été vérifiée dans l'image runtime ; les images backend et migration reconstruites passent le gate CRITICAL local du 11 octobre 2026. Le pipeline complet doit encore confirmer ce résultat sur le SHA final.

Les audits npm sont exécutés séparément. Le frontend de production n'a pas de vulnérabilité connue après mise à jour des dépendances ; des avis sur les outils de développement restent documentés. Le backend runtime est contrôlé par le scan de l'image, car `npm audit --omit=dev` peut encore signaler la chaîne Prisma CLI du lockfile. Aucun secret ou dump n'est archivé par la CI.

## Performance

`devops/release/performance/smoke.js` utilise k6 `0.55.2`, 3 VU pendant 20 secondes, uniquement `GET /health` backend et IA. Baseline locale Compose mesurée après reconstruction des images : 120 requêtes, 0 % d'échecs, 5,90 req/s, médiane 4,13 ms, p95 34,5 ms et p99 41,33 ms. Seuils CI : erreurs < 1 %, p95 < 500 ms. Ce test détecte une régression grossière ; il ne mesure pas la capacité sous charge réelle ni les workflows IA coûteux.

## Sauvegarde et restauration

Le dump personnalisé PostgreSQL est créé par `devops/release/scripts/backup-postgres.sh --output artifacts/backups/backup.dump`. Le fichier contient potentiellement des données privées : protéger l'accès et la durée de conservation. Le script refuse d'écraser un dump existant. `verify-restore-postgres.sh --input artifacts/backups/backup.dump` crée une base temporaire, restaure le dump, vérifie les dix tables critiques, les migrations terminées, `vector` et une distance vectorielle, puis supprime seulement la base temporaire. Il ne compare pas les compteurs à la base active, qui peut légitimement avoir changé depuis le dump. `--expect-test-data` exige des utilisateurs synthétiques et une candidature restaurés. Ne jamais utiliser un dump sensible pour la démonstration publique.

En CI, le dump est supprimé après le contrôle, qu'il réussisse ou échoue. Le répertoire `artifacts/backups/` est ignoré par Git. Aucune commande ne détruit la base active.

## Recovery et observabilité

`verify-app-recovery.sh` supprime successivement les pods frontend, backend et AI, puis attend leur remplacement Ready. Le smoke Helm existant avec `--test-persistence` vérifie que PostgreSQL retrouve son PVC et son marqueur après recréation du pod, puis retire le marqueur. Les PVC ne sont jamais supprimés. Les étapes Prometheus/Grafana existantes valident les targets, les séries, la datasource et les dashboards après redéploiement.

## Release

La version produit est portée par le tag Git `v1.0.0`. Les versions internes de packages ne sont pas des versions de release produit ; le chart utilise `version: 1.0.0` et `appVersion: 1.0.0`. Les cinq images Docker `v1.0.0` doivent pointer sur les mêmes digests que les tags SHA du commit `main` validé. Ne pas rebuilder sous `v1.0.0`.

La publication attend successivement : pipeline feature vert, PR fusionnée, pipeline `main` vert, tag annoté, alias Docker vérifiés, GitHub Release. Voir [la checklist](../release/RELEASE_CHECKLIST.md) et [le runbook](../operations/RUNBOOK.md).

## Reprise et validations du 7 novembre 2026

Voir [l'audit réel](../release/STEP10_AUDIT.md) pour le SHA initial et la matrice
fonction/test. Les anciens résultats d'octobre ci-dessus sont historiques ; ils ne
valident pas les modifications de novembre ni un futur commit `main`.

Les E2E incluent maintenant l'édition/rechargement des profils, la modification
d'offre, les reconnexions, un CV DOCX synthétique, le matching, la lettre de
motivation et la consultation du candidat par l'entreprise. La suite API contrôle
les propriétaires étrangers, statuts, champs protégés, CV privés et l'isolation RAG.
Les PDF sans texte exploitable sont refusés ; leur nom de fichier ne constitue
plus une preuve de compétence.

La suite IA exécute réellement les graphes compilés LangGraph de matching et lettre,
y compris les erreurs de validation/claims, sans fournisseur payant. Le mobile a
trois tests de logique utilisant son compilateur TypeScript existant.

`run-kubernetes-e2e.sh` exécute les mêmes tests dans un pod temporaire, via le vrai
Ingress HTTPS. L'exception de certificat concerne uniquement Playwright et
`smartintern.local`, avec activation explicite. Un identifiant de run unique permet
de supprimer seulement les comptes synthétiques de ce run, leurs CV et documents RAG.
Les rapports sont copiés avant suppression du pod. Aucun PVC n'est supprimé.

Trivy conserve sa version `0.68.2`. Les scans filesystem, secrets et configurations
complètent les cinq scans d'images. Le gate bloque toute détection de secret et toute
CRITICAL avec correctif ; les HIGH et CRITICAL sans correctif restent visibles dans
les rapports JSON. La politique est elle-même testée. Les valeurs et extraits de
secrets sont supprimés des sorties et des rapports publiables. Les audits npm natifs
ont le même seuil CRITICAL, sans `audit fix --force`.

Le smoke k6 conserve trois VU pendant vingt secondes et ajoute `GET /api/offers`
aux deux endpoints `/health`. Baseline Compose du 7 novembre, pendant la préparation
du cluster : 180 requêtes, 8,749 req/s, erreurs 0 %, p50 4,64 ms, p95 19,59 ms,
p99 115,21 ms. Le gate existant p95 < 500 ms reste adapté au smoke sur laptop ;
il ne constitue pas un objectif de capacité de production publique.

Le gate final Jenkins exige explicitement les statuts Quality Gate, sécurité,
E2E Compose et Kubernetes, performance, restauration, recovery et observabilité.
Un stage non exécuté ne peut pas être présenté comme validé.

Les images Node applicatives et les agents Node Jenkins sont alignés sur
`22.23.4`, version exacte LTS vérifiée dans les
[archives officielles Node](https://nodejs.org/en/download/archive/v22.23.4).
Node 20 est désormais EOL selon le
[calendrier officiel](https://nodejs.org/en/about/previous-releases) ; conserver
20.19.4 pour une nouvelle release aurait laissé un runtime non maintenu.
Le client kubectl Jenkins est aligné sur le cluster de validation 1.37.0.
Le service IA et son agent CI restent sur Python 3.11 avec le correctif
`3.11.18` épinglé, vérifié dans le
[Dockerfile Python officiel](https://github.com/docker-library/python/blob/master/3.11/slim-bookworm/Dockerfile).
La connexion du Jenkins historique à un autre cluster doit être vérifiée avant
le build complet ; aucune réussite distante n'est déduite de ces contrôles locaux.

## Validation locale reproductible sous Docker Desktop

Le fichier `devops/release/compose.validation.yaml` est réservé aux outils de test.
Les volumes de dépendances Linux n'installent rien sur le poste Windows. Copier
`.env.ci.example` vers `.env.step10-validation` (ignoré), et y attribuer des noms de
volumes propres à la validation. Les identifiants de cet exemple sont jetables,
interdits pour un déploiement de production.

```powershell
docker compose -p smartintern-step10-validation --env-file .env.step10-validation build
docker compose -p smartintern-step10-validation --env-file .env.step10-validation up -d --no-build --wait --wait-timeout 180
docker compose -p smartintern-step10-validation --env-file .env.step10-validation -f compose.yaml -f devops/release/compose.validation.yaml run --rm frontend-tests
docker compose -p smartintern-step10-validation --env-file .env.step10-validation -f compose.yaml -f devops/release/compose.validation.yaml run --rm backend-tests
docker compose -p smartintern-step10-validation --env-file .env.step10-validation -f compose.yaml -f devops/release/compose.validation.yaml run --rm ai-tests
docker compose -p smartintern-step10-validation --env-file .env.step10-validation -f compose.yaml -f devops/release/compose.validation.yaml run --rm mobile-checks
docker compose -p smartintern-step10-validation --env-file .env.step10-validation -f compose.yaml -f devops/release/compose.validation.yaml run --rm mobile-smoke
docker compose -p smartintern-step10-validation --env-file .env.step10-validation -f compose.yaml -f devops/release/compose.validation.yaml run --rm e2e-tests
docker compose -p smartintern-step10-validation --env-file .env.step10-validation -f compose.yaml -f devops/release/compose.validation.yaml run --rm performance
```

Les tests Compose utilisent une base jetable ; les essais sur une base partagée
doivent utiliser le script Kubernetes et son nettoyage ciblé. Les dumps et rapports
locaux restent sous `artifacts/`, ignorés par Git ; les dumps ne sont jamais archivés
par Jenkins. Les outils locaux facultatifs sont construits avec `Dockerfile.tools`,
qui réutilise Helm 4.1.4 et kubectl 1.37.0 et vérifie leurs checksums de téléchargement.
