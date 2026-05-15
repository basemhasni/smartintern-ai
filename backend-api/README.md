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
