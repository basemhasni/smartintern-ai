# Troubleshooting

## Backend ne démarre pas

Symptôme : erreur au lancement `npm run dev`.

Causes possibles :

- `.env` absent ;
- `DATABASE_URL` incorrect ;
- `JWT_SECRET` manquant ;
- dépendances non installées.

Solutions :

```bash
cd backend-api
npm install
npm run db:check
```

## Prisma generate échoue avec EPERM

Symptôme : erreur sur `query_engine-windows.dll.node`.

Cause probable : fichier verrouillé par un process Node, Prisma ou OneDrive.

Solutions :

- fermer les serveurs Node ;
- fermer Prisma Studio ;
- désactiver temporairement la synchronisation OneDrive sur le dossier ;
- relancer `npx prisma generate`.

## CSRF token invalide

Symptôme : `403 Token CSRF invalide ou manquant`.

Causes possibles :

- frontend n'appelle pas `/api/auth/csrf-token` ;
- requête mutante faite hors `axiosClient` ;
- cookies non envoyés.

Solutions :

- utiliser `axiosClient` ;
- vérifier `withCredentials: true` ;
- vérifier `VITE_API_BASE_URL`.

## Cookie non envoyé

Causes possibles :

- CORS incorrect ;
- origine frontend non autorisée ;
- `AUTH_COOKIE_SECURE=true` en HTTP local ;
- navigateur bloque les cookies.

Solutions :

- vérifier `FRONTEND_URL` et `CORS_ORIGIN` ;
- en local, garder `AUTH_COOKIE_SECURE=false`.

## Frontend API error

Vérifier :

- backend démarré ;
- `VITE_API_BASE_URL=http://localhost:5000` ;
- route backend existante ;
- session utilisateur valide.

## AI-service indisponible

Symptôme : erreur backend lors d'un matching ou d'une génération IA.

Solutions :

```bash
cd ai-service
python -m uvicorn app.main:app --reload --port 8000
```

Vérifier aussi `AI_SERVICE_URL=http://localhost:8000` côté backend.

## evaluate_ai_suite échoue

Causes possibles :

- import Python cassé ;
- environnement virtuel incomplet ;
- fichiers `__pycache__` verrouillés.

Solution Windows/OneDrive :

```powershell
$env:PYTHONPYCACHEPREFIX=Join-Path $env:TEMP 'smartintern-ai-pycache-check'
python -m compileall app
python scripts/evaluate_ai_suite.py
```

## Reset password : email non reçu

Causes possibles :

- SMTP fictif ;
- Gmail sans App Password ;
- `SMTP_TLS_REJECT_UNAUTHORIZED` incorrect ;
- email dans spam.

Solution :

- utiliser un vrai SMTP ;
- avec Gmail, créer un App Password ;
- vérifier les logs backend en développement.

## npm audit TLS certificate error

Symptôme : erreur certificat lors de `npm audit`.

Cause probable : configuration réseau locale, proxy ou certificat.

Solution :

- vérifier réseau/proxy ;
- ne pas désactiver TLS durablement en production.

## Chunk frontend > 500 kB

Symptôme : warning Vite au build.

Impact : non bloquant.

Amélioration future :

- code splitting ;
- imports dynamiques ;
- `manualChunks` Rollup.

