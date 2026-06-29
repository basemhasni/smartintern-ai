# Backend API - SmartIntern AI

`backend-api` est l'API mÃ©tier de SmartIntern AI. Elle gÃ¨re l'authentification, les rÃ´les, la base PostgreSQL, les profils, les offres, les candidatures, les CV et les appels vers `ai-service`.

## Stack

- Node.js ;
- Express ;
- Prisma ;
- PostgreSQL ;
- JWT HttpOnly Cookie ;
- CSRF ;
- Nodemailer ;
- Multer.

## Structure

```txt
src/
â”œâ”€â”€ app.js
â”œâ”€â”€ server.js
â”œâ”€â”€ config/
â”œâ”€â”€ controllers/
â”œâ”€â”€ middlewares/
â”œâ”€â”€ routes/
â”œâ”€â”€ services/
â””â”€â”€ utils/
```

## Installation

```bash
npm install
```

CrÃ©er `.env` depuis `.env.example`.

Variables principales : `PORT`, `DATABASE_URL`, `JWT_SECRET`, `AI_SERVICE_URL`, `FRONTEND_URL`, `CORS_ORIGIN`, `AUTH_COOKIE_NAME`, `CSRF_COOKIE_NAME`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.

## Prisma

```bash
npx prisma generate
npm run prisma:migrate
```

## Lancement

```bash
npm run dev
```

## Commandes utiles

```bash
npm run start
npm run db:check
npm run rag:reindex
```

## Routes principales

- `/api/auth`
- `/api/students`
- `/api/students/cv`
- `/api/companies`
- `/api/companies/offers`
- `/api/offers`
- `/api/applications`
- `/api/ai`
- `/api/rag`
- `/api/admin`

## SÃ©curitÃ©

- JWT en cookie HttpOnly ;
- CSRF sur requÃªtes mutantes ;
- CORS avec credentials ;
- rate limiting sur auth ;
- hash bcrypt des mots de passe ;
- reset password avec token hashÃ© et expirÃ© ;
- contrÃ´le de rÃ´les.

## Documentation dÃ©taillÃ©e

Voir [../docs/03-backend-api.md](../docs/03-backend-api.md), [../docs/07-auth-security.md](../docs/07-auth-security.md) et [../docs/09-api-endpoints.md](../docs/09-api-endpoints.md).
