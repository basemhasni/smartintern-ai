# SmartIntern AI Service

Microservice IA minimal pour SmartIntern AI, basé sur FastAPI.

Cette première version ne se connecte pas encore au backend Node.js et n'utilise pas de LLM, LangGraph, RAG, pgvector ou API externe.

## Architecture agents IA

Le microservice suit maintenant le flux interne :

```text
Route FastAPI -> Service -> Agent specialise
```

Agents disponibles :

- `CVAnalysisAgent` : analyse les textes de CV et extrait les competences.
- `OfferAnalysisAgent` : analyse les offres et detecte le domaine.
- `MatchingAgent` : calcule le score entre candidat et offre.
- `MotivationLetterAgent` : genere une lettre personnalisee deterministe.
- `CareerAssistantAgent` : genere des conseils de progression pour une offre cible.
- `AgentOrchestrator` : selectionne l'agent specialise selon une intention.

Cette etape ne contient pas encore LangGraph, RAG ou LLM externe. Elle prepare seulement une future orchestration multi-agents.

## AgentOrchestrator

Endpoint :

```http
POST /ai/orchestrate
```

Role :

- recevoir une intention ;
- selectionner l'agent specialise ;
- retourner une reponse standardisee avec `intent`, `agent` et `result`.

Intentions supportees :

```text
analyze_cv
analyze_offer
match
generate_letter
career_advice
```

Payload generique :

```json
{
  "intent": "match",
  "payload": {
    "candidateSkills": ["React", "Node.js"],
    "requiredSkills": ["React", "Docker"],
    "optionalSkills": ["AWS"]
  }
}
```

Reponse :

```json
{
  "intent": "match",
  "agent": "MatchingAgent",
  "result": {
    "score": 50,
    "matchedSkills": ["React"],
    "missingSkills": ["Docker"],
    "optionalMatchedSkills": [],
    "explanation": "Le candidat possede 1 competence(s) requise(s) sur 2."
  }
}
```

Exemple analyse CV :

```json
{
  "intent": "analyze_cv",
  "payload": {
    "text": "Je suis developpeur React Node.js PostgreSQL."
  }
}
```

Cet orchestrateur est une premiere version simple. LangGraph sera ajoute plus tard pour gerer des workflows multi-agents plus complexes.

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

## LangGraph Matching Workflow

Objectif :

- orchestrer progressivement le matching avec LangGraph ;
- garder la logique de calcul dans `MatchingAgent` ;
- preparer des workflows plus complexes sans ajouter encore de LLM externe, RAG ou OpenAI API.

Endpoint :

```http
POST /ai/workflows/match
```

Payload :

```json
{
  "candidateSkills": ["React", "Node.js", "PostgreSQL"],
  "requiredSkills": ["React", "Node.js", "Docker"],
  "optionalSkills": ["AWS"]
}
```

Reponse :

```json
{
  "workflow": "matching_workflow",
  "result": {
    "score": 67,
    "matchedSkills": ["React", "Node.js"],
    "missingSkills": ["Docker"],
    "optionalMatchedSkills": [],
    "explanation": "Le candidat possede 2 competence(s) requise(s) sur 3."
  }
}
```

Difference avec `/ai/match` :

- `/ai/match` appelle directement le service puis `MatchingAgent` ;
- `/ai/workflows/match` utilise LangGraph pour orchestrer les etapes `validate_input -> matching -> format_response`.

## Generation Lettre de Motivation

Endpoint :

```http
POST /ai/generate-letter
```

Cette generation MVP est deterministe et n'utilise pas de LLM externe, OpenAI API, LangGraph ou RAG.

Payload :

```json
{
  "student": {
    "firstName": "Hasni",
    "lastName": "Badis",
    "educationLevel": "Licence Informatique",
    "targetJob": "Developpeur Fullstack",
    "bio": "Etudiant passionne par le developpement web."
  },
  "candidateSkills": ["React", "Node.js", "PostgreSQL"],
  "offer": {
    "title": "Stage Developpeur Fullstack React Node.js",
    "description": "Nous recherchons un stagiaire React Node.js PostgreSQL.",
    "location": "Paris",
    "duration": "6 mois",
    "requiredSkills": ["React", "Node.js", "Docker"]
  },
  "company": {
    "companyName": "SmartTech",
    "sector": "Informatique"
  },
  "matching": {
    "score": 67,
    "matchedSkills": ["React", "Node.js"],
    "missingSkills": ["Docker"]
  },
  "tone": "PROFESSIONAL"
}
```

Reponse :

```json
{
  "content": "Madame, Monsieur,\n\nJe vous adresse ma candidature..."
}
```

Commande de test :

```bash
curl -X POST http://localhost:8000/ai/generate-letter -H "Content-Type: application/json" -d "{\"student\":{\"firstName\":\"Hasni\",\"lastName\":\"Badis\",\"educationLevel\":\"Licence Informatique\",\"targetJob\":\"Developpeur Fullstack\",\"bio\":\"Etudiant passionne par le developpement web.\"},\"candidateSkills\":[\"React\",\"Node.js\",\"PostgreSQL\"],\"offer\":{\"title\":\"Stage Developpeur Fullstack React Node.js\",\"description\":\"Nous recherchons un stagiaire React Node.js PostgreSQL.\",\"location\":\"Paris\",\"duration\":\"6 mois\",\"requiredSkills\":[\"React\",\"Node.js\",\"Docker\"]},\"company\":{\"companyName\":\"SmartTech\",\"sector\":\"Informatique\"},\"matching\":{\"score\":67,\"matchedSkills\":[\"React\",\"Node.js\"],\"missingSkills\":[\"Docker\"]},\"tone\":\"PROFESSIONAL\"}"
```

## Assistant Carriere

Endpoint :

```http
POST /ai/career-advice
```

Assistant MVP base sur des regles deterministes, sans LLM externe, OpenAI API, LangGraph ou RAG.

Payload :

```json
{
  "student": {
    "firstName": "Hasni",
    "lastName": "Badis",
    "educationLevel": "Licence Informatique",
    "targetJob": "Developpeur Fullstack",
    "bio": "Etudiant passionne par le developpement web."
  },
  "candidateSkills": ["React", "Node.js", "PostgreSQL"],
  "offer": {
    "id": "offer_id",
    "title": "Stage Developpeur Fullstack React Node.js",
    "description": "Nous recherchons un stagiaire React Node.js Docker.",
    "requiredSkills": ["React", "Node.js", "Docker"],
    "optionalSkills": ["AWS"],
    "companyName": "SmartTech"
  },
  "matching": {
    "score": 67,
    "matchedSkills": ["React", "Node.js"],
    "missingSkills": ["Docker"]
  },
  "question": "Quelles competences dois-je ameliorer pour reussir cette offre ?"
}
```

Reponse :

```json
{
  "profileSummary": "Votre profil correspond partiellement a l'offre Stage Developpeur Fullstack React Node.js.",
  "matchingScore": 67,
  "strengths": ["Vous possedez deja React."],
  "skillsToImprove": [
    {
      "skill": "Docker",
      "priority": "HIGH",
      "reason": "Cette competence est demandee dans l'offre mais absente de votre CV analyse.",
      "actions": ["Comprendre les images et conteneurs Docker."]
    }
  ],
  "actionPlan": [
    {
      "period": "Semaine 1",
      "objective": "Travailler Docker avec une realisation pratique."
    }
  ],
  "finalAdvice": "Vous avez deja une base pertinente pour cette offre. En ameliorant Docker, vous augmenterez votre adequation avec le poste."
}
```

## Test avec Postman

1. Lancer le service avec `uvicorn app.main:app --reload --port 8000`.
2. Utiliser l'URL `http://localhost:8000`.
3. Ajouter le header `Content-Type: application/json` pour les routes POST.
4. Envoyer les payloads JSON ci-dessus.

