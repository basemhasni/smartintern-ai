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

## LangGraph Motivation Letter Workflow

Objectif :

- orchestrer la generation de lettre de motivation avec LangGraph ;
- garder la generation dans `MotivationLetterAgent` ;
- ajouter une preparation de contexte et un controle qualite deterministe.

Endpoint :

```http
POST /ai/workflows/generate-letter
```

Payload :

```json
{
  "student": {
    "firstName": "Hasni",
    "lastName": "Badis",
    "educationLevel": "Licence Informatique",
    "targetJob": "Developpeur Fullstack",
    "bio": "Etudiant passionne par le developpement web et l'intelligence artificielle."
  },
  "candidateSkills": ["React", "Node.js", "PostgreSQL"],
  "offer": {
    "title": "Stage Developpeur Fullstack React Node.js",
    "description": "Developpement d'une plateforme web intelligente.",
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
  "workflow": "motivation_letter_workflow",
  "result": {
    "content": "Madame, Monsieur,\n\n...",
    "qualityChecks": {
      "mentionsCompany": true,
      "mentionsOffer": true,
      "doesNotClaimMissingSkills": true,
      "hasConclusion": true
    }
  }
}
```

Nodes du workflow :

```text
validate_input
-> prepare_student_profile
-> prepare_offer_context
-> check_missing_skills
-> generate_letter
-> quality_control
-> format_response
```

Difference avec `/ai/generate-letter` :

- `/ai/generate-letter` appelle directement le service puis `MotivationLetterAgent` ;
- `/ai/workflows/generate-letter` utilise LangGraph pour orchestrer validation, preparation du contexte, generation et controle qualite.

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

Assistant MVP base sur des regles deterministes, sans LLM externe ni OpenAI API. Le champ optionnel `ragContextDocuments` permet d'ajouter des insights bases sur les documents indexes fournis par le backend.

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
  "question": "Quelles competences dois-je ameliorer pour reussir cette offre ?",
  "ragContextDocuments": [
    {
      "id": "vector_document_id",
      "ownerType": "OFFER",
      "ownerId": "offer_id",
      "title": "Offre - Stage React",
      "score": 0.95,
      "contentPreview": "Stage React Node.js PostgreSQL...",
      "metadata": {
        "requiredSkills": ["React", "Node.js", "PostgreSQL"]
      }
    }
  ]
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
  "finalAdvice": "Vous avez deja une base pertinente pour cette offre. En ameliorant Docker, vous augmenterez votre adequation avec le poste.",
  "ragInsights": [
    "Le contexte RAG inclut Offre - Stage React (OFFER), qui mentionne React, Node.js, PostgreSQL."
  ]
}
```

Si `ragContextDocuments` est absent ou vide, `ragInsights` retourne une liste vide.

## RAG MVP

Objectif :

- preparer l'architecture RAG sans OpenAI API, LLM externe, RAG complet ou pgvector reel ;
- generer un embedding simple et deterministe base sur des mots-cles techniques ;
- tester le chunking et une recherche cosine en memoire avant de brancher PostgreSQL/pgvector.

Le futur RAG remplacera cet embedding MVP par de vrais embeddings et utilisera PostgreSQL avec l'extension `pgvector`.

Le backend `backend-api` utilise actuellement `POST /ai/rag/embed` pour indexer automatiquement les CV uploades et les offres de stage dans le modele Prisma `VectorDocument`, puis pour calculer l'embedding des requetes de recherche RAG MVP.

### Generer un embedding

```http
POST /ai/rag/embed
```

Payload :

```json
{
  "text": "React Node.js PostgreSQL Docker"
}
```

Reponse :

```json
{
  "embedding": [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "dimension": 13
}
```

### Decouper un texte

```http
POST /ai/rag/chunk
```

Payload :

```json
{
  "text": "long texte..."
}
```

Reponse :

```json
{
  "chunks": ["long texte..."],
  "count": 1
}
```

### Recherche demo en memoire

```http
POST /ai/rag/search-demo
```

Payload :

```json
{
  "query": "Je cherche une offre React Node.js",
  "documents": [
    {
      "id": 1,
      "title": "Offre React",
      "content": "Stage React Node.js PostgreSQL"
    },
    {
      "id": 2,
      "title": "Offre Java",
      "content": "Stage Java Spring Boot"
    }
  ],
  "topK": 2
}
```

Reponse :

```json
{
  "results": [
    {
      "id": 1,
      "title": "Offre React",
      "score": 0.8165
    }
  ]
}
```

### Generer une reponse RAG MVP

```http
POST /ai/rag/answer
```

Cette route genere une reponse deterministe a partir des documents fournis par le backend. Elle n'utilise pas de LLM externe et ne doit pas inventer de competence absente des documents.

Payload :

```json
{
  "question": "Pourquoi cette offre est adaptee a mon profil ?",
  "documents": [
    {
      "id": "vector_document_id",
      "ownerType": "OFFER",
      "ownerId": "offer_id",
      "title": "Offre - Stage React",
      "contentPreview": "Stage React Node.js PostgreSQL...",
      "metadata": {
        "requiredSkills": ["React", "Node.js", "PostgreSQL"]
      },
      "score": 0.95
    }
  ]
}
```

Reponse :

```json
{
  "answer": "J'ai trouve plusieurs elements pertinents dans les documents indexes...",
  "usedDocuments": [
    {
      "id": "vector_document_id",
      "title": "Offre - Stage React",
      "score": 0.95
    }
  ]
}
```

## Test avec Postman

1. Lancer le service avec `uvicorn app.main:app --reload --port 8000`.
2. Utiliser l'URL `http://localhost:8000`.
3. Ajouter le header `Content-Type: application/json` pour les routes POST.
4. Envoyer les payloads JSON ci-dessus.

## Architecture IA V2

La version V2 remplace les intersections de chaines simples par un moteur deterministe partage :

```text
Route FastAPI
-> service public compatible
-> agent V2
-> taxonomie / analyse V2 / MatchingEngineV2
-> reponse enrichie avec anciens champs conserves
```

Modules principaux :

```text
app/knowledge/skill_taxonomy.py
app/utils/text_normalization.py
app/services/skill_extraction_service.py
app/services/cv_analysis_v2.py
app/services/offer_analysis_v2.py
app/services/matching_engine_v2.py
app/agents/cv_analysis_agent_v2.py
app/agents/offer_analysis_agent_v2.py
app/agents/matching_agent_v2.py
app/workflows/matching_workflow_v2.py
```

Les anciens modules d agents sont conserves dans le depot pour compatibilite historique, mais les services publics et l orchestrateur utilisent les agents V2.

### Taxonomie de competences

La taxonomie couvre :

- Frontend ;
- Backend ;
- Database ;
- DevOps / Cloud ;
- Data / AI ;
- Mobile ;
- Testing / QA ;
- Tools.

Chaque competence possede un nom canonique, des alias francais ou anglais, une categorie, des competences liees et un poids par defaut. Les alias les plus longs sont reserves avant les alias courts afin que `Node.js` ne cree pas artificiellement une mention `JavaScript` via `js`.

Les competences liees servent uniquement au matching partiel. Elles ne sont jamais ajoutees aux competences maitrisees du candidat.

### Analyse CV V2

`POST /ai/analyze-cv` conserve :

```text
skills
experienceLevel
summary
```

La reponse ajoute :

```text
detectedSkills
skillsByCategory
detectedMentions
inferredRelatedSkills
technicalSkills
softSkills
educationLevel
experienceLevelV2
projectSignals
domainSignals
languages
tools
rawTextQuality
```

`experienceLevel` reste en minuscules pour le frontend existant. `experienceLevelV2` expose `BEGINNER`, `JUNIOR`, `INTERMEDIATE` ou `UNKNOWN`.

### Analyse offre V2

`POST /ai/analyze-offer` accepte toujours `title` et `description`. Il accepte aussi les champs optionnels `requiredSkills` et `optionalSkills`.

Les listes structurees sont prioritaires. Le texte sert a completer la categorie, le domaine, les responsabilites et les mots-cles sans transformer automatiquement les competences optionnelles en exigences.

Champs ajoutes :

```text
skillsByCategory
responsibilities
seniorityExpected
keywords
criticalSkills
niceToHaveSkills
```

### MatchingEngineV2

Bareme :

```text
Competences requises : 60 %
Competences optionnelles : 20 %
Alignement domaine : 10 %
Experience : 10 %
```

Regles :

- correspondance canonique ou alias : match exact ;
- competence explicitement liee : match partiel a 50 % maximum ;
- exigence absente : aucun point pour cette exigence ;
- competences supplementaires : aucun bonus artificiel sur les exigences ;
- offre sans competence requise : score 0 et `INSUFFICIENT_DATA` ;
- score borne entre 0 et 100.

Les champs historiques restent presents :

```text
score
matchedSkills
missingSkills
optionalMatchedSkills
explanation
```

Nouveaux champs :

```text
confidence
decisionLabel
partialMatchedSkills
missingRequiredSkills
missingOptionalSkills
extraCandidateSkills
categoryScores
scoreBreakdown
strengths
risks
recommendations
```

Valeurs de confiance : `HIGH`, `MEDIUM`, `LOW`.

Labels : `STRONG_MATCH`, `GOOD_MATCH`, `PARTIAL_MATCH`, `LOW_MATCH`, `INSUFFICIENT_DATA`.

### Workflow LangGraph V2

`POST /ai/workflows/match` utilise :

```text
validate_input
prepare_cv_analysis
prepare_offer_analysis
extract_skill_signals
compute_matching_score
generate_explanation
quality_check
format_response
```

Le controle qualite verifie les bornes du score, les doublons, la coherence entre competences presentes et manquantes, la confiance et l explication.

### Compatibilite backend Node.js

Le backend continue a lire et sauvegarder :

```text
analysisJson.skills
matching.score
matching.matchedSkills
matching.missingSkills
matching.optionalMatchedSkills
matching.explanation
```

Aucune migration Prisma n est requise. Les champs V2 supplementaires sont disponibles dans les reponses directes, mais ne sont pas encore persistes par le backend.

### Tests et evaluation

Tests unitaires sans dependance supplementaire :

```bash
python -m unittest discover -s tests -v
```

Evaluation fonctionnelle :

```bash
python scripts/evaluate_matching.py
```

Fixtures :

```text
tests/fixtures/matching_cases.json
```

Les cas couvrent React, fullstack, Java/Spring face a React, QA, CV pauvre, offre pauvre et Docker seul face a React/Node.

### Limites actuelles

- Le systeme reste deterministe et ne realise pas de comprehension semantique profonde sans LLM.
- Les resultats dependent de la qualite et de la precision du texte extrait du CV.
- La taxonomie doit etre enrichie progressivement avec les technologies et formulations observees en production.
- Les niveaux d experience et d education sont des estimations prudentes basees sur des indices textuels.
- Les competences liees representent une proximite technique, pas une preuve de maitrise.
- Le backend persiste encore uniquement les champs historiques du matching.

