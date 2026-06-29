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

