# Installation locale

## Prérequis

- Git ;
- Node.js ;
- npm ;
- Python ;
- PostgreSQL ;
- environnement Windows, Linux ou macOS.

## 1. Cloner le projet

```bash
git clone <repository-url>
cd smartintern-ai
```

## 2. Backend

```bash
cd backend-api
npm install
```

Créer `.env` à partir de `.env.example`.

Variables essentielles :

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/smartintern_ai?schema=public"
JWT_SECRET="replace_with_a_long_random_secret"
AI_SERVICE_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5173"
CORS_ORIGIN="http://localhost:5173"
```

Préparer Prisma :

```bash
npx prisma generate
npm run prisma:migrate
```

Démarrer :

```bash
npm run dev
```

## 3. Frontend

```bash
cd frontend-web
npm install
```

Créer `.env` :

```env
VITE_API_BASE_URL=http://localhost:5000
```

Démarrer :

```bash
npm run dev
```

Port Vite par défaut : `5173`.

## 4. AI-service

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Créer `.env` :

```env
APP_NAME="SmartIntern AI Service"
APP_ENV="development"
PORT=8000
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5000"
```

Démarrer :

```bash
python -m uvicorn app.main:app --reload --port 8000
```

## 5. Vérification rapide

Backend :

```bash
curl http://localhost:5000/health
```

AI-service :

```bash
curl http://localhost:8000/ai/health
```

Frontend :

ouvrir `http://localhost:5173`.

## 6. Application mobile Expo

Avec le backend lancé sur le port `5000` :

```bash
cd mobile-app
npm install
npm run web
```

Expo SDK 57 requiert Node.js `>=20.19.4`. L'API utilisée par défaut est
`http://localhost:5000/api` sur Expo Web et iOS Simulator, et
`http://10.0.2.2:5000/api` sur Android Emulator.

Pour un téléphone réel :

```bash
EXPO_PUBLIC_API_URL=http://IP_LOCALE_DU_PC:5000/api npm start
```

Après connexion avec un compte `STUDENT`, le dashboard charge le profil, le
dernier CV, les candidatures actives, les offres publiées et les recommandations.

