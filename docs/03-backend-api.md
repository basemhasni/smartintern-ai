# Backend API

## Rôle

`backend-api` est le point d'entrée métier de SmartIntern AI. Il gère l'authentification, les rôles, les profils, les offres, les candidatures, les CV, l'administration et les appels vers `ai-service`.

## Stack

- Node.js ;
- Express 5 ;
- Prisma ;
- PostgreSQL ;
- JWT ;
- cookies HttpOnly ;
- protection CSRF ;
- Nodemailer pour le reset password ;
- Multer pour l'upload CV.

## Structure

```txt
backend-api/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   └── utils/
└── package.json
```

## Middlewares importants

- `helmet()` : headers de sécurité ;
- `cors()` avec `credentials: true` et origines contrôlées ;
- `express.json()` avec limite configurable ;
- `csrfProtection` : refuse les requêtes mutantes sans token CSRF ;
- `protect` : vérifie le JWT depuis cookie HttpOnly ou Bearer fallback ;
- `authorizeRoles` : contrôle des rôles.

## Routes principales

| Groupe | Préfixe | Rôle |
| --- | --- | --- |
| Health | `/health` | vérification serveur |
| Auth | `/api/auth` | register, login, logout, me, reset password, CSRF |
| Admin | `/api/admin` | supervision admin |
| AI proxy | `/api/ai` | skill gap, offer quality, orchestration |
| RAG | `/api/rag` | recherche, questions, reindex admin |
| CV | `/api/students/cv` | upload et gestion CV étudiant |
| Étudiant | `/api/students` | profil, recommandations, career assistant |
| Entreprise | `/api/companies` | profil entreprise |
| Offres entreprise | `/api/companies/offers` | CRUD offres entreprise |
| Offres publiques | `/api/offers` | consultation, matching, candidature |
| Applications | `/api/applications` | lettre de motivation, statut |

## Variables d'environnement

Voir `backend-api/.env.example`.

Variables principales :

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `AI_SERVICE_URL`
- `FRONTEND_URL`
- `CORS_ORIGIN`
- `AUTH_COOKIE_NAME`
- `AUTH_COOKIE_MAX_AGE_MS`
- `CSRF_COOKIE_NAME`
- `CSRF_HEADER_NAME`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## Commandes

```bash
cd backend-api
npm install
npx prisma generate
npm run dev
```

Autres commandes :

```bash
npm run db:check
npm run prisma:migrate
npm run rag:reindex
```

## Sécurité

Le backend ne retourne pas `passwordHash` dans les réponses usuelles. Le reset password stocke un hash de token avec expiration. Les cookies d'auth sont HttpOnly. Les requêtes mutantes doivent envoyer `X-CSRF-Token`.

## Proxy IA

Les routes `/api/ai/*` appellent le service FastAPI configuré via `AI_SERVICE_URL`. Elles permettent au frontend d'utiliser les services IA sans appeler directement `ai-service`.

