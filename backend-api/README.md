# Backend API - SmartIntern AI

Backend Express minimal pour SmartIntern AI.

## Installation

```bash
npm install
```

## Lancement en developpement

```bash
npm run dev
```

Par defaut, le serveur utilise le port `5000`. Il est possible de changer le port avec la variable d'environnement `PORT`.

## Lancement en production

```bash
npm start
```

## Tester la route de sante

Dans un navigateur :

```text
http://localhost:5000/health
```

Avec curl :

```bash
curl http://localhost:5000/health
```

Reponse attendue :

```json
{
  "status": "ok",
  "service": "backend-api",
  "message": "SmartIntern AI backend is running"
}
```

