# Frontend Web - SmartIntern AI

`frontend-web` est l'application React de SmartIntern AI. Elle fournit les espaces Ã©tudiant, entreprise et admin, ainsi que l'affichage des insights IA.

## Stack

- React 18 ;
- Vite ;
- React Router ;
- Axios ;
- Tailwind CSS ;
- lucide-react.

## Structure

```txt
src/
â”œâ”€â”€ api/
â”œâ”€â”€ auth/
â”œâ”€â”€ components/
â”‚   â””â”€â”€ ai/
â”œâ”€â”€ pages/
â”‚   â”œâ”€â”€ admin/
â”‚   â”œâ”€â”€ company/
â”‚   â””â”€â”€ student/
â”œâ”€â”€ routes/
â”œâ”€â”€ utils/
â”œâ”€â”€ App.jsx
â””â”€â”€ main.jsx
```

## Installation

```bash
npm install
```

CrÃ©er `.env` :

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Commandes

```bash
npm run dev
npm run build
```

## Pages principales

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/student/*`
- `/company/*`
- `/admin/*`

## Auth frontend

Le frontend utilise une session basÃ©e sur cookie HttpOnly cÃ´tÃ© backend. Le JWT n'est pas stockÃ© dans `localStorage`. Le client Axios utilise `withCredentials: true` et ajoute automatiquement le header CSRF sur les requÃªtes mutantes.

## Composants IA

Les composants IA sont dans `src/components/ai/` : score IA, confidence badge, score breakdown, Career Signal Map, Skill Evidence Map, Decision Trace, Missing Skills, Skill Gap Simulator et Offer Quality Analyzer.

## Documentation dÃ©taillÃ©e

Voir [../docs/04-frontend-web.md](../docs/04-frontend-web.md) et [../docs/11-ai-features.md](../docs/11-ai-features.md).
