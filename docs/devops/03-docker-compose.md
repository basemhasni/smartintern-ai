# SmartIntern AI Docker Compose

Cette étape assemble les images applicatives et PostgreSQL dans une stack locale
unique. `mobile-app` reste volontairement hors de Docker.

## Architecture

```text
Browser :8088
  -> frontend (Nginx :8080)
     -> /api -> backend:5000
        -> postgres:5432
        -> ai-service:8000

migrate -> postgres:5432 (one-shot avant backend)
```

Le backend n'attend pas `ai-service` pour démarrer. Les parcours non IA restent
donc disponibles lorsque l'IA est temporairement indisponible.

## Services

| Service | Image | Rôle | État attendu |
| --- | --- | --- | --- |
| `postgres` | `smartintern-postgres:latest` | PostgreSQL 16 + pgvector | `healthy` |
| `migrate` | `smartintern-backend-migrate:latest` | `prisma migrate deploy` | `Exited (0)` |
| `backend` | `smartintern-backend:latest` | Express + Prisma | `healthy` |
| `ai-service` | `smartintern-ai:latest` | FastAPI + workflows IA | `healthy` |
| `frontend` | `smartintern-frontend:latest` | SPA Vite servie par Nginx | `healthy` |

## Prerequisites

- Docker Desktop ou Docker Engine avec Docker Compose v2 ;
- images Linux ;
- volume externe `smartintern-postgres-data` créé à l'étape 2 ;
- ports hôte disponibles, ou valeurs `*_HOST_PORT` adaptées.

```powershell
docker version
docker compose version
docker volume inspect smartintern-postgres-data
```

## Environment

Créer le fichier local ignoré par Git à partir de l'exemple :

```powershell
Copy-Item .env.compose.example .env.compose
```

Remplacer au minimum `POSTGRES_PASSWORD` et `JWT_SECRET` par des valeurs locales
fortes. Le mot de passe PostgreSQL doit être URL-safe car il entre dans la
construction de `DATABASE_URL`. Ne jamais committer `.env.compose`.

Le développement local HTTP utilise `NODE_ENV=development` et des cookies
`secure=false`. Un environnement de production derrière HTTPS doit utiliser les
paramètres de cookies sécurisés appropriés.

## Build

```powershell
docker compose --env-file .env.compose config --quiet
docker compose --env-file .env.compose build
```

Le build produit les images PostgreSQL, migration, backend, IA et frontend.

## Start

```powershell
docker compose --env-file .env.compose up -d --build
docker compose --env-file .env.compose ps -a
```

Un service `migrate` en `Exited (0)` est normal et obligatoire avant le
démarrage du backend.

## Stop

```powershell
docker compose --env-file .env.compose down
```

Cette commande retire les conteneurs et le réseau Compose. Elle conserve le
volume PostgreSQL externe et le volume nommé des CV.

## Restart

```powershell
docker compose --env-file .env.compose restart backend
docker compose --env-file .env.compose restart ai-service
docker compose --env-file .env.compose restart postgres
```

Après un redémarrage PostgreSQL, attendre son état `healthy` avant de conclure à
une panne applicative.

## Healthchecks

```powershell
docker compose --env-file .env.compose ps -a
curl.exe http://localhost:5000/health
curl.exe http://localhost:8000/health
curl.exe http://localhost:8088/health
```

Les healthchecks utilisent les runtimes déjà présents dans les images. Aucun
outil supplémentaire n'est installé uniquement pour ces contrôles.

## Database

Le port interne est toujours `postgres:5432`. Le port hôte par défaut est
`localhost:5433`, uniquement pour le développement et les outils locaux.

Structure de connexion interne, sans valeur secrète :

```text
postgresql://<user>:<password>@postgres:5432/<database>?schema=public
```

```powershell
docker compose --env-file .env.compose exec postgres `
  pg_isready -U postgres -d smartintern_ai
```

## Prisma migrations

Le target Docker `migrate` conserve Prisma CLI sans alourdir l'image runtime du
backend. Il attend PostgreSQL `healthy`, exécute uniquement
`prisma migrate deploy`, puis s'arrête.

```powershell
docker compose --env-file .env.compose logs migrate
docker compose --env-file .env.compose run --rm migrate
```

Ne jamais remplacer cette commande par `prisma migrate reset` ou `prisma db
push` dans la stack.

## Frontend

Le frontend est disponible sur `http://localhost:8088` par défaut. Nginx écoute
sur le port conteneur `8080`.

La SPA est compilée avec `VITE_API_BASE_URL=/`. Le navigateur utilise donc la
même origine et ne tente jamais de résoudre le hostname Docker `backend`.
Les refresh directs sur `/dashboard`, `/offers`, `/applications` et `/profile`
sont servis par le fallback `index.html`.

## Backend

Le backend est exposé sur `localhost:5000` pour le diagnostic local et écoute
sur `5000` dans le réseau Compose. Il utilise :

```text
DATABASE_URL=postgresql://...@postgres:5432/...
AI_SERVICE_URL=http://ai-service:8000
```

Le volume `smartintern-backend-uploads` monte `/app/uploads/cvs`, afin que les CV
ne disparaissent pas lors de la recréation du conteneur backend.

Les CV restent servis uniquement par les routes API protégées. Nginx ne publie
pas directement le dossier `/uploads` et retourne explicitement `404` pour ce
préfixe afin d'éviter le fallback SPA.

## AI Service

FastAPI écoute sur `0.0.0.0:8000`. Son healthcheck appelle uniquement `/health`
et ne lance aucun matching, RAG ou appel LLM lourd.

Le service IA actuel ne se connecte pas directement à PostgreSQL. Le backend
stocke les documents et embeddings RAG via Prisma ; aucune dépendance artificielle
`ai-service -> postgres` n'est donc ajoutée.

## pgvector

```powershell
docker compose --env-file .env.compose exec postgres `
  psql -U postgres -d smartintern_ai `
  -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"
```

L'extension est créée seulement lors de l'initialisation d'un volume neuf et
reste présente dans le volume persistant.

## Networking

Tous les services rejoignent le bridge Compose `smartintern-network`. Les noms
DNS internes sont `postgres`, `backend`, `ai-service` et `frontend`. Aucune IP de
conteneur n'est fixée.

## Persistence

- `smartintern-postgres-data` : volume externe PostgreSQL créé à l'étape 2 ;
- `smartintern-backend-uploads` : volume Compose pour `/app/uploads/cvs`.

Test sûr de persistance :

```powershell
docker compose --env-file .env.compose down
docker volume inspect smartintern-postgres-data
docker compose --env-file .env.compose up -d
```

Ne pas utiliser `docker compose down -v` comme commande normale.

## Logs

```powershell
docker compose --env-file .env.compose logs postgres
docker compose --env-file .env.compose logs migrate
docker compose --env-file .env.compose logs backend
docker compose --env-file .env.compose logs ai-service
docker compose --env-file .env.compose logs frontend
docker compose --env-file .env.compose logs -f
```

Les logs ne doivent contenir ni token, ni mot de passe, ni contenu de CV.

## Troubleshooting

**Port already allocated**

Modifier `POSTGRES_HOST_PORT`, `BACKEND_HOST_PORT`, `AI_SERVICE_HOST_PORT` ou
`FRONTEND_HOST_PORT` dans `.env.compose`. Le frontend utilise `8088` par défaut
car `8080` était déjà occupé sur la machine de validation.

**PostgreSQL unhealthy**

Vérifier `docker compose logs postgres`, `pg_isready`, la base et l'utilisateur.
Un volume existant conserve ses identifiants initiaux : modifier seulement les
variables Compose ne réinitialise pas le volume.

**Migrate exits 1**

Vérifier PostgreSQL, les migrations et la structure de `DATABASE_URL`. Le mot de
passe doit être URL-safe.

**Backend cannot resolve PostgreSQL or AI**

Utiliser exclusivement `postgres:5432` et `http://ai-service:8000` entre les
conteneurs, jamais `localhost` ni une IP Docker.

**Frontend cannot resolve backend / 502 Bad Gateway**

Vérifier le healthcheck backend et `proxy_pass http://backend:5000`. Le
navigateur appelle `/api`; seul Nginx résout le nom interne `backend`.

**401, 403 ou CSRF**

Vérifier l'origine frontend, les paramètres cookies, le header CSRF et le proxy
same-origin. Ne pas désactiver CSRF ou les credentials.

**AI unavailable**

Vérifier `/health`, `docker compose logs ai-service` et les timeouts backend. Le
reste de l'application doit continuer à répondre.

**Vector missing**

Vérifier l'image `smartintern-postgres`, les logs d'initialisation du volume et
`pg_extension`. Ne pas supprimer le volume pour masquer le diagnostic.

## Safe cleanup

```powershell
docker compose --env-file .env.compose down
```

Inspecter les volumes avant toute suppression manuelle :

```powershell
docker volume inspect smartintern-postgres-data
docker volume inspect smartintern-backend-uploads
```

La suppression d'un volume est destructive et ne fait pas partie du nettoyage
normal de cette étape.

## Testing AI service failure

```powershell
docker compose --env-file .env.compose stop ai-service
curl.exe http://localhost:5000/health
curl.exe http://localhost:8088/api/offers
curl.exe http://localhost:5000/health/ai
docker compose --env-file .env.compose start ai-service
curl.exe http://localhost:8000/health
```

Résultat validé : backend, frontend et offres restent en `200`; le diagnostic IA
retourne `504` pendant l'arrêt, puis `/health` IA revient en `200` après reprise.

## Validation results

- `docker compose config --quiet` : réussi ;
- build des cinq images : réussi ;
- PostgreSQL, backend, IA et frontend : `healthy` ;
- migration : huit migrations trouvées, aucune en attente, `Exited (0)` ;
- frontend, routes SPA et proxy `/api` : HTTP `200` ;
- contrôle navigateur : landing/login rendus sans erreur console et route
  `/dashboard` non authentifiée redirigée vers `/login` ;
- auth : register, login, cookie HttpOnly, CSRF, `/me`, logout validés ;
- IA : matching, Skill Gap, Career Assistant et Motivation Letter validés ;
- pgvector : extension `vector` présente ;
- restart PostgreSQL : reconnexion backend validée ;
- `down` puis `up -d --build` : données et extension conservées.

## Next Step Jenkins CI

L'étape suivante pourra exécuter lint, tests, builds d'images et validation
Compose dans Jenkins. Aucun fichier Jenkins, SonarQube, registry ou Kubernetes
n'est introduit ici.
