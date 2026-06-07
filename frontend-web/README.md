# SmartIntern AI Frontend

Frontend React/Vite de SmartIntern AI.

Cette premiere etape contient une landing page statique basee sur les captures Google Stitch placees dans :

```text
frontend-web/design-references/stitch/
```

## Installation

```bash
cd frontend-web
npm install
```

## Lancement

```bash
npm run dev
```

URL frontend :

```text
http://localhost:5173
```

URL backend prevue :

```text
http://localhost:5000
```

## Structure

```text
src/
├── components/
│   └── landing/
├── pages/
├── routes/
├── App.jsx
├── main.jsx
└── index.css
```

## Pages

```text
/          Landing page
/login     Placeholder
/register  Placeholder
```

Les pages Login/Register ne sont pas encore connectees au backend. La prochaine etape logique sera de connecter l'authentification avec `backend-api`.
