# Backend API - SmartIntern AI

Backend Express de SmartIntern AI avec Prisma ORM, PostgreSQL, JWT et module Company.

## Installation

```bash
npm install
```

## Configuration

Creer un fichier `.env` dans `backend-api/` a partir de `.env.example`.

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/smartintern_ai?schema=public"
JWT_SECRET="change_me_later"
```

Le fichier `.env` ne doit pas etre committe.

## Lancer le backend

```bash
npm run dev
```

## Route de sante

```bash
curl http://localhost:5000/health
```

## Endpoints Company

Toutes les routes Company sont protegees par JWT et accessibles uniquement au role `COMPANY`.

Base URL :

```text
http://localhost:5000/api/companies
```

Routes disponibles :

```http
GET /api/companies/profile
PUT /api/companies/profile
```

Header obligatoire :

```http
Authorization: Bearer <company_token>
```

### Consulter le profil Company

```bash
curl http://localhost:5000/api/companies/profile \
  -H "Authorization: Bearer <company_token>"
```

### Modifier le profil Company

Payload exemple :

```json
{
  "companyName": "SmartTech",
  "sector": "Informatique",
  "description": "Entreprise specialisee dans le developpement web, mobile et IA.",
  "website": "https://smarttech.com",
  "address": "Tunis, Tunisie"
}
```

Test avec curl :

```bash
curl -X PUT http://localhost:5000/api/companies/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <company_token>" \
  -d "{\"companyName\":\"SmartTech\",\"sector\":\"Informatique\",\"description\":\"Entreprise specialisee dans le developpement web, mobile et IA.\",\"website\":\"https://smarttech.com\",\"address\":\"Tunis, Tunisie\"}"
```

## Tester avec Postman

1. Se connecter avec un utilisateur `COMPANY` via le module Auth existant.
2. Copier le token JWT retourne par l'API.
3. Creer une requete `GET` vers `http://localhost:5000/api/companies/profile`.
4. Ajouter le header `Authorization` avec la valeur `Bearer <company_token>`.
5. Creer une requete `PUT` vers `http://localhost:5000/api/companies/profile`.
6. Ajouter les headers `Content-Type: application/json` et `Authorization: Bearer <company_token>`.
7. Envoyer le payload JSON d'exemple.

Un token `STUDENT` ou `ADMIN` doit recevoir une reponse `403`.

L'entreprise ne peut pas modifier directement `status`, `userId` ou `role`.

## Endpoints Internship Offers

Le module `InternshipOffer` ajoute des routes entreprise protegees et des routes publiques de consultation.

Une migration Prisma est necessaire car le schema ajoute :

- `OfferStatus`
- `InternshipOffer`
- la relation `Company.offers`

Commandes a executer apres cette modification :

```bash
npx prisma generate
npx prisma migrate dev --name add_internship_offers
```

### Routes COMPANY

Ces routes sont accessibles uniquement avec un token JWT de role `COMPANY`.

Base URL :

```text
http://localhost:5000/api/companies/offers
```

Routes disponibles :

```http
POST /api/companies/offers
GET /api/companies/offers
GET /api/companies/offers/:id
PUT /api/companies/offers/:id
DELETE /api/companies/offers/:id
```

Header obligatoire :

```http
Authorization: Bearer <company_token>
```

Payload de creation :

```json
{
  "title": "Stage Developpeur Fullstack React Node.js",
  "description": "Nous recherchons un stagiaire pour participer au developpement d'une plateforme web.",
  "location": "Paris",
  "duration": "6 mois",
  "startDate": "2026-06-01",
  "requiredSkills": ["React", "Node.js", "PostgreSQL"],
  "optionalSkills": ["Docker", "AWS"],
  "status": "PUBLISHED"
}
```

Test creation avec curl :

```bash
curl -X POST http://localhost:5000/api/companies/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <company_token>" \
  -d "{\"title\":\"Stage Developpeur Fullstack React Node.js\",\"description\":\"Nous recherchons un stagiaire pour participer au developpement d'une plateforme web.\",\"location\":\"Paris\",\"duration\":\"6 mois\",\"startDate\":\"2026-06-01\",\"requiredSkills\":[\"React\",\"Node.js\",\"PostgreSQL\"],\"optionalSkills\":[\"Docker\",\"AWS\"],\"status\":\"PUBLISHED\"}"
```

Payload de mise a jour :

```json
{
  "title": "Stage Developpeur Fullstack",
  "description": "Description mise a jour",
  "location": "Lyon",
  "duration": "4 a 6 mois",
  "startDate": "2026-07-01",
  "requiredSkills": ["React", "Node.js"],
  "optionalSkills": ["Docker"],
  "status": "PUBLISHED"
}
```

La suppression est un archivage logique : `DELETE /api/companies/offers/:id` passe l'offre en `ARCHIVED`.

Une entreprise ne peut modifier ou archiver que ses propres offres.

### Routes publiques

Ces routes retournent uniquement les offres publiees.

Base URL :

```text
http://localhost:5000/api/offers
```

Routes disponibles :

```http
GET /api/offers
GET /api/offers/:id
```

Elles incluent les informations publiques de l'entreprise :

```json
{
  "id": "company_id",
  "companyName": "SmartTech",
  "sector": "Informatique"
}
```

### Tester avec Postman

1. Se connecter avec un utilisateur `COMPANY`.
2. Copier le token JWT.
3. Creer une requete `POST` vers `http://localhost:5000/api/companies/offers`.
4. Ajouter les headers `Content-Type: application/json` et `Authorization: Bearer <company_token>`.
5. Envoyer le payload de creation.
6. Tester `GET /api/companies/offers` avec le meme token.
7. Tester `PUT /api/companies/offers/:id` pour modifier une offre de cette entreprise.
8. Tester `DELETE /api/companies/offers/:id` pour archiver une offre.
9. Tester `GET /api/offers` sans token pour consulter les offres publiees.

Un token `STUDENT` ou `ADMIN` doit recevoir une reponse `403` sur les routes `/api/companies/offers`.
