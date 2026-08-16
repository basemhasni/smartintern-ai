# SmartIntern AI Docker Images

Cette étape construit trois images applicatives indépendantes. Elle ne crée ni
base PostgreSQL conteneurisée, ni Docker Compose, ni pipeline CI/CD.

## Architecture

| Image | Contenu runtime | Port conteneur | Utilisateur |
| --- | --- | --- | --- |
| `smartintern-frontend:latest` | Nginx et les fichiers statiques Vite | `8080` | `nginx` |
| `smartintern-backend:latest` | Node.js, Express et Prisma Client | `5000` | UID/GID `10001` |
| `smartintern-ai:latest` | Python, FastAPI et Uvicorn | `8000` | UID/GID `10001` |

`mobile-app` est volontairement hors de cette étape.

## Prérequis

- Docker Engine ou Docker Desktop avec des containers Linux ;
- accès au registre public pour télécharger les images de base ;
- PostgreSQL externe pour les fonctionnalités backend utilisant la base.

Les commandes ci-dessous sont exécutées depuis la racine du repository.

## Frontend image

Le frontend React/Vite est compilé dans un stage Node.js 20.19.4. L'image finale
contient uniquement Nginx 1.28 et `dist`. Le routage SPA utilise un fallback vers
`index.html`, ce qui permet de rafraîchir directement `/dashboard`, `/offers/...`
ou `/applications/...`.

```powershell
docker build -t smartintern-frontend:latest ./frontend-web
docker run --rm --name smartintern-frontend-test -p 8080:8080 smartintern-frontend:latest
```

Vérifications : `http://localhost:8080/` et
`http://localhost:8080/health`.

`VITE_API_BASE_URL` et `VITE_API_TIMEOUT_MS` sont des variables publiques
injectées au build. Une URL différente nécessite donc une nouvelle image :

```powershell
docker build --build-arg VITE_API_BASE_URL=http://localhost:5000 -t smartintern-frontend:latest ./frontend-web
```

Ne jamais transmettre un secret avec un build argument Vite.

## Backend image

Le backend est une application JavaScript Express sans compilation. Un stage
dédié génère Prisma Client. Un second stage installe uniquement les dépendances
de production, sans le CLI Prisma optionnel, puis reçoit le client généré. Le
schéma et les migrations Prisma restent dans l'image, mais aucune migration
n'est exécutée au build ou au démarrage.

```powershell
docker build -t smartintern-backend:latest ./backend-api
docker run --rm --name smartintern-backend-test -p 5000:5000 `
  -e DATABASE_URL="postgresql://USER:PASSWORD@host.docker.internal:5433/smartintern_ai?schema=public" `
  -e JWT_SECRET="FOURNIR_UN_SECRET_RUNTIME_D_AU_MOINS_32_CARACTERES" `
  -e FRONTEND_URL="http://localhost:8080" `
  -e CORS_ORIGIN="http://localhost:8080" `
  -e AI_SERVICE_URL="http://host.docker.internal:8000" `
  smartintern-backend:latest
```

Vérification : `http://localhost:5000/health`. Sur Docker Desktop,
`host.docker.internal` permet de joindre temporairement PostgreSQL ou l'IA sur
l'hôte. Ces adresses sont fournies uniquement au runtime et ne sont pas
hardcodées dans l'application.

Le dossier `/app/uploads/cvs` est accessible à l'utilisateur non-root. Un volume
persistant devra être défini dans une étape ultérieure avant tout déploiement.

Variables runtime principales : `PORT`, `DATABASE_URL`, `JWT_SECRET`,
`AI_SERVICE_URL`, `FRONTEND_URL`, `CORS_ORIGIN`, paramètres cookie/CSRF et SMTP.
Les valeurs réelles doivent venir de l'environnement ou d'un secret manager.

## AI image

Le service FastAPI utilise Python 3.11.9 slim et démarre Uvicorn sans `--reload`,
sur `0.0.0.0`. L'image installe le socle `requirements.txt`; les backends de
matching optionnels restent absents et les fallbacks déterministes existants
restent actifs.

```powershell
docker build -t smartintern-ai:latest ./ai-service
docker run --rm --name smartintern-ai-test -p 8000:8000 `
  -e ALLOWED_ORIGINS="http://localhost:5000,http://localhost:8080" `
  smartintern-ai:latest
```

Vérification : `http://localhost:8000/health`.

Les variables `SMARTINTERN_SENTENCE_MODEL`,
`SMARTINTERN_ALLOW_MODEL_DOWNLOAD` et `RAG_ALLOW_MODEL_DOWNLOAD` restent
configurables au runtime. Aucun modèle distant n'est téléchargé par défaut.

## Security

- chaque contexte exclut `.env`, caches, logs et dépendances locales ;
- les images finales n'embarquent aucune valeur de secret ;
- les trois processus runtime sont non-root ;
- les variables sensibles sont exclusivement injectées au runtime ;
- les health checks sont locaux et n'exécutent aucun workflow IA ou DB lourd ;
- aucun CV présent sur la machine hôte n'est copié dans l'image backend.

Inspection recommandée :

```powershell
docker image inspect smartintern-frontend:latest
docker image inspect smartintern-backend:latest
docker image inspect smartintern-ai:latest
docker history --no-trunc smartintern-frontend:latest
docker history --no-trunc smartintern-backend:latest
docker history --no-trunc smartintern-ai:latest
docker image ls smartintern-frontend:latest
docker image ls smartintern-backend:latest
docker image ls smartintern-ai:latest
```

## Validation de l'étape

Les trois images ont été construites, puis reconstruites avec `--pull`. Mesures
locales observées avec Docker Desktop :

| Image | Taille approximative | Résultat runtime |
| --- | ---: | --- |
| `smartintern-frontend:latest` | 149 MB | index, assets, health et fallback SPA : HTTP 200 |
| `smartintern-backend:latest` | 510 MB | `/health` et proxy health IA : HTTP 200 |
| `smartintern-ai:latest` | 315 MB | `/health` : HTTP 200, arrêt Uvicorn propre |

Le port hôte `8080` était déjà utilisé pendant la validation. Le test frontend a
donc été effectué avec `-p 8088:8080`, sans changer le port `8080` de l'image.
Le backend a été validé avec une configuration runtime de test ; les parcours
réellement dépendants de PostgreSQL seront validés après la conteneurisation de
la base à l'étape suivante.

L'inspection des configurations, historiques et systèmes de fichiers des images
n'a révélé aucun fichier `.env` ni valeur de secret intégrée. Le client Prisma
est présent dans l'image backend, tandis que le CLI Prisma et les dépendances de
développement en sont absents.

## Troubleshooting

- `npm ci` échoue : vérifier que `package-lock.json` est synchronisé avec
  `package.json` et que le registre npm est accessible.
- Le frontend s'affiche mais les API échouent : reconstruire avec la bonne
  valeur publique `VITE_API_BASE_URL` et vérifier CORS côté backend.
- Le backend refuse de démarrer : fournir au minimum `DATABASE_URL`, un
  `JWT_SECRET` fort, `FRONTEND_URL` et `CORS_ORIGIN` en production.
- Le backend ne rejoint pas PostgreSQL local : dans Docker Desktop, remplacer
  `localhost` par `host.docker.internal` dans la valeur runtime.
- L'IA démarre sans modèle sémantique : c'est le fallback prévu lorsque les
  dépendances optionnelles ou modèles locaux ne sont pas installés.

## Next step

La prochaine étape doit traiter PostgreSQL/pgvector, les volumes persistants,
l'initialisation non destructive et le health check de la base. Docker Compose,
registry, Jenkins et Kubernetes restent hors du présent périmètre.
