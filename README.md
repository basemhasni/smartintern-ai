# SmartIntern AI

SmartIntern AI est une plateforme intelligente de gestion de stages basée sur l'IA. Elle aide les étudiants à trouver des offres adaptées à leur profil et aide les entreprises à identifier des candidats pertinents avec un matching explicable.

## Objectif

Le projet met en relation étudiants et entreprises avec : analyse CV, analyse d'offres, matching intelligent, recommandations, génération de lettre de motivation, assistant carrière, analyse qualité des offres, simulateur de gaps et IA explicable.

## Modules

| Module | Rôle |
| --- | --- |
| `backend-api` | API Express, auth, rôles, Prisma, PostgreSQL, proxy IA |
| `frontend-web` | Interface React / Vite pour étudiant, entreprise et admin |
| `ai-service` | FastAPI, matching, RAG, agents et services IA |
| `database` | Documentation base de données |
| `docs` | Documentation projet complète |
| `mobile-app` | Application étudiant React Native / Expo connectée aux API réelles |
| `devops` | Dossier prévu pour Docker, déploiement et CI/CD |

## Stack technique

Backend : Node.js, Express, Prisma, PostgreSQL, JWT en cookie HttpOnly, CSRF, Nodemailer, Multer.

Frontend : React, Vite, React Router, Axios, Tailwind CSS, composants IA réutilisables.

AI-service : Python, FastAPI, Pydantic, Matching V3, RAG V2, Orchestrator V2, services IA spécialisés.

Mobile : React Native, Expo, TypeScript, React Navigation et stockage du token Bearer avec Expo SecureStore.

## Fonctionnalités clés

- authentification sécurisée ;
- rôles `STUDENT`, `COMPANY`, `ADMIN` ;
- profils étudiant et entreprise ;
- offres de stage et candidatures ;
- upload CV ;
- matching IA ;
- explainability ;
- Career Signal Map ;
- Skill Evidence Map ;
- Decision Trace ;
- Skill Gap Simulator ;
- Offer Quality Analyzer ;
- Career Assistant V2 ;
- Motivation Letter V2 ;
- RAG V2 ;
- Orchestrator V2 ;
- AI Evaluation Suite.

## Quick start

Backend :

```bash
cd backend-api
npm install
npx prisma generate
npm run dev
```

Frontend :

```bash
cd frontend-web
npm install
npm run dev
```

AI-service :

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Mobile :

```bash
cd mobile-app
npm install
npm run web
```

Le mobile requiert Node.js `>=20.19.4`. La configuration locale de l'API est
documentée dans `mobile-app/.env.example`.

## Documentation

La documentation complète est disponible dans [docs/README.md](docs/README.md).

Pages importantes : [Vue d'ensemble](docs/00-overview.md), [Architecture technique](docs/02-technical-architecture.md), [Backend API](docs/03-backend-api.md), [Frontend Web](docs/04-frontend-web.md), [AI Service](docs/05-ai-service.md), [Architecture IA](docs/06-ai-architecture.md), [Sécurité](docs/07-auth-security.md), [Installation locale](docs/14-local-setup.md).

## Statut du projet

Le backend, le frontend web, le service IA et le parcours étudiant mobile sont
fonctionnels. La fonctionnalité de notifications mobiles est abandonnée et ne
fait pas partie du produit. Le dossier `devops` reste volontairement limité à sa
documentation préparatoire ; l'infrastructure sera traitée dans la phase suivante.

