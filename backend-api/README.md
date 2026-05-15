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
  -p 5433:5432 \
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

## Endpoints d'authentification

Base URL :

```text
http://localhost:5000/api/auth
```

### Register

Endpoint :

```http
POST /api/auth/register
```

Payload exemple :

```json
{
  "firstName": "Hasni",
  "lastName": "Badis",
  "email": "hasni@example.com",
  "password": "password123",
  "role": "STUDENT"
}
```

Test avec curl :

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Hasni\",\"lastName\":\"Badis\",\"email\":\"hasni@example.com\",\"password\":\"password123\",\"role\":\"STUDENT\"}"
```

Roles acceptes :

```text
STUDENT
COMPANY
ADMIN
```

### Login

Endpoint :

```http
POST /api/auth/login
```

Payload exemple :

```json
{
  "email": "hasni@example.com",
  "password": "password123"
}
```

Test avec curl :

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"hasni@example.com\",\"password\":\"password123\"}"
```

### Me

Endpoint protege :

```http
GET /api/auth/me
```

Format du header Authorization :

```http
Authorization: Bearer <token>
```

Test avec curl :

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

Avec Postman :

- Choisir la methode HTTP.
- Ajouter `Content-Type: application/json` pour `register` et `login`.
- Pour `/me`, ajouter le header `Authorization` avec la valeur `Bearer <token>`.
