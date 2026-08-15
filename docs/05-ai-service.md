# AI Service

## Rôle

`ai-service` regroupe les traitements IA de SmartIntern AI. Il est exposé via FastAPI et appelé principalement par `backend-api`.

## Stack

- Python ;
- FastAPI ;
- Uvicorn ;
- Pydantic ;
- LangGraph déclaré dans les dépendances ;
- services internes déterministes pour matching, génération et évaluation.

## Structure

```txt
ai-service/
├── app/
│   ├── agents/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── orchestration/
│   ├── rag/
│   ├── services/
│   └── workflows/
├── evaluation/
├── scripts/
└── requirements.txt
```

## Endpoints principaux

| Endpoint | Description |
| --- | --- |
| `GET /health` | santé du service, sans lancer de workflow IA |
| `POST /ai/analyze-cv` | analyse CV |
| `POST /ai/analyze-offer` | analyse offre |
| `POST /ai/match` | Matching V3 |
| `POST /ai/career-advice` | Career Assistant V2 |
| `POST /ai/generate-letter` | Motivation Letter V2 |
| `POST /ai/skill-gap-simulator` | simulation de gaps |
| `POST /ai/analyze-offer-quality` | analyse qualité offre |
| `POST /ai/orchestrate/v2` | orchestration IA |
| `POST /ai/rag/*` | RAG et endpoints compatibles |

## Services IA

Les services principaux se trouvent dans `app/services/` :

- `hybrid_matching_engine_v3.py` ;
- `evidence_checker_service.py` ;
- `career_signal_map_service.py` ;
- `decision_trace_service.py` ;
- `skill_gap_simulator_service.py` ;
- `offer_quality_analyzer_service.py` ;
- `career_assistant_v2_service.py` ;
- `motivation_letter_v2_service.py` ;
- `rag_service.py`.

## Lancement

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

## Évaluation

```bash
python -m compileall app
python scripts/evaluate_ai_suite.py
```

Scripts disponibles :

- `evaluate_matching_v3.py` ;
- `evaluate_career_assistant_v2.py` ;
- `evaluate_motivation_letter_v2.py` ;
- `evaluate_rag_v2.py` ;
- `evaluate_orchestrator_v2.py` ;
- `evaluate_explainability.py` ;
- `evaluate_skill_gap_simulator.py` ;
- `evaluate_offer_quality_analyzer.py`.

## Limites

Les scores IA restent des estimations. Ils dépendent fortement de la qualité du CV, de la précision de l'offre et des données transmises par le backend.

