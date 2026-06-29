# Tests et qualité

## Objectifs

La qualité du projet repose sur :

- build frontend ;
- démarrage backend ;
- compilation Python ;
- suite d'évaluation IA ;
- tests manuels des parcours critiques ;
- contrôle sécurité auth/CSRF.

## Frontend

```bash
cd frontend-web
npm run build
```

Le build Vite vérifie les imports, le bundling et la cohérence générale de l'interface.

## Backend

```bash
cd backend-api
npx prisma generate
npm run dev
```

Autres commandes utiles :

```bash
npm run db:check
npm run prisma:migrate
```

## AI-service

```bash
cd ai-service
python -m compileall app
python scripts/evaluate_ai_suite.py
```

Sous Windows/OneDrive, si `compileall` bloque sur `__pycache__`, utiliser :

```powershell
$env:PYTHONPYCACHEPREFIX=Join-Path $env:TEMP 'smartintern-ai-pycache-check'
python -m compileall app
```

## AI Evaluation Suite

La suite IA teste :

- Matching V3 ;
- Career Assistant V2 ;
- Motivation Letter V2 ;
- RAG V2 ;
- Orchestrator V2 ;
- Explainability ;
- Skill Gap Simulator ;
- Offer Quality Analyzer.

Commande :

```bash
cd ai-service
python scripts/evaluate_ai_suite.py
```

## Scripts IA disponibles

- `scripts/evaluate_matching_v3.py`
- `scripts/evaluate_career_assistant_v2.py`
- `scripts/evaluate_motivation_letter_v2.py`
- `scripts/evaluate_rag_v2.py`
- `scripts/evaluate_orchestrator_v2.py`
- `scripts/evaluate_explainability.py`
- `scripts/evaluate_skill_gap_simulator.py`
- `scripts/evaluate_offer_quality_analyzer.py`

## Checklist manuelle minimale

- register ;
- login ;
- refresh session ;
- logout ;
- forgot/reset password ;
- profil étudiant ;
- upload CV ;
- offres ;
- matching ;
- insights IA ;
- Skill Gap Simulator ;
- Career Assistant ;
- Motivation Letter ;
- profil entreprise ;
- création offre ;
- Offer Quality Analyzer ;
- candidatures reçues ;
- admin dashboard.

## Sécurité à vérifier

- cookie `smartintern_token` HttpOnly ;
- absence de JWT dans `localStorage` ;
- cookie `smartintern_csrf` ;
- POST sans CSRF refusé ;
- `/api/auth/me` fonctionne après refresh.

