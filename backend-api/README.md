# Backend API - SmartIntern AI

Backend Express de SmartIntern AI avec Prisma ORM, PostgreSQL, JWT et module Applications.

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

## Endpoints Applications

Le module Applications permet aux etudiants de postuler aux offres publiees et aux entreprises de consulter et traiter les candidatures recues.

Une migration Prisma est necessaire car le schema ajoute :

- `ApplicationStatus`
- `Application`
- les relations `Student.applications` et `InternshipOffer.applications`
- la contrainte unique `studentId + offerId`

Commandes a executer apres cette modification :

```bash
npx prisma generate
npx prisma migrate dev --name add_applications
```

### Routes STUDENT

Ces routes sont accessibles uniquement avec un token JWT de role `STUDENT`.

```http
POST /api/offers/:offerId/apply
GET /api/students/applications
```

Header obligatoire :

```http
Authorization: Bearer <student_token>
```

Payload pour postuler :

```json
{
  "message": "Je suis interesse par cette offre de stage."
}
```

Exemple curl :

```bash
curl -X POST http://localhost:5000/api/offers/<offerId>/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <student_token>" \
  -d "{\"message\":\"Je suis interesse par cette offre de stage.\"}"
```

Regles principales :

- L'offre doit exister.
- L'offre doit etre `PUBLISHED`.
- Un etudiant ne peut pas postuler deux fois a la meme offre.

### Routes COMPANY

Ces routes sont accessibles uniquement avec un token JWT de role `COMPANY`.

```http
GET /api/companies/offers/:offerId/applications
PUT /api/applications/:id/status
```

Header obligatoire :

```http
Authorization: Bearer <company_token>
```

Payload pour changer le statut :

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

Exemple curl :

```bash
curl -X PUT http://localhost:5000/api/applications/<applicationId>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <company_token>" \
  -d "{\"status\":\"ACCEPTED\"}"
```

Une entreprise peut consulter et modifier uniquement les candidatures liees a ses propres offres.

## Tester avec Postman

1. Creer ou connecter un utilisateur `STUDENT`.
2. Creer ou connecter un utilisateur `COMPANY`.
3. Creer une offre `PUBLISHED` avec le token `COMPANY`.
4. Avec le token `STUDENT`, appeler `POST /api/offers/:offerId/apply`.
5. Avec le token `STUDENT`, appeler `GET /api/students/applications`.
6. Avec le token `COMPANY`, appeler `GET /api/companies/offers/:offerId/applications`.
7. Avec le token `COMPANY`, appeler `PUT /api/applications/:id/status`.

Un token `STUDENT` doit recevoir `403` sur les routes entreprise. Un token `COMPANY` doit recevoir `403` sur les routes etudiant.
