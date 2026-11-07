# Audit Step 10 — 7 novembre 2026

Le dossier fourni `smartintern-ai-main/smartintern-ai-main` est une archive sans `.git`.
La continuation utilise le clone séparé `smartintern-ai-main/step10-worktree` du dépôt
`basemhasni/smartintern-ai`. `PROJECT_CONTEXT.md` a été lu avant toute modification.

État distant réellement récupéré : `main=a5f9c34be6501d9fb784434c4f65bec274715c4a`.
La branche `release/step-10-final-stabilization` existait déjà à
`8c240b791dbba8d9141bb891b479a8e25136647b`, avec trois commits après main.
Elle a été inspectée avant sa reprise. Aucun tag `v1.0.0` n'existait lors de la lecture.

## Stack constatée

React 18 + Vite 5 + React Router 7 ; Express 5 + Prisma 6 ; FastAPI + LangGraph ;
mobile Expo/React Native + TypeScript. La mention Flutter dans le contexte historique
ne correspond pas à l'implémentation mobile actuelle. PostgreSQL 16 avec extension
vector ; Helm 4 ; scripts Kubernetes/observabilité Step 9 conservés.

## Matrice de validation

| Fonction réelle | Test trouvé sur la branche reprise | Manque constaté | Validation ajoutée |
| --- | --- | --- | --- |
| Inscription/connexion STUDENT/COMPANY | API Playwright + parcours navigateur minimal | Reconnexion, persistance profils | UI : modification, rechargement, login/logout |
| JWT/rôles/CSRF | Quelques refus API | Expiration, signature, cookie + header mobile | Tests HTTP backend déterministes, production JWT placeholders refusés |
| Profils étudiant/entreprise | Consultation UI | Validation payload et champs protégés | PUT/GET réel API, rôle non modifiable |
| Offres CRUD/publication | Création API/UI | Modification UI, propriétaire étranger | UI modification et API ownership 404 |
| Candidatures | Création + doublon | Société étrangère, statuts, vue recruteur après candidature | API validation/statut/403 et UI consultation candidat |
| CV PDF/DOCX | Smoke mobile existant, pas de navigateur | Upload réel, CV privé, document illisible | Fixture DOCX synthétique, contrôles API/UI et extraction backend |
| Matching V3 | Tests Python des services | Graphe LangGraph non exécuté | Graphe compilé, bornes du score, skill manquante, entrée invalide ; appel réel via parcours UI |
| Lettre V2 | Tests Python du service | Graphe, claims, génération depuis UI | Tests graphe complet/erreur contrôlée et UI génération avec backend+IA réels |
| RAG V2 | Tests Python chunk/embedding/rerank | Persistance et isolation via API | Upload/indexation, recherche topK=1, locataire différent, résultat vide |
| Career Assistant, Skill Gap, Offer Quality, Orchestrator | Tests Python existants + smoke mobile | Conserver la régression | Suite complète et smoke mobile existant |
| Admin : dashboard/users/companies | Routes et pages réelles | Pas de compte administrateur synthétique provisionné dans la suite navigateur | Refus non-admin testés ; parcours admin positif reste à valider |
| Mobile | lint/typecheck/Expo Doctor et script smoke | Tests unitaires des utilitaires | 3 tests avec TypeScript existant, sans infrastructure supplémentaire |
| Sauvegarde/restore | pg_dump et base temporaire | Comparaison fragile aux données actives après dump | Schéma/tables/migrations/vector validés dans le dump restauré, données synthétiques vérifiables |
| Recovery | Suppression pods + marqueur PostgreSQL | Race de recréation, identité PVC après redémarrage | Nouveau UID pod, même UID PVC Bound, marqueur et calcul vectoriel après redémarrage |
| Sécurité | Trivy images CRITICAL corrigibles | Filesystem/secrets/configurations et rapports expurgés | Même Trivy épinglé, politique testée et rapports JSON sans valeurs de secrets |

## Limite RAG à présenter honnêtement

Le RAG est implémenté. Les embeddings sont conservés dans `VectorDocument.embeddingJson`
et le classement hybride est calculé en JavaScript dans `ragV2.service.js`.
Il n'utilise pas un index SQL vectoriel pour la recherche applicative. La présence de
pgvector et son opérateur sont testées séparément lors de la restauration/recovery.
Ne pas présenter ces deux validations comme une preuve d'indexation ANN en production.

## Environnement trouvé

Docker Desktop opérationnel, aucun Jenkins ou SonarQube local actif ; port 8090 fermé.
Le profil Windows `minikube` existant était arrêté. Le profil demandé `smartintern-ai`
était absent, y compris des outils WSL inspectés. Un profil de validation distinct
`smartintern-ai` a été créé : Kubernetes 1.37.0, 4 CPU, 4 Go, Ingress activé.
Le refus GitHub non interactif confirme l'absence d'identifiants de push disponibles.
Les succès historiques indiqués dans les anciens documents ne remplacent pas les preuves
des builds Jenkins feature/main sur le SHA final.
