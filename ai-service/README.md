# AI Service - SmartIntern AI

`ai-service` est le service FastAPI qui porte la logique IA de SmartIntern AI.

## Stack

- Python ;
- FastAPI ;
- Uvicorn ;
- Pydantic ;
- LangGraph dÃ©clarÃ© dans les dÃ©pendances ;
- services IA internes.

## Installation

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

CrÃ©er `.env` :

```env
APP_NAME="SmartIntern AI Service"
APP_ENV="development"
PORT=8000
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5000"
```

## Lancement

```bash
python -m uvicorn app.main:app --reload --port 8000
```

## Endpoints principaux

- `GET /ai/health`
- `POST /ai/analyze-cv`
- `POST /ai/analyze-offer`
- `POST /ai/match`
- `POST /ai/career-advice`
- `POST /ai/generate-letter`
- `POST /ai/skill-gap-simulator`
- `POST /ai/analyze-offer-quality`
- `POST /ai/orchestrate/v2`
- `POST /ai/rag/*`

## FonctionnalitÃ©s IA

- Matching V3 ;
- Evidence Checker ;
- Career Signal Map ;
- Decision Trace ;
- Skill Gap Simulator ;
- Offer Quality Analyzer ;
- Career Assistant V2 ;
- Motivation Letter V2 ;
- RAG V2 ;
- Orchestrator V2 ;
- AI Evaluation Suite.

## Ã‰valuation

```bash
python -m compileall app
python scripts/evaluate_ai_suite.py
```

## Documentation dÃ©taillÃ©e

Voir [../docs/05-ai-service.md](../docs/05-ai-service.md), [../docs/06-ai-architecture.md](../docs/06-ai-architecture.md) et [../docs/12-rag-and-orchestration.md](../docs/12-rag-and-orchestration.md).
