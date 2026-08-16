# PostgreSQL + pgvector Docker

Cette étape fournit PostgreSQL et pgvector comme infrastructure indépendante.
Elle ne crée ni Docker Compose, ni pipeline CI/CD, ni seed automatique.

## Architecture

- Docker initialise PostgreSQL, la base, l'utilisateur runtime et l'extension
  `vector` sur un volume neuf.
- Prisma reste l'unique propriétaire du schéma métier et de ses migrations.
- Le backend utilise Prisma et stocke les documents RAG dans `VectorDocument`.
- L'AI service calcule les embeddings, mais ne se connecte pas directement à
  PostgreSQL.

Le backend local rejoint la base par `localhost:5433`. Un backend placé sur
`smartintern-network` utilise `smartintern-postgres:5432`. Aucune IP de
conteneur ne doit être utilisée.

## Image

L'image locale est `smartintern-postgres:latest`. Elle étend
`pgvector/pgvector:pg16` et fixe aussi le digest validé afin que le build reste
reproductible. Elle ajoute uniquement le script d'activation de pgvector.

## PostgreSQL Version

L'environnement existant utilisait PostgreSQL 16.14. Le tag majeur `pg16` a
donc été conservé. Le digest validé contient PostgreSQL 16.15 ; il s'agit d'une
mise à jour corrective au sein de la même version majeure.

## pgvector Version

La version disponible et activée dans l'image validée est pgvector 0.8.6.

## Build

Depuis la racine du repository :

```powershell
docker build --pull -t smartintern-postgres:latest ./devops/postgres
docker image ls smartintern-postgres:latest
```

Le build final a réussi et l'image locale mesure environ 621 MB.

## Environment Variables

Les valeurs sont fournies au runtime :

- `POSTGRES_DB=smartintern_ai` ;
- `POSTGRES_USER=postgres` ;
- `POSTGRES_PASSWORD`, secret local non commité ;
- `POSTGRES_PORT=5433`, convention pour le port hôte.

Le fichier `devops/postgres/.env.example` contient uniquement des exemples. Il
ne faut pas créer de mode `POSTGRES_HOST_AUTH_METHOD=trust`.

## Named Volume

```powershell
docker volume create smartintern-postgres-data
docker volume inspect smartintern-postgres-data
```

Le volume est monté sur `/var/lib/postgresql/data`, chemin `PGDATA` attendu par
l'image PostgreSQL 16. Les données ne sont jamais stockées dans un dossier Git.

## Docker Network

```powershell
docker network create smartintern-network
docker network inspect smartintern-network
```

Les services communiquent par nom de conteneur ou alias réseau, jamais par IP.

## Start Database

Définir d'abord un secret local dans la session PowerShell :

```powershell
$env:POSTGRES_PASSWORD = "<local-only-password>"

docker run -d `
  --name smartintern-postgres `
  --network smartintern-network `
  -e POSTGRES_DB=smartintern_ai `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD `
  -p 5433:5432 `
  --mount source=smartintern-postgres-data,target=/var/lib/postgresql/data `
  --health-cmd="pg_isready -U postgres -d smartintern_ai" `
  --health-interval=5s `
  --health-timeout=3s `
  --health-retries=10 `
  smartintern-postgres:latest
```

Sur la machine de validation, un ancien conteneur arrêté utilisait déjà le nom
`smartintern-postgres`. Il a été conservé avec son volume. Le nouveau conteneur
a donc été nommé `smartintern-postgres-step2` avec
`--network-alias smartintern-postgres`. Supprimer ou renommer un ancien
conteneur seulement après avoir vérifié que ses données ne sont plus utiles.

Le port Windows `5432` est occupé par PostgreSQL 16 local et `5434` par un autre
conteneur pgvector. Le port `5433` a été retenu sans modifier ces services.

## Healthcheck

```powershell
docker exec smartintern-postgres pg_isready -U postgres -d smartintern_ai
```

Le résultat attendu est `accepting connections`. Le même `pg_isready` sera
repris dans Docker Compose à l'étape suivante.

## Verify PostgreSQL

```powershell
docker exec smartintern-postgres psql -U postgres -d smartintern_ai -c "SELECT version();"
docker exec smartintern-postgres psql -U postgres -d smartintern_ai -c "SELECT current_database(), current_user;"
```

La validation a retourné PostgreSQL 16.15, la base `smartintern_ai` et
l'utilisateur `postgres`.

## Verify pgvector

```powershell
docker exec smartintern-postgres psql -U postgres -d smartintern_ai -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"
docker exec smartintern-postgres psql -U postgres -d smartintern_ai -c "SELECT 'vector'::regtype;"
```

Un test transactionnel avec une table temporaire `vector(3)` et l'opérateur
`<->` a réussi, puis a été annulé avec `ROLLBACK`.

Le projet ne possède actuellement aucune colonne SQL `vector`, aucun index HNSW
ou IVFFlat et aucune dimension SQL imposée. `VectorDocument.embeddingJson` est
une colonne JSONB. Le fallback RAG validé produit des embeddings de dimension
384 et la similarité est calculée dans le backend Node.js.

## Prisma Migrations

Depuis `backend-api` avec une `DATABASE_URL` temporaire pointant vers
`localhost:5433` :

```powershell
npx prisma generate
npx prisma migrate status
npx prisma migrate deploy
npx prisma migrate status
```

La base neuve présentait huit migrations en attente. `migrate deploy` les a
toutes appliquées, puis `migrate status` a confirmé que le schéma était à jour.
Aucun `migrate reset`, `db push` ou seed n'a été exécuté.

## Backend Local to Docker DB

Structure de connexion depuis Windows :

```text
postgresql://postgres:<PASSWORD>@localhost:5433/smartintern_ai?schema=public
```

`npm run db:check`, `/health` et `GET /api/offers` ont réussi. Le test des offres
a effectué une vraie lecture Prisma sur la base neuve.

## Backend Docker to Docker DB

Structure de connexion sur `smartintern-network` :

```text
postgresql://postgres:<PASSWORD>@smartintern-postgres:5432/smartintern_ai?schema=public
```

L'image `smartintern-backend:latest` a démarré healthy et `GET /api/offers` a
retourné HTTP 200. Le hostname `localhost` ne doit pas être utilisé entre
conteneurs.

## AI Service to pgvector

L'AI service n'importe aucun driver PostgreSQL et ne possède aucune variable de
connexion DB. Il produit les embeddings via HTTP ; le backend les persiste avec
Prisma. Son health et `/ai/rag/embed` ont été validés sur
`smartintern-network` : dimension 384, backend déterministe `hashing-v2`.

Il n'existe donc pas de test SQL direct AI vers pgvector à cette étape. Ajouter
une seconde connexion DB côté Python dupliquerait la responsabilité actuelle.

## Persistence Test

La persistance a été vérifiée avec un marqueur placé dans un schéma isolé :

1. création du marqueur et application des huit migrations ;
2. `docker stop` puis `docker start` ;
3. vérification du marqueur, des migrations et de pgvector ;
4. suppression du seul conteneur, sans option `-v` ;
5. recréation avec `smartintern-postgres-data` ;
6. nouvelle vérification réussie ;
7. suppression du schéma de validation.

Le volume, les tables Prisma et l'extension pgvector sont restés présents.
Les scripts de `/docker-entrypoint-initdb.d` ne sont exécutés que lorsque le
volume est neuf. Sur un volume existant, vérifier explicitement l'extension au
lieu de supprimer les données.

## Backup

Exemple de sauvegarde manuelle, à stocker hors Git et à protéger comme une donnée
sensible :

```powershell
docker exec smartintern-postgres pg_dump -U postgres -d smartintern_ai -Fc > backup/smartintern_ai.dump
```

La restauration doit cibler une base contrôlée avec `pg_restore`. Elle n'a pas
été exécutée pendant cette validation afin de ne pas écraser de données.

## Troubleshooting

- `port is already allocated` : choisir un autre port hôte ; le port interne
  reste `5432`.
- `password authentication failed` : aligner `POSTGRES_USER`, le secret runtime
  et `DATABASE_URL`.
- `database does not exist` : vérifier `POSTGRES_DB=smartintern_ai`.
- `extension vector does not exist` : vérifier l'image et exécuter
  `CREATE EXTENSION IF NOT EXISTS vector` sur la base concernée.
- `relation does not exist` : exécuter et vérifier les migrations Prisma.
- connexion refusée depuis un conteneur : utiliser
  `smartintern-postgres:5432`, pas `localhost`.
- script init non rejoué : le volume est déjà initialisé ; ne pas le supprimer
  uniquement pour rejouer un script.
- nom de conteneur déjà utilisé : inspecter l'ancien conteneur et son volume
  avant toute suppression.

## Safe Cleanup

```powershell
docker stop smartintern-postgres
docker start smartintern-postgres
docker stop smartintern-postgres
docker rm smartintern-postgres
```

`docker rm` supprime le conteneur, pas le named volume. Ne pas utiliser
`docker rm -v` ni `docker volume rm smartintern-postgres-data` comme nettoyage
normal : ces commandes peuvent détruire les données persistantes.

## Next Step - Docker Compose

L'étape suivante réunira PostgreSQL, backend, frontend et AI service dans Docker
Compose avec dépendances, healthchecks, volumes et variables runtime. Aucun
fichier Compose, Jenkins, Kubernetes ou CI/CD n'est créé dans cette étape.
