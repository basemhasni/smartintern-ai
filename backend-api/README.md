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

La migration `20260603150314_add_vector_documents` couvre deja le stockage RAG actuel. Aucune nouvelle migration n est necessaire pour RAG V2.

Le modele `VectorDocument` prepare l'indexation future des contenus utiles au RAG : CV, offres, conseils carriere et lettres de motivation. Pour ce MVP, l'embedding est stocke dans `embeddingJson` avec un vecteur JSON simple. La prochaine etape consistera a remplacer progressivement ce stockage par un vrai type `vector` pgvector.

## Indexation RAG automatique

Le backend cree ou met a jour automatiquement un `VectorDocument` pour preparer le futur RAG :

- apres un upload CV, le document `ownerType = CV` est indexe avec le texte extrait, le nom du fichier et les competences detectees ;
- apres une creation ou modification d'offre, le document `ownerType = OFFER` est indexe avec le titre, la description, les competences et les informations publiques de l'entreprise ;
- lors de l'archivage d'une offre, le document est reindexe avec le statut `ARCHIVED` dans les metadonnees.

L'indexation utilise `AI_SERVICE_URL` et l'endpoint MVP `POST /ai/rag/embed` de `ai-service`. Si `ai-service` est indisponible, l'upload du CV ou la creation de l'offre continue quand meme ; l'erreur est seulement journalisee cote serveur.

Endpoints de debug reserves au role `ADMIN` :

```http
GET /api/rag/documents
GET /api/rag/documents/:id
```

Exemple :

```http
GET http://localhost:5000/api/rag/documents?limit=50
Authorization: Bearer <admin_token>
```

La liste retourne volontairement des champs reduits : `id`, `ownerType`, `ownerId`, `title`, `metadataJson`, `createdAt` et `updatedAt`.

## Recherche RAG V1 (contrat historique)

Ce contrat reste disponible, mais son implementation utilise maintenant la recherche hybride RAG V2 documentee en fin de fichier.

Route protegee accessible aux roles `STUDENT`, `COMPANY` et `ADMIN` :

```http
POST /api/rag/search
```

Prerequis :

- `ai-service` doit etre lance sur l'URL configuree par `AI_SERVICE_URL` ;
- au moins un CV ou une offre doit deja etre indexe dans `VectorDocument` ;
- utiliser un token JWT valide.

Payload :

```json
{
  "query": "Je cherche une offre React Node.js adaptee a mon profil",
  "topK": 5,
  "ownerType": "OFFER"
}
```

Parametres :

- `query` : texte obligatoire de recherche ;
- `topK` : nombre maximum de resultats, defaut `5`, maximum `20` ;
- `ownerType` : optionnel, parmi `CV`, `OFFER`, `CAREER_ADVICE`, `MOTIVATION_LETTER`.

Reponse :

```json
{
  "message": "RAG search completed successfully",
  "query": "Je cherche une offre React Node.js adaptee a mon profil",
  "count": 1,
  "results": [
    {
      "id": "vector_document_id",
      "ownerType": "OFFER",
      "ownerId": "offer_id",
      "title": "Offre - Stage Developpeur Fullstack React Node.js",
      "score": 0.95,
      "metadata": {
        "offerId": "offer_id",
        "companyName": "SmartTech",
        "requiredSkills": ["React", "Node.js"]
      },
      "contentPreview": "Stage React Node.js PostgreSQL..."
    }
  ]
}
```

Si `ai-service` est arrete, la route retourne `503` avec le message `AI service is currently unavailable.`

## Assistant RAG V1 (contrat historique)

L'assistant RAG MVP repond a une question en deux etapes :

1. le backend retrouve les documents pertinents dans `VectorDocument` ;
2. `ai-service` genere une reponse deterministe a partir des documents fournis.

Il ne s'agit pas encore d'un chatbot conversationnel et aucun LLM externe n'est utilise.

Route protegee accessible aux roles `STUDENT`, `COMPANY` et `ADMIN` :

```http
POST /api/rag/ask
```

Prerequis :

- `ai-service` doit etre lance ;
- des documents doivent deja etre indexes dans `VectorDocument` ;
- l'utilisateur doit etre authentifie avec un token JWT valide.

Payload :

```json
{
  "question": "Pourquoi cette offre React Node.js est adaptee a mon profil ?",
  "topK": 5,
  "ownerType": "OFFER"
}
```

Parametres :

- `question` : question obligatoire ;
- `topK` : nombre maximum de documents consultes, defaut `5`, maximum `10` ;
- `ownerType` : optionnel, parmi `CV`, `OFFER`, `CAREER_ADVICE`, `MOTIVATION_LETTER`.

Reponse :

```json
{
  "message": "RAG answer generated successfully",
  "question": "Pourquoi cette offre React Node.js est adaptee a mon profil ?",
  "answer": "J'ai trouve plusieurs elements pertinents dans les documents indexes...",
  "sources": [
    {
      "id": "vector_document_id",
      "ownerType": "OFFER",
      "ownerId": "offer_id",
      "title": "Offre - Stage React",
      "score": 0.95
    }
  ]
}
```

Si aucun document pertinent n'est trouve, la reponse indique clairement que la base RAG actuelle ne contient pas assez d'elements.

## PostgreSQL avec pgvector

Pour une base PostgreSQL compatible pgvector, utiliser un conteneur dedie :

```bash
docker run --name smartintern-postgres-pgvector \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=smartintern_ai \
  -p 5433:5432 \
  -d pgvector/pgvector:pg16
```

Commande SQL future :

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Ne pas supprimer l'ancien conteneur automatiquement. Cette documentation prepare seulement la migration vers pgvector reel.

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

## Recommandations d'offres

Route accessible uniquement au role `STUDENT` :

```http
GET /api/students/recommendations
```

Prerequis :

- l'etudiant doit etre connecte avec un token `STUDENT` ;
- l'etudiant doit avoir uploade au moins un CV analyse ;
- des offres doivent exister avec `status = PUBLISHED` ;
- `ai-service` doit tourner sur l'URL configuree par `AI_SERVICE_URL`.

Parametres optionnels :

```http
GET /api/students/recommendations?limit=5&minScore=50
```

- `limit` : nombre maximum de recommandations, par defaut `10` ;
- `minScore` : score minimum a retourner, par defaut `0`.

Exemple Postman :

```http
GET http://localhost:5000/api/students/recommendations?limit=5&minScore=50
Authorization: Bearer <student_token>
```

Reponse attendue :

```json
{
  "message": "Recommendations generated successfully",
  "count": 1,
  "recommendations": [
    {
      "offer": {
        "id": "offer_id",
        "title": "Stage Developpeur Fullstack React Node.js",
        "location": "Paris",
        "duration": "6 mois",
        "company": {
          "id": "company_id",
          "companyName": "SmartTech",
          "sector": "Informatique"
        }
      },
      "matching": {
        "score": 87,
        "matchedSkills": ["React", "Node.js", "PostgreSQL"],
        "missingSkills": ["Docker"],
        "optionalMatchedSkills": ["AWS"],
        "explanation": "Le candidat possede 3 competence(s) requise(s) sur 4."
      }
    }
  ]
}
```

## Assistant Carriere

Route accessible uniquement au role `STUDENT` :

```http
POST /api/students/career-assistant
```

Prerequis :

- l'etudiant doit etre connecte avec un token `STUDENT` ;
- le dernier CV de l'etudiant doit etre analyse ;
- l'offre cible doit exister avec `status = PUBLISHED` ;
- `ai-service` doit tourner sur l'URL configuree par `AI_SERVICE_URL` ;
- des documents indexes dans `VectorDocument` permettent d'enrichir les conseils avec le contexte RAG, mais l'assistant continue sans contexte si la recherche RAG echoue.

Cette version genere des conseils par regles deterministes a partir du profil, du CV analyse, de l'offre, du matching et du contexte RAG disponible. Elle n'utilise pas de LLM externe ni OpenAI API.

Payload :

```json
{
  "offerId": "offer_id",
  "question": "Quelles competences dois-je ameliorer pour reussir cette offre ?"
}
```

`question` est optionnelle. Si elle est absente, le backend utilise une demande par defaut.

Exemple Postman :

```http
POST http://localhost:5000/api/students/career-assistant
Authorization: Bearer <student_token>
Content-Type: application/json
```

Reponse attendue :

```json
{
  "message": "Career advice generated successfully",
  "careerAdvice": {
    "profileSummary": "Votre profil correspond partiellement a l'offre Stage Developpeur Fullstack React Node.js.",
    "matchingScore": 67,
    "strengths": [
      "Vous possedez deja React.",
      "Vous possedez deja Node.js."
    ],
    "skillsToImprove": [
      {
        "skill": "Docker",
        "priority": "HIGH",
        "reason": "Cette competence est demandee dans l'offre mais absente de votre CV analyse.",
        "actions": [
          "Comprendre les images et conteneurs Docker.",
          "Dockeriser une petite API Node.js.",
          "Ajouter ce projet dans votre portfolio."
        ]
      }
    ],
    "actionPlan": [
      {
        "period": "Semaine 1",
        "objective": "Travailler Docker avec une realisation pratique."
      }
    ],
    "finalAdvice": "Vous avez deja une base pertinente pour cette offre. En ameliorant Docker, vous augmenterez votre adequation avec le poste.",
    "ragInsights": [
      "Le contexte RAG inclut Offre - Stage React (OFFER), qui mentionne React, Node.js, PostgreSQL."
    ]
  },
  "ragContext": {
    "used": true,
    "documentsCount": 1,
    "documents": [
      {
        "id": "vector_document_id",
        "ownerType": "OFFER",
        "title": "Offre - Stage React",
        "score": 0.95
      }
    ]
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
GET /api/companies/offers/:offerId/candidates/ranking
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

## Classement des candidats

Route accessible uniquement au role `COMPANY` :

```http
GET /api/companies/offers/:offerId/candidates/ranking
```

Prerequis :

- l'entreprise doit etre connectee avec un token `COMPANY` ;
- l'offre doit appartenir a l'entreprise connectee ;
- l'offre doit avoir des candidatures ;
- les candidats doivent idealement avoir un CV analyse ;
- `ai-service` doit tourner sur l'URL configuree par `AI_SERVICE_URL`.

Parametres optionnels :

```http
GET /api/companies/offers/<offer_id>/candidates/ranking?minScore=50&includeWithoutCV=false
```

- `minScore` : score minimum a retourner, par defaut `0` ;
- `includeWithoutCV` : inclure les candidats sans CV analyse, par defaut `true`.

Exemple Postman :

```http
GET http://localhost:5000/api/companies/offers/<offer_id>/candidates/ranking?minScore=50&includeWithoutCV=true
Authorization: Bearer <company_token>
```

Reponse attendue :

```json
{
  "message": "Candidates ranked successfully",
  "offer": {
    "id": "offer_id",
    "title": "Stage Developpeur Fullstack React Node.js"
  },
  "count": 1,
  "candidates": [
    {
      "rank": 1,
      "applicationId": "application_id",
      "applicationStatus": "SENT",
      "appliedAt": "2026-05-22T00:00:00.000Z",
      "student": {
        "id": "student_id",
        "firstName": "Hasni",
        "lastName": "Badis",
        "email": "student@example.com",
        "phone": "+216 12 345 678",
        "location": "Tunis",
        "educationLevel": "Licence Informatique",
        "targetJob": "Developpeur Fullstack"
      },
      "matching": {
        "score": 87,
        "matchedSkills": ["React", "Node.js", "PostgreSQL"],
        "missingSkills": ["Docker"],
        "optionalMatchedSkills": ["AWS"],
        "explanation": "Le candidat possede 3 competence(s) requise(s) sur 4."
      }
    }
  ]
}
```

## Lettres de motivation

Routes accessibles uniquement au role `STUDENT` :

```http
POST /api/applications/:applicationId/generate-letter
GET /api/applications/:applicationId/motivation-letter
PUT /api/applications/:applicationId/motivation-letter
```

Prerequis :

- l'etudiant doit etre connecte avec un token `STUDENT` ;
- la candidature doit exister et appartenir a l'etudiant connecte ;
- le dernier CV de l'etudiant doit etre analyse ;
- l'offre et l'entreprise associee doivent exister ;
- `ai-service` doit tourner sur l'URL configuree par `AI_SERVICE_URL`.

La generation MVP est deterministe et personnalisee a partir du profil, du CV, de l'offre, de l'entreprise et du matching disponible. Elle n'utilise pas encore de LLM externe, OpenAI API, LangGraph ou RAG.

Payload optionnel pour generer :

```json
{
  "tone": "PROFESSIONAL"
}
```

Tons acceptes :

```text
PROFESSIONAL
DYNAMIC
SIMPLE
```

Exemple Postman :

```http
POST http://localhost:5000/api/applications/<application_id>/generate-letter
Authorization: Bearer <student_token>
Content-Type: application/json
```

Modifier manuellement la lettre :

```http
PUT http://localhost:5000/api/applications/<application_id>/motivation-letter
Authorization: Bearer <student_token>
Content-Type: application/json
```

```json
{
  "content": "Texte modifie manuellement par l'etudiant."
}
```

Reponse attendue :

```json
{
  "message": "Motivation letter generated successfully",
  "motivationLetter": {
    "id": "letter_id",
    "applicationId": "application_id",
    "tone": "PROFESSIONAL",
    "content": "Madame, Monsieur, ...",
    "generatedByAI": true,
    "createdAt": "2026-05-22T00:00:00.000Z",
    "updatedAt": "2026-05-22T00:00:00.000Z"
  }
}
```

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
  },
  "ragIndexed": true
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
13. Pour verifier l'indexation RAG, se connecter avec un compte `ADMIN`.
14. Appeler `GET http://localhost:5000/api/rag/documents` avec `Authorization: Bearer <admin_token>`.
15. Verifier la presence d'un document `ownerType = CV` apres upload CV et d'un document `ownerType = OFFER` apres creation d'offre.
16. Pour tester la recherche RAG, utiliser un token `STUDENT`, `COMPANY` ou `ADMIN`.
17. Appeler `POST http://localhost:5000/api/rag/search` avec un body JSON contenant `query`, puis tester avec `ownerType` egal a `OFFER`, `CV`, puis sans `ownerType`.
18. Tester les erreurs attendues : `query` vide retourne `400`, `ownerType` invalide retourne `400`, et `ai-service` arrete retourne `503`.
19. Pour tester l'assistant RAG, appeler `POST http://localhost:5000/api/rag/ask` avec `question`, puis tester avec `ownerType` egal a `OFFER` et sans `ownerType`.
20. Tester les erreurs attendues : `question` vide retourne `400`, `ownerType` invalide retourne `400`, et `ai-service` arrete retourne `503`.

## Administration

Les routes admin sont montees sous :

```http
/api/admin
```

Toutes les routes admin utilisent :

- `protect`
- `authorizeRoles('ADMIN')`

### Securite inscription publique

`POST /api/auth/register` accepte uniquement :

- `STUDENT`
- `COMPANY`

Une tentative avec `ADMIN` retourne `400` :

```json
{
  "message": "Public registration is only available for STUDENT and COMPANY roles."
}
```

Un administrateur doit etre cree par seed, Prisma Studio ou procedure interne controlee. Aucune route publique ne cree de compte `ADMIN`.

### Dashboard admin

```http
GET /api/admin/dashboard
```

Retourne des statistiques calculees avec Prisma :

- `totalUsers`
- `totalStudents`
- `totalCompanies`
- `totalOffers`
- `publishedOffers`
- `totalApplications`
- `acceptedApplications`
- `pendingCompanies`
- `inactiveUsers`

Retourne aussi :

- `recentUsers`
- `recentCompanies`
- `recentOffers`

Aucun `passwordHash` n est expose.

### Utilisateurs admin

```http
GET /api/admin/users
```

Query params :

- `search`
- `role` : `STUDENT`, `COMPANY`, `ADMIN`
- `isActive` : `true`, `false`
- `page`
- `limit`, maximum `100`

Tri par defaut : `createdAt` decroissant.

```http
PATCH /api/admin/users/:userId/status
```

Payload :

```json
{
  "isActive": false
}
```

Regles :

- `isActive` doit etre booleen ;
- l utilisateur doit exister ;
- un administrateur ne peut pas desactiver son propre compte ;
- le role n est jamais modifie ;
- l utilisateur n est pas supprime.

### Entreprises admin

```http
GET /api/admin/companies
```

Query params :

- `search`
- `status` : `PENDING`, `VALIDATED`, `REJECTED`, `SUSPENDED`
- `page`
- `limit`, maximum `100`

```http
PATCH /api/admin/companies/:companyId/status
```

Payload :

```json
{
  "status": "VALIDATED"
}
```

Statuts acceptes :

- `PENDING`
- `VALIDATED`
- `REJECTED`
- `SUSPENDED`

La route modifie uniquement le statut de l entreprise et journalise l action sans donnee sensible.

### Tests admin Postman

1. Creer ou recuperer un compte `ADMIN` via Prisma Studio ou seed interne.
2. Se connecter via `POST /api/auth/login`.
3. Appeler `GET /api/admin/dashboard` avec le token admin.
4. Appeler `GET /api/admin/users?page=1&limit=20`.
5. Tester `role=STUDENT`, `role=COMPANY`, `isActive=true`, `isActive=false`.
6. Tester `PATCH /api/admin/users/:userId/status`.
7. Tester l auto-desactivation du compte admin connecte : elle doit retourner `400`.
8. Appeler `GET /api/admin/companies?status=PENDING`.
9. Tester `PATCH /api/admin/companies/:companyId/status` avec `VALIDATED`, `REJECTED`, `SUSPENDED`.
10. Tester un statut invalide : la route doit retourner `400`.
11. Tester sans token, avec token `STUDENT`, avec token `COMPANY`.
12. Tester `POST /api/auth/register` avec `role: "ADMIN"` : la route doit refuser.
## Career Assistant V2

`POST /api/students/career-assistant` recalcule un contexte Hybrid Matching V3 pour l'offre cible en utilisant `CV.parsedText`, `CV.analysisJson` et les competences structurees de l'offre. Le payload transmis a `POST /ai/career-advice` contient les champs historiques du matching ainsi que `confidence`, `decisionLabel` et l'objet `v3` complet.

Les champs historiques restent enregistres dans `MatchingResult`; les details V3 servent uniquement a la generation courante des conseils. Aucune migration Prisma n'est requise. Si le recalcul V3 echoue mais qu'un matching historique existe, le service utilise ce resultat avec une confiance faible et signale des donnees insuffisantes.
## Motivation Letter V2

`POST /api/applications/:applicationId/generate-letter` transmet maintenant au service IA le profil etudiant, `CV.analysisJson`, `CV.parsedText`, l offre structuree, le message de candidature, un Matching V3 recalcule et jusqu a trois documents RAG pertinents. Si le recalcul du matching echoue, le matching historique est utilise avec une confiance faible.

La lettre continue d etre sauvegardee dans `MotivationLetter.content` avec son ton. Les metadonnees `v2` sont renvoyees lors de la generation mais ne sont pas persistees. `GET` et `PUT /api/applications/:applicationId/motivation-letter` conservent leur contrat. Aucune migration Prisma n est necessaire.

## RAG V2

RAG V2 remplace en interne le pipeline MVP tout en conservant `POST /api/rag/search`, `POST /api/rag/ask` et les anciennes routes IA. L indexation appelle `POST /ai/rag/v2/index-document`, decoupe chaque document en chunks et enregistre un `VectorDocument` par chunk. Une reindexation remplace uniquement les chunks du proprietaire concerne; elle ne vide jamais toute la table.

Documents indexes automatiquement :

- CV apres upload, puis suppression de ses chunks lors de la suppression du CV ;
- offre apres creation, modification, fermeture ou archivage ;
- lettre de motivation apres generation ou modification ;
- sortie Career Assistant apres generation.

`npm run rag:reindex` reindexe les CV, offres et lettres existants. Les erreurs sont isolees par document. Les actions metier restent disponibles lorsque `ai-service` est indisponible.

### Recherche hybride et citations

La recherche combine 60 % de similarite vectorielle, 25 % de similarite lexicale, 10 % de correspondance metadata et 5 % de recence. Un reranking favorise les sections `skills`, `projects`, `experience` et `required_skills`. Au maximum deux chunks d un meme document sont conserves. Les reponses `/api/rag/ask` contiennent `citations`, `confidence`, `retrievedContextCount` et `warnings`; aucun embedding brut n est renvoye.

Payload de recherche :

```json
{
  "query": "Quelles offres correspondent a React et Node.js ?",
  "filters": { "ownerTypes": ["OFFER", "CV"], "offerId": "optional-id" },
  "topK": 5,
  "minScore": 0.08
}
```

### Scopes de securite

- `STUDENT` : ses CV, lettres et conseils, plus les offres publiees ;
- `COMPANY` : ses offres et les documents des candidatures recues sur ses offres ;
- `ADMIN` : acces de diagnostic global.

Les scopes sont appliques avant le calcul et le reranking. `GET /api/rag/documents`, `GET /api/rag/documents/:id` et les routes de reindexation restent `ADMIN` uniquement. Les routes `POST /api/rag/reindex` et `POST /api/rag/reindex/:ownerType/:ownerId` ne retournent jamais les embeddings.

### Stockage et pgvector

RAG V2 conserve `embeddingJson` pour rester compatible avec PostgreSQL et la migration existante. L environnement Docker ne declare pas actuellement une image pgvector ni une extension `vector` garantie; aucune migration risquee n a donc ete ajoutee. `embeddingBackend` et la dimension stable sont conserves dans les metadonnees pour preparer une migration future vers `Unsupported("vector")` et des requetes SQL vectorielles.

### Tests Postman RAG V2

1. Demarrer `ai-service` puis `backend-api`.
2. Executer `npm run rag:reindex` dans `backend-api`.
3. Tester `/api/rag/search` avec un token STUDENT, COMPANY puis ADMIN.
4. Verifier qu un etudiant ne voit pas le CV d un autre etudiant.
5. Verifier qu une entreprise ne voit pas un CV sans candidature sur une de ses offres.
6. Tester `/api/rag/ask` avec une question precise puis une question hors contexte.
7. Verifier les citations, les snippets courts et l absence de `embeddingJson`.
8. Tester les routes documents et reindex avec un role non ADMIN : elles doivent retourner `403`.

## Offer Quality Analyzer

```http
POST /api/ai/analyze-offer-quality
```

La route est protegee par JWT et accessible aux roles `COMPANY` et `ADMIN`.
Elle transmet l'offre a `POST /ai/analyze-offer-quality` et retourne le score,
les issues, les recommandations, le brouillon ameliore et la trace de decision.

Cette route est volontairement separee des routes de creation et modification
d'offres. Une analyse faible ne bloque donc pas `POST /api/companies/offers`
ni `PUT /api/companies/offers/:id`.

Exemple :

```json
{
  "title": "Stage informatique",
  "description": "Nous cherchons un stagiaire motive.",
  "requiredSkills": [],
  "optionalSkills": ["React", "Docker"]
}
```

Tests :

1. Demarrer `ai-service` puis `backend-api`.
2. Appeler la route avec un token `COMPANY` : `200` attendu.
3. Refaire avec un token `ADMIN` : `200` attendu.
4. Tester avec `STUDENT` : `403` attendu.
5. Tester sans token : `401` attendu.
6. Arreter `ai-service` : `503` attendu sans bloquer les routes normales d'offres.

## Frontend AI Proxies

Le frontend utilise uniquement le backend authentifie pour les nouvelles
fonctions IA :

```http
POST /api/ai/skill-gap-simulator
POST /api/ai/analyze-offer-quality
POST /api/ai/orchestrate
```

Autorisations :

- `skill-gap-simulator` : `STUDENT`, `ADMIN` ;
- `analyze-offer-quality` : `COMPANY`, `ADMIN` ;
- `orchestrate` : `STUDENT`, `COMPANY`, `ADMIN`.

Ces routes sont de simples proxies vers ai-service. Elles ne sauvegardent
aucune simulation et ne modifient aucune offre.
