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
AI_SERVICE_URL="http://localhost:8000"
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

Route de matching, accessible uniquement au role `STUDENT` :

```http
GET /api/offers/:id/match
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

## Matching etudiant/offre

Prerequis :

- l'etudiant doit etre connecte avec un token `STUDENT` ;
- l'etudiant doit avoir uploade au moins un CV analyse ;
- l'offre doit exister avec `status = PUBLISHED` ;
- `ai-service` doit tourner sur l'URL configuree par `AI_SERVICE_URL`.

Exemple Postman :

```http
GET http://localhost:5000/api/offers/<offer_id>/match
Authorization: Bearer <student_token>
```

Reponse attendue :

```json
{
  "message": "Matching calculated successfully",
  "matching": {
    "score": 67,
    "matchedSkills": ["React", "Node.js"],
    "missingSkills": ["Docker"],
    "optionalMatchedSkills": [],
    "explanation": "Le candidat possede 2 competence(s) requise(s) sur 3."
  }
}
```

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

## Upload CV

Routes accessibles uniquement au role `STUDENT`.

```http
POST /api/students/cv/upload
GET /api/students/cv
GET /api/students/cv/:id
DELETE /api/students/cv/:id
```

Le fichier doit etre envoye en `multipart/form-data` avec le champ :

```text
cv
```

Formats acceptes :

```text
PDF  : application/pdf, extension .pdf
DOCX : application/vnd.openxmlformats-officedocument.wordprocessingml.document, extension .docx
```

Limite de taille :

```text
5 MB
```

Les fichiers sont stockes localement pour le MVP dans :

```text
backend-api/uploads/cvs
```

Les fichiers uploades sont servis via :

```text
/uploads/cvs/<fileName>
```

Le backend extrait le texte des fichiers PDF/DOCX pour envoyer le contenu a `ai-service`.

Reponse attendue :

```json
{
  "message": "CV uploaded successfully",
  "cv": {
    "id": "cv_id",
    "fileName": "timestamp-cv.pdf",
    "fileUrl": "/uploads/cvs/timestamp-cv.pdf",
    "fileType": "application/pdf",
    "fileSize": 123456,
    "parsedText": "Texte extrait du CV...",
    "analysisJson": {
      "skills": ["React", "Node.js"],
      "experienceLevel": "junior",
      "summary": "Profil oriente developpement web."
    },
    "uploadedAt": "2026-05-19T00:00:00.000Z"
  }
}
```

Pour obtenir `analysisJson`, lancer aussi le microservice IA avant le test :

```bash
cd ../ai-service
venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --port 8000
```

Si le service IA n'est pas disponible, l'upload du fichier reste valide et la reponse contient le message `CV uploaded successfully, but AI analysis failed`.

## Test avec Postman

1. Lancer PostgreSQL et le backend.
2. Creer un utilisateur `STUDENT` et un utilisateur `COMPANY`.
3. Utiliser les tokens JWT retournes par `/api/auth/login`.
4. Mettre a jour le profil Company si necessaire.
5. Creer une offre `PUBLISHED` avec le token `COMPANY`.
6. Postuler a l'offre avec le token `STUDENT`.
7. Consulter les candidatures de l'offre avec le token `COMPANY`.
8. Changer le statut de la candidature avec `PUT /api/applications/:id/status`.
9. Pour tester l'upload CV, creer une requete `POST` vers `http://localhost:5000/api/students/cv/upload`.
10. Ajouter `Authorization: Bearer <student_token>`.
11. Dans `Body`, choisir `form-data`, ajouter la cle `cv`, choisir le type `File`, puis selectionner un fichier `.pdf` ou `.docx` de 5 MB maximum.
12. Pour tester l'analyse IA automatique, verifier que `ai-service` tourne sur `http://localhost:8000` avant l'upload.
