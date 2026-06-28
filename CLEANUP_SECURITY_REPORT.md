# SmartIntern AI - Cleanup & Security Report

Date: 2026-06-28
Branch: refactor/project-cleanup-security-hardening

## 1. Resume du Nettoyage

Nettoyage realise de maniere conservative:

- Aucun fichier metier supprime.
- Audit initial documente dans `CLEANUP_SECURITY_AUDIT.md`.
- Renforcement backend Express sans changer les contrats API.
- Configuration d'environnement backend centralisee.
- Rate limiting simple ajoute sur les endpoints auth.
- CORS backend controle par variables d'environnement.
- Limite JSON body ajoutee.
- Routes de test backend desactivees automatiquement en production.
- AI-service renforce avec CORS optionnel et messages de validation moins verbeux en production.
- `.env.example` backend et AI-service mis a jour sans vrais secrets.

## 2. Fichiers Supprimes

Aucun fichier supprime.

Raison: plusieurs fichiers suspects peuvent encore etre utilises indirectement ou servir de compatibilite, notamment les anciens agents/services IA, les pages placeholder et les references design. Ils sont listes dans la section "A verifier plus tard".

## 3. Fichiers Modifies

- `backend-api/.env.example`
- `backend-api/src/app.js`
- `backend-api/src/routes/auth.routes.js`
- `backend-api/src/server.js`
- `ai-service/.env.example`
- `ai-service/app/core/config.py`
- `ai-service/app/main.py`

## 4. Fichiers Crees

- `CLEANUP_SECURITY_AUDIT.md`
- `CLEANUP_SECURITY_REPORT.md`
- `backend-api/src/config/env.js`
- `backend-api/src/middlewares/rateLimit.middleware.js`
- `ai-service/evaluation/reports/ai_evaluation_report_20260628_043651.json`
- `ai-service/evaluation/reports/ai_evaluation_report_20260628_043651.md`

## 5. Refactorings Effectues

### Backend

- Ajout d'un module `config/env.js` pour:
  - parser les origines CORS autorisees;
  - valider les variables obligatoires;
  - refuser un `JWT_SECRET` faible en production.
- Ajout d'un middleware `createRateLimiter` reutilisable.
- Configuration Express plus explicite:
  - `helmet`;
  - CORS controle;
  - `express.json({ limit })`;
  - routes `/api/test` uniquement hors production.

### AI-service

- Ajout de `ALLOWED_ORIGINS` dans la configuration.
- Ajout conditionnel de `CORSMiddleware`.
- Masquage du detail brut des erreurs de validation en production.

## 6. Corrections Securite Backend

- CORS n'est plus ouvert globalement par defaut.
- Ajout de `CORS_ORIGIN` et fallback sur `FRONTEND_URL`.
- Ajout de `JSON_BODY_LIMIT`, par defaut `1mb`.
- Ajout de rate limiting sur:
  - `/api/auth/register`
  - `/api/auth/login`
  - `/api/auth/forgot-password`
  - `/api/auth/reset-password`
- Validation env au demarrage dans `server.js`.
- `/api/test` n'est plus expose en production.
- Handler d'erreurs: les erreurs 500 sont masquees en production.
- `.env.example` ne contient pas de vrais identifiants SMTP.

## 7. Corrections Securite Frontend

Aucune modification runtime frontend necessaire dans cette etape.

Constats documentes:

- Les routes privees restent protegees par `ProtectedRoute`.
- Le frontend ne contient pas de secret dans `.env.example`.
- Le stockage JWT en `localStorage` reste un compromis existant; a revisiter si une politique anti-XSS plus stricte est souhaitee.

## 8. Corrections Securite AI-service

- CORS configurable via `ALLOWED_ORIGINS`.
- Les erreurs Pydantic detaillees ne sont plus retournees en production.
- Les endpoints RAG techniques qui retournent des embeddings restent disponibles cote AI-service; ils doivent rester internes et ne pas etre exposes directement au frontend public.

## 9. Dependances Ajoutees/Supprimees

Aucune dependance ajoutee ou supprimee pendant cette etape.

Note:

- `npm audit` backend/frontend a ete tente, mais bloque par la verification TLS du registre npm: `unable to verify the first certificate`.
- Aucun contournement TLS global n'a ete applique.

## 10. Variables d'Environnement Ajoutees/Documentees

Backend:

- `CORS_ORIGIN`
- `JSON_BODY_LIMIT`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_SECURE`
- `SMTP_TLS_REJECT_UNAUTHORIZED`

AI-service:

- `ALLOWED_ORIGINS`

## 11. Tests Executes

Backend:

- `node -e "require('./src/app'); console.log('backend app imports ok')"`
- `npx prisma generate`

Frontend:

- `npm run build`

AI-service:

- `python -m compileall app`
- `python scripts/evaluate_ai_suite.py`

Dependency audit:

- `npm audit --audit-level=high` backend
- `npm audit --audit-level=high` frontend

## 12. Resultats des Tests

Backend:

- App Express import: OK
- Prisma generate: OK

Frontend:

- Build Vite: OK
- Warning non bloquant: chunk JS > 500 kB.

AI-service:

- Compile Python: OK avec `PYTHONPYCACHEPREFIX` temporaire.
- Note: le premier `compileall` sans cache temporaire a echoue a cause de fichiers `__pycache__` verrouilles par Windows/OneDrive, pas a cause de syntaxe Python.

AI Evaluation Suite:

- Matching V3: 15/15 PASS
- Career Assistant V2: 8/8 PASS
- Motivation Letter V2: 10/10 PASS
- RAG V2: 8/8 PASS
- Orchestrator V2: 10/10 PASS
- Explainability: 8/8 PASS
- Skill Gap Simulator: 8/8 PASS
- Offer Quality Analyzer: 10/10 PASS
- Global: 77/77 PASS
- Status: PASS

Rapports generes:

- `ai-service/evaluation/reports/ai_evaluation_report_20260628_043651.json`
- `ai-service/evaluation/reports/ai_evaluation_report_20260628_043651.md`

Dependency audit:

- Backend npm audit: bloque par TLS/certificat.
- Frontend npm audit: bloque par TLS/certificat.

## 13. Risques Restants

- `localStorage` pour JWT reste sensible en cas de XSS.
- Les anciens services/agents AI coexistent avec les versions V2/V3; ils peuvent etre conserves pour compatibilite mais augmentent le bruit structurel.
- Les endpoints RAG AI-service `/ai/rag/embed` et `/ai/rag/v2/index-document` retournent des embeddings; a garder internes.
- `npm audit` n'a pas pu s'executer a cause du certificat TLS local.
- OneDrive peut verrouiller `.git/index.lock` et des fichiers `__pycache__`, ce qui perturbe certains outils.
- Le frontend a un chunk JS > 500 kB; optimisation par code splitting a envisager plus tard.

## 14. A Verifier Plus Tard

- `frontend-web/src/pages/*PlaceholderPage.jsx`: verifier s'ils sont encore utiles avant suppression.
- `frontend-web/design-references/**`: conserver si ce sont des references design; supprimer seulement avec accord.
- `ai-service/app/agents/*_v2.py`, anciens agents sans suffixe, anciens workflows: verifier graphe d'usage complet avant consolidation.
- `ai-service/evaluation/reports/*.json|*.md`: envisager une politique de retention.
- `backend-api/src/routes/test-protected.routes.js`: peut rester pour dev; deja non monte en production.

## 15. Recommandations Futures

- Ajouter une vraie librairie de validation payload (`zod`, `joi`, `express-validator`) pour backend si le projet accepte une dependance.
- Les tokens auth ont ete migres vers cookies HttpOnly dans la branche `security/auth-http-only-cookie`; voir `AUTH_SECURITY_NOTES.md`.
- Ajouter tests backend automatisees auth/role/reset-password.
- Ajouter code splitting frontend pour reduire le chunk principal.
- Resoudre le probleme certificat npm local puis relancer `npm audit`.
- Garder `SMTP_TLS_REJECT_UNAUTHORIZED=true` en production.

