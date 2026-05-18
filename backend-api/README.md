# Backend API - SmartIntern AI

Backend Express de SmartIntern AI avec Prisma ORM, PostgreSQL, JWT, roles, profils, offres et candidatures.

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

## Prisma

```bash
npx prisma generate
npx prisma migrate dev
npm run db:check
npx prisma studio
```

Les migrations presentes couvrent :

- utilisateurs, profils Student et Company ;
- offres de stage ;
- candidatures.

## Lancer le backend

```bash
npm run dev
```

## Route de sante

```http
GET /health
```

## Authentification

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

Payload register :

```json
{
  "firstName": "Hasni",
  "lastName": "Badis",
  "email": "hasni@example.com",
  "password": "password123",
  "role": "STUDENT"
}
```

Payload login :

```json
{
  "email": "hasni@example.com",
  "password": "password123"
}
```

Header pour les routes protegees :

```http
Authorization: Bearer <token>
```

## Routes de test protegees

```http
GET /api/test/student
GET /api/test/company
GET /api/test/admin
GET /api/test/all
```

Ces routes servent a verifier rapidement `protect` et `authorizeRoles`.

## Profil Student

Routes accessibles uniquement au role `STUDENT`.

```http
GET /api/students/profile
PUT /api/students/profile
```

Payload PUT :

```json
{
  "phone": "+216 12 345 678",
  "location": "Tunis",
  "educationLevel": "Licence Informatique",
  "targetJob": "Developpeur Fullstack",
  "bio": "Etudiant passionne par le developpement web et l'IA.",
  "availabilityDate": "2026-06-01"
}
```

## Profil Company

Routes accessibles uniquement au role `COMPANY`.

```http
GET /api/companies/profile
PUT /api/companies/profile
```

Payload PUT :

```json
{
  "companyName": "SmartTech",
  "sector": "Informatique",
  "description": "Entreprise specialisee dans le developpement web, mobile et IA.",
  "website": "https://smarttech.com",
  "address": "Tunis, Tunisie"
}
```

L'entreprise ne peut pas modifier directement `status`, `userId` ou `role`.

## Offres de stage

Routes entreprise, accessibles uniquement au role `COMPANY` :

```http
POST /api/companies/offers
GET /api/companies/offers
GET /api/companies/offers/:id
PUT /api/companies/offers/:id
DELETE /api/companies/offers/:id
```

Routes publiques :

```http
GET /api/offers
GET /api/offers/:id
```

Payload creation :

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

`DELETE /api/companies/offers/:id` archive l'offre avec `status = ARCHIVED`.

## Candidatures

Routes etudiant, accessibles uniquement au role `STUDENT` :

```http
POST /api/offers/:offerId/apply
GET /api/students/applications
```

Routes entreprise, accessibles uniquement au role `COMPANY` :

```http
GET /api/companies/offers/:offerId/applications
PUT /api/applications/:id/status
```

Payload pour postuler :

```json
{
  "message": "Je suis interesse par cette offre de stage."
}
```

Payload changement de statut :

```json
{
  "status": "ACCEPTED"
}
```

Statuts acceptes :

```text
SENT
PENDING
ACCEPTED
REJECTED
CANCELLED
```

Regles principales :

- un etudiant peut postuler uniquement aux offres `PUBLISHED` ;
- un etudiant ne peut pas postuler deux fois a la meme offre ;
- une entreprise consulte et modifie uniquement les candidatures de ses propres offres ;
- `passwordHash` n'est jamais retourne par les reponses API.

## Test avec Postman

1. Lancer PostgreSQL et le backend.
2. Creer un utilisateur `STUDENT` et un utilisateur `COMPANY`.
3. Utiliser les tokens JWT retournes par `/api/auth/login`.
4. Mettre a jour le profil Company si necessaire.
5. Creer une offre `PUBLISHED` avec le token `COMPANY`.
6. Postuler a l'offre avec le token `STUDENT`.
7. Consulter les candidatures de l'offre avec le token `COMPANY`.
8. Changer le statut de la candidature avec `PUT /api/applications/:id/status`.
