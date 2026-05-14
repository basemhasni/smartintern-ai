# Backend API - SmartIntern AI

Backend Express minimal de SmartIntern AI avec Prisma ORM et PostgreSQL.

## Installation

```bash
npm install
```

## Configuration

Creer un fichier `.env` dans `backend-api/` a partir de `.env.example`.

Exemple :

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smartintern_ai?schema=public"
JWT_SECRET="change_me_later"
```

Le fichier `.env` ne doit pas etre committe.

## Lancer PostgreSQL avec Docker dans WSL

```bash
docker run --name smartintern-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=smartintern_ai \
  -p 5432:5432 \
  -d postgres:16
```

## Generer Prisma Client

```bash
npx prisma generate
```

Ou :

```bash
npm run prisma:generate
```

## Creer la migration initiale

```bash
npx prisma migrate dev --name init_users
```

Ou :

```bash
npm run prisma:migrate -- --name init_users
```

## Tester la connexion a la base de donnees

```bash
npm run db:check
```

## Ouvrir Prisma Studio

```bash
npx prisma studio
```

Ou :

```bash
npm run prisma:studio
```

## Lancer le backend

En developpement :

```bash
npm run dev
```

En mode standard :

```bash
npm start
```

## Tester la route de sante

Dans un navigateur :

```text
http://localhost:5000/health
```

Avec curl :

```bash
curl http://localhost:5000/health
```

