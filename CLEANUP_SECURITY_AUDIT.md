# SmartIntern AI - Cleanup & Security Audit

Date: 2026-06-28
Branch: refactor/project-cleanup-security-hardening

## Scope

Audit initial avant modification du projet:

- `backend-api`
- `frontend-web`
- `ai-service`
- `devops`, `database`, `docs`, `mobile-app`

Objectif: identifier les nettoyages et renforcements simples, non destructifs, sans supprimer de logique incertaine.

## Etat General

Le projet est structure en modules clairement separes:

- Backend Express avec routes/controllers/services/middlewares.
- Frontend React/Vite avec pages, composants, API clients, layouts et composants IA.
- AI-service FastAPI avec API, agents, services, workflows, orchestration, RAG et evaluation.
- Devops/database/docs/mobile-app existent mais sont peu peuplees dans l'audit initial.

Aucune suppression automatique n'est recommandee sans analyse de references supplementaire.

## Backend-api - Constats

### Structure

- Structure globale coherente: `routes`, `controllers`, `services`, `middlewares`, `utils`, `config`.
- Les endpoints sensibles passent majoritairement par `protect` et `authorizeRoles`.
- `test-protected.routes.js` est monte en permanence sous `/api/test`; utile en developpement mais inutile en production.
- `app.js` concentre la configuration globale Express, mais CORS et limites body sont trop permissifs.

### Securite Auth

- JWT signe avec `JWT_SECRET`, expiration 24h.
- `JWT_SECRET` est verifie au moment de generer/verifier un token, mais pas valide au demarrage.
- `passwordHash` est retire par `sanitizeUser`, et bloque dans plusieurs services.
- Forgot/reset password existe avec token hash SHA-256, expiration et usage unique.
- Le fallback dev expose un lien reset uniquement hors production, comportement acceptable en developpement.
- Les endpoints login/register/forgot/reset n'ont pas encore de rate limiting dedie.

### Securite API

- `helmet` est active.
- `cors()` est ouvert a toutes les origines.
- `express.json()` n'a pas de limite explicite.
- Le gestionnaire d'erreur retourne `err.message`; il n'expose pas la stack, mais il manque un format plus strict en production.
- Les uploads CV passent par `multer`; limite a verifier dans `upload.middleware.js`.

### Variables d'environnement

- `backend-api/.env.example` contient des valeurs SMTP concretes et doit etre nettoye en placeholders.
- Variables attendues: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `AI_SERVICE_URL`, `SMTP_*`.
- Ajouter une validation de configuration au demarrage est recommande.

### Dependances

- `nodemailer` est utilise pour le reset password.
- Pas de dependance manifestement morte identifiee sans analyse statique plus poussee.

## Frontend-web - Constats

### Structure

- Structure claire: `pages`, `components`, `api`, `auth`, `utils`, `routes`.
- Composants IA regroupes dans `src/components/ai`.
- Pages auth incluent login/register/forgot/reset.

### Securite et UX

- Token stocke dans `localStorage`; coherent avec l'existant mais XSS-sensitive.
- `ProtectedRoute` et routes role-based existent.
- Pas de secret frontend apparent dans `.env.example`; seul `VITE_API_BASE_URL`.
- Le fallback dev `devResetLink` est affiche dans la page forgot-password; acceptable uniquement car le backend ne le retourne pas en production.
- Gestion d'erreurs API centralisee partiellement dans `axiosClient`.

### Code mort ou suspect

- Plusieurs pages placeholder existent mais peuvent encore servir de fallback ou historique; ne pas supprimer sans verification de references.
- Des assets `design-references` sont probablement non runtime, mais peuvent etre utiles au design; ne pas supprimer sans accord.

## AI-service - Constats

### Structure

- Structure riche et coherente: `api`, `services`, `agents`, `workflows`, `orchestration`, `rag`, `evaluation`, `scripts`.
- Plusieurs versions coexistent (`v2`, `v3`, anciens agents/services). Risque de duplication, mais certaines sont encore referencees par workflows/evaluations.
- Scripts et fixtures d'evaluation nombreux; a conserver.

### Securite

- Pas de secret hardcode identifie dans l'audit rapide.
- `rag_routes.py` expose encore des embeddings dans certains endpoints AI-service (`/ai/rag/embed`, `/ai/rag/v2/index-document`). C'est acceptable pour endpoints techniques internes, mais a documenter et eviter cote frontend/backend public.
- Pas de CORS explicite dans FastAPI; probablement consomme via backend et local.
- Gestion FastAPI des erreurs de validation presente.

### Nettoyage

- Les `print` dans scripts/evaluators sont attendus.
- Ne pas supprimer anciens services/agents sans graphe de reference complet.

## Devops / Docs / Mobile / Database

- Audit initial limite: peu de fichiers listables dans `devops`, `database`, `docs`, `mobile-app`.
- Aucun fichier critique a supprimer identifie.

## Fichiers Suspects / A Verifier Plus Tard

- `backend-api/src/routes/test-protected.routes.js`: utile en dev, a desactiver en production.
- `frontend-web/src/pages/*PlaceholderPage.jsx`: verifier usages historiques avant suppression.
- `frontend-web/design-references/**`: non runtime, mais peut etre volontaire.
- Anciens services/agents AI (`*_v2.py`, versions sans suffixe): duplication possible mais probablement utilises par compatibilite.
- `ai-service/evaluation/reports/*.json|*.md`: rapports generes utiles pour historique; suppression possible uniquement avec accord.

## Recommandations Avant Modification

Priorite haute:

1. Nettoyer `.env.example` pour ne contenir aucun secret reel.
2. Ajouter validation env backend au demarrage.
3. Restreindre CORS via `FRONTEND_URL` / `CORS_ORIGIN`.
4. Ajouter limite JSON body.
5. Ajouter rate limiting simple sur routes auth.
6. Desactiver `/api/test` en production.
7. Garder logs reset password uniquement en developpement.

Priorite moyenne:

1. Documenter que `localStorage` pour JWT est un compromis.
2. Documenter endpoints RAG internes qui retournent embeddings.
3. Conserver scripts d'evaluation et rapports, mais envisager rotation/nettoyage plus tard.

Priorite basse:

1. Audit statique plus poussee des imports inutilises frontend/Python.
2. Regrouper progressivement les anciennes versions AI si les workflows modernes n'en dependent plus.

