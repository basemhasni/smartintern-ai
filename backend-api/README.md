# Backend API - SmartIntern AI

Backend Express de SmartIntern AI avec Prisma ORM, PostgreSQL, JWT et module Student.

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

## Endpoints Student

Toutes les routes Student sont protegees par JWT et accessibles uniquement au role `STUDENT`.

Base URL :

```text
http://localhost:5000/api/students
```

Routes disponibles :

```http
GET /api/students/profile
PUT /api/students/profile
```

Header obligatoire :

```http
Authorization: Bearer <student_token>
```

### Consulter le profil Student

```bash
curl http://localhost:5000/api/students/profile \
  -H "Authorization: Bearer <student_token>"
```

### Modifier le profil Student

Payload exemple :

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

Test avec curl :

```bash
curl -X PUT http://localhost:5000/api/students/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <student_token>" \
  -d "{\"phone\":\"+216 12 345 678\",\"location\":\"Tunis\",\"educationLevel\":\"Licence Informatique\",\"targetJob\":\"Developpeur Fullstack\",\"bio\":\"Etudiant passionne par le developpement web et l'IA.\",\"availabilityDate\":\"2026-06-01\"}"
```

## Tester avec Postman

1. Se connecter avec un utilisateur `STUDENT` via le module Auth existant.
2. Copier le token JWT retourne par l'API.
3. Creer une requete `GET` vers `http://localhost:5000/api/students/profile`.
4. Ajouter le header `Authorization` avec la valeur `Bearer <student_token>`.
5. Creer une requete `PUT` vers `http://localhost:5000/api/students/profile`.
6. Ajouter les headers `Content-Type: application/json` et `Authorization: Bearer <student_token>`.
7. Envoyer le payload JSON d'exemple.

Un token `COMPANY` ou `ADMIN` doit recevoir une reponse `403`.
