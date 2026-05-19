# SmartIntern AI Service

Microservice IA minimal pour SmartIntern AI, basé sur FastAPI.

Cette première version ne se connecte pas encore au backend Node.js et n'utilise pas de LLM, LangGraph, RAG, pgvector ou API externe.

## Installation

Créer un environnement virtuel :

```bash
python -m venv venv
```

Activer l'environnement virtuel sur Windows PowerShell :

```bash
venv\Scripts\Activate.ps1
```

Installer les dépendances :

```bash
pip install -r requirements.txt
```

## Configuration

Créer un fichier `.env` à partir de `.env.example` si nécessaire.

```env
APP_NAME="SmartIntern AI Service"
APP_ENV="development"
PORT=8000
```

## Lancement

```bash
uvicorn app.main:app --reload --port 8000
```

## Test health

```bash
curl http://localhost:8000/health
```

Réponse attendue :

```json
{
  "status": "ok",
  "service": "ai-service",
  "message": "SmartIntern AI service is running"
}
```

## Analyse CV

Endpoint :

```http
POST /ai/analyze-cv
```

Payload :

```json
{
  "text": "Je suis développeur React Node.js avec PostgreSQL."
}
```

## Analyse Offre

Endpoint :

```http
POST /ai/analyze-offer
```

Payload :

```json
{
  "title": "Stage développeur fullstack",
  "description": "Nous recherchons un stagiaire React Node.js PostgreSQL."
}
```

## Matching

Endpoint :

```http
POST /ai/match
```

Payload :

```json
{
  "candidateSkills": ["React", "Node.js", "PostgreSQL"],
  "requiredSkills": ["React", "Node.js", "Docker"],
  "optionalSkills": ["AWS"]
}
```

## Test avec Postman

1. Lancer le service avec `uvicorn app.main:app --reload --port 8000`.
2. Utiliser l'URL `http://localhost:8000`.
3. Ajouter le header `Content-Type: application/json` pour les routes POST.
4. Envoyer les payloads JSON ci-dessus.

