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

## Middleware de roles

Le middleware `authorizeRoles(...allowedRoles)` permet de limiter l'acces a une route selon le role contenu dans le token JWT.

Il doit etre utilise apres le middleware `protect`, car `protect` verifie le token et ajoute l'utilisateur decode dans `req.user`.

Exemple :

```js
router.get('/admin', protect, authorizeRoles('ADMIN'), controller);
```

Comportement :

- `401` si l'utilisateur n'est pas authentifie.
- `401` si le role de l'utilisateur est absent.
- `403` si le role n'est pas autorise.
- `next()` si le role est autorise.

## Routes temporaires de test protegees

Ces routes servent a verifier rapidement la securite pendant le developpement. Elles seront supprimees ou desactivees plus tard si necessaire.

Base URL :

```text
http://localhost:5000/api/test
```

Routes disponibles :

```http
GET /api/test/student
GET /api/test/company
GET /api/test/admin
GET /api/test/all
```

Roles autorises :

```text
/api/test/student : STUDENT
/api/test/company : COMPANY
/api/test/admin   : ADMIN
/api/test/all     : STUDENT, COMPANY, ADMIN
```

Format du header obligatoire :

```http
Authorization: Bearer <token>
```

### Tester avec Postman

1. Creer ou connecter un utilisateur avec `/api/auth/register` ou `/api/auth/login`.
2. Copier le `token` retourne par l'API.
3. Creer une requete `GET` vers une route de test, par exemple `http://localhost:5000/api/test/student`.
4. Dans l'onglet `Headers`, ajouter :

```text
Key: Authorization
Value: Bearer <token>
```

5. Verifier le resultat selon le role du token :

```json
{
  "message": "Student access granted"
}
```

Pour tester le refus d'acces, utiliser un token d'un autre role sur la route. Par exemple, un token `STUDENT` sur `/api/test/admin` doit retourner `403`.
