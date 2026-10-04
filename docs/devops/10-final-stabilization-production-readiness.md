# Step 10: final stabilization and production readiness

Cette validation couvre la démonstration PFE locale sur Docker Desktop et Minikube.
Elle ne constitue pas une homologation cloud ni un SLA de production publique.

## Parcours et tests

- `frontend-web/e2e/student-company.spec.js` utilise Chromium et la vraie UI pour inscrire une entreprise, publier une offre, inscrire un étudiant, postuler et vérifier le suivi. Les comptes et offres utilisent des identifiants aléatoires dans la base Compose jetable.
- `frontend-web/e2e/api-integration.spec.js` vérifie auth, JWT, rôles, validation d'offre, candidature unique, listing et CSRF web.
- `npm run test:e2e` depuis `frontend-web` utilise `E2E_BASE_URL` (par défaut `http://localhost:8088`). En CI, Playwright `1.63.0` tourne sur le réseau Compose et utilise `http://frontend:8080`.
- Les tests unitaires backend, frontend, IA et les contrôles mobile restent dans `Application CI`. Les workflows IA sont couverts par les tests Python déterministes existants, sans API LLM payante.
- Le rapport JUnit E2E est publié par Jenkins. Les traces et captures ne sont conservées qu'en échec.

## Sécurité

Trivy `0.68.2` scanne les cinq images runtime pour les vulnérabilités HIGH/CRITICAL. Les résultats non corrigés restent visibles ; le pipeline échoue sur les vulnérabilités CRITICAL avec correctif disponible. Le scan local du 4 octobre 2026 passe ce seuil sur les cinq images. Il reste des avis HIGH et des CRITICAL sans correctif publié, notamment dans les images de base ; ils exigent un suivi régulier. Ce contrôle ne constitue pas une promesse de zéro risque.

Les audits npm sont exécutés séparément. Le frontend de production n'a pas de vulnérabilité connue après mise à jour des dépendances ; des avis sur les outils de développement restent documentés. Le backend runtime est contrôlé par le scan de l'image, car `npm audit --omit=dev` peut encore signaler la chaîne Prisma CLI du lockfile. Aucun secret ou dump n'est archivé par la CI.

## Performance

`devops/release/performance/smoke.js` utilise k6 `0.55.2`, 3 VU pendant 20 secondes, uniquement `GET /health` backend et IA. Baseline locale Compose mesurée après reconstruction des images : 120 requêtes, 0 % d'échecs, 5,90 req/s, médiane 4,13 ms, p95 34,5 ms et p99 41,33 ms. Seuils CI : erreurs < 1 %, p95 < 500 ms. Ce test détecte une régression grossière ; il ne mesure pas la capacité sous charge réelle ni les workflows IA coûteux.

## Sauvegarde et restauration

Le dump personnalisé PostgreSQL est créé par `devops/release/scripts/backup-postgres.sh --output artifacts/backups/backup.dump`. Le fichier contient potentiellement des données privées : protéger l'accès et la durée de conservation. `devops/release/scripts/verify-restore-postgres.sh --input artifacts/backups/backup.dump` crée une base temporaire, restaure le dump, compare le nombre d'utilisateurs et de tables, vérifie `vector` et une distance vectorielle, puis supprime seulement la base temporaire. Ne jamais utiliser un dump sensible pour la démonstration publique.

En CI, le dump est supprimé après le contrôle, qu'il réussisse ou échoue. Le répertoire `artifacts/backups/` est ignoré par Git. Aucune commande ne détruit la base active.

## Recovery et observabilité

`verify-app-recovery.sh` supprime successivement les pods frontend, backend et AI, puis attend leur remplacement Ready. Le smoke Helm existant avec `--test-persistence` vérifie que PostgreSQL retrouve son PVC et son marqueur après recréation du pod, puis retire le marqueur. Les PVC ne sont jamais supprimés. Les étapes Prometheus/Grafana existantes valident les targets, les séries, la datasource et les dashboards après redéploiement.

## Release

La version produit est portée par le tag Git `v1.0.0`. Les versions internes de packages ne sont pas des versions de release produit ; le chart utilise `version: 1.0.0` et `appVersion: 1.0.0`. Les cinq images Docker `v1.0.0` doivent pointer sur les mêmes digests que les tags SHA du commit `main` validé. Ne pas rebuilder sous `v1.0.0`.

La publication attend successivement : pipeline feature vert, PR fusionnée, pipeline `main` vert, tag annoté, alias Docker vérifiés, GitHub Release. Voir [la checklist](../release/RELEASE_CHECKLIST.md) et [le runbook](../operations/RUNBOOK.md).
