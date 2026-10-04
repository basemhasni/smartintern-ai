# SmartIntern AI v1.0.0 : checklist

Cocher seulement après vérification réelle et conserver les références de build/commit dans le rapport de release.

- [ ] Frontend, backend, IA : tests et build verts.
- [ ] Mobile : lint, TypeScript, Expo Doctor et smoke existant verts.
- [ ] Playwright : parcours entreprise, étudiant et intégration API verts sur base jetable.
- [ ] SonarQube Quality Gate `OK` pour la branche et `main`.
- [ ] Audit dépendances et résultats Trivy HIGH/CRITICAL examinés ; aucun CRITICAL corrigeable restant.
- [ ] Aucun secret ni dump suivi par Git.
- [ ] Cinq images Docker construites et scans validés.
- [ ] k6 : erreurs < 1 %, p95 < 500 ms ; p50/p95/p99 consignés.
- [ ] Dump PostgreSQL produit, archive valide et restore temporaire réussi.
- [ ] Tables, données de test et pgvector vérifiés après restore.
- [ ] Recovery frontend, backend, AI et PostgreSQL réussi ; PVC Bound.
- [ ] Helm lint, template, upgrade, status et history vérifiés.
- [ ] Ingress HTTPS et endpoints santé disponibles.
- [ ] Prometheus/Grafana Ready, cibles UP, datasource et dashboards présents.
- [ ] Pipeline Jenkins feature `SUCCESS` et PR fusionnée.
- [ ] Pipeline Jenkins `main` `SUCCESS` sur le SHA de merge.
- [ ] Tag Git annoté `v1.0.0` poussé sur le SHA validé.
- [ ] Cinq tags Docker `v1.0.0` présents et digests égaux aux tags SHA.
- [ ] GitHub Release créée avec notes sans secret.
- [ ] Branche release supprimée, `main` propre et cluster actif.
