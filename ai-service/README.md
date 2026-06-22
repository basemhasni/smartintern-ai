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

Career Assistant V2 transforme le resultat detaille de Hybrid Matching V3 en conseils fondes sur les preuves du CV. Il reste deterministe et ne depend pas d'un LLM externe. Le champ optionnel `ragContextDocuments` enrichit les conclusions sans remplacer le matching et sans bloquer la reponse lorsqu'aucun document pertinent n'est disponible.

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
    "missingSkills": ["Docker"],
    "confidence": "MEDIUM",
    "decisionLabel": "PARTIAL_MATCH",
    "v3": {
      "coverageMatrix": [],
      "criticalMissingSkills": [],
      "missingRequiredSkills": ["Docker"],
      "missingOptionalSkills": ["AWS"],
      "evidenceSummary": {}
    }
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
  "profileSummary": "Compatibilite 67/100 pour Stage Developpeur Fullstack React Node.js. Niveau de preparation: NEEDS_TARGETED_WORK.",
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
  "finalAdvice": "Travaillez en priorite Docker avec une realisation limitee mais terminee, puis mettez le CV a jour uniquement avec ce que vous pouvez demontrer.",
  "ragInsights": [
    "Le contexte RAG inclut Offre - Stage React (OFFER), qui mentionne React, Node.js, PostgreSQL."
  ],
  "v2": {
    "adviceMethod": "CAREER_ASSISTANT_V2_FROM_MATCHING_V3",
    "questionIntent": "SKILL_GAPS",
    "readinessLevel": "NEEDS_TARGETED_WORK",
    "priorityFocus": [],
    "criticalGaps": [],
    "requiredGaps": [],
    "optionalImprovements": [],
    "evidenceBasedStrengths": [],
    "weakEvidenceAreas": [],
    "recommendedProjects": [],
    "cvImprovementTips": [],
    "interviewPreparationTips": [],
    "learningRoadmap": [],
    "estimatedPreparationEffort": {"level": "MEDIUM", "reason": "..."},
    "warnings": [],
    "ragContextUsed": true
  }
}
```

Les champs historiques `profileSummary`, `matchingScore`, `strengths`, `skillsToImprove`, `actionPlan`, `finalAdvice` et `ragInsights` sont conserves pour le frontend existant. L'objet `v2` peut etre adopte progressivement.

### Readiness et priorites

- `READY` : score eleve, confiance exploitable et aucune competence critique manquante.
- `ALMOST_READY` : quelques ecarts cibles sans manque critique majeur.
- `NEEDS_TARGETED_WORK` : plusieurs exigences ou preuves doivent etre renforcees.
- `NEEDS_MAJOR_WORK` : score faible ou plusieurs exigences critiques absentes.
- `INSUFFICIENT_DATA` : confiance faible, CV pauvre, offre ambigue ou matrice vide.

Les ecarts critiques passent avant les exigences obligatoires. Les correspondances partielles et preuves faibles restent en priorite moyenne. Les competences optionnelles ne deviennent jamais critiques et restent en priorite basse apres les exigences principales.

### Conseils produits

- un a trois projets limites et directement lies aux gaps detectes ;
- une roadmap adaptee au niveau de preparation, et non un calendrier fixe ;
- des conseils CV qui interdisent explicitement d'inventer une competence ;
- des conseils entretien relies aux preuves ou aux lacunes ;
- une intention locale `SKILL_GAPS`, `PROJECT_IDEAS`, `CV_IMPROVEMENT`, `INTERVIEW_PREP` ou `FULL_ANALYSIS` selon la question.

### RAG et limites

Le RAG ne confirme une priorite que lorsque les metadonnees d'un document indexe mentionnent un gap detecte. Un contexte vide ou peu precis ajoute un warning non bloquant. Les conseils restent dependants de la qualite du CV, de la matrice V3 et des exigences structurees de l'offre. Ils ne garantissent pas une decision de recrutement.

### Pourquoi les conseils peuvent varier

Le resultat varie selon le score, les competences critiques manquantes, la qualite des preuves du CV, la question posee, le contexte RAG et le niveau de confiance. Deux profils au meme score peuvent donc recevoir des priorites differentes.

### Evaluation Career Assistant V2

```bash
python scripts/evaluate_career_assistant_v2.py
python -m unittest discover -s tests -v
```

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

## Hybrid Matching V3

La V3 combine plusieurs signaux au lieu de reposer uniquement sur une intersection de competences :

```text
exact / alias
-> fuzzy controle
-> similarite semantique
-> preuves CV
-> criticite de l offre
-> matrice de couverture
-> score pondere et plafonds
-> explication detaillee
```

Moteur principal :

```text
app/services/hybrid_matching_engine_v3.py
```

Services associes :

```text
app/services/semantic_similarity_service.py
app/services/evidence_extraction_service.py
app/services/matching_explanation_service.py
app/services/cv_analysis_v3.py
app/services/offer_analysis_v3.py
```

### Dependances semantiques optionnelles

Le service reste fonctionnel sans nouvelle dependance. Les backends optionnels sont listes dans :

```text
requirements-matching-v3.txt
```

Installation optionnelle :

```bash
pip install -r requirements-matching-v3.txt
```

Priorite de similarite :

1. `sentence-transformers` avec chargement lazy d un modele local ;
2. TF-IDF et cosine similarity via `scikit-learn` ;
3. similarite lexicale deterministe.

Par defaut, le modele sentence-transformers doit deja etre present localement. Pour autoriser son telechargement :

```env
SMARTINTERN_ALLOW_MODEL_DOWNLOAD=true
SMARTINTERN_SENTENCE_MODEL=all-MiniLM-L6-v2
```

Une erreur de modele ou une dependance absente ne bloque jamais `/ai/match`.

### Extraction de preuves

Les phrases CV sont classees en :

```text
PROJECT
EXPERIENCE
EDUCATION
SKILL_LIST
SUMMARY
UNKNOWN
```

Une mention dans un projet ou une experience vaut davantage qu un mot isole. Les phrases negatives comme `je n ai pas utilise React` sont exclues des competences et des preuves semantiques.

Les preuves retournees sont courtes et limitees. Le CV complet n est pas copie dans la reponse normale.

### Exigences et criticite

L analyse offre produit `requirementItems` avec :

```text
id
label
type
importance
category
source
```

Une competence requise devient `CRITICAL` seulement si elle est aussi presente dans le titre. Une competence optionnelle ne devient jamais critique automatiquement.

### Coverage matrix

Chaque exigence contient :

```text
requirement
importance
category
matchType
coverage
confidence
evidence
evidenceType
reason
```

Types :

```text
EXACT
ALIAS
FUZZY
SEMANTIC
RELATED
MISSING
```

Une relation technique reste inferieure ou egale a `0.55` et ne rejoint pas `matchedSkills`.

### Scoring V3

```text
Critical skills coverage : 35 %
Required skills coverage : 30 %
Optional skills coverage : 10 %
Evidence quality : 10 %
Domain alignment : 8 %
Seniority alignment : 5 %
CV quality : 2 %
```

Plafonds :

- competence critique insuffisamment couverte : `72` ;
- plus de 50 % des exigences manquantes : `55` ;
- aucune exigence couverte : `35` ;
- CV pauvre : `60` ;
- score superieur a 90 reserve aux CV riches avec couverture optionnelle presque complete.

Decisions :

```text
85-100 STRONG_MATCH
70-84  GOOD_MATCH
50-69  PARTIAL_MATCH
30-49  LOW_MATCH
0-29   VERY_LOW_MATCH
INSUFFICIENT_DATA si les donnees ne permettent pas le calcul
```

### Reponse compatible

Les champs historiques restent toujours presents :

```text
score
matchedSkills
missingSkills
optionalMatchedSkills
explanation
```

Les details V3 sont places dans `v3` :

```text
scoringMethod
scoreBreakdown
coverageMatrix
criticalMissingSkills
missingRequiredSkills
missingOptionalSkills
partialMatchedSkills
extraCandidateSkills
domainAlignment
evidenceSummary
semanticMethod
```

### Mode debug

Payload normal :

```json
{
  "candidateSkills": ["React", "Node.js"],
  "requiredSkills": ["React", "Node.js", "PostgreSQL"],
  "optionalSkills": ["Docker"]
}
```

Payload debug avec preuves :

```json
{
  "candidateSkills": ["React", "Node.js"],
  "requiredSkills": ["React", "Node.js", "PostgreSQL"],
  "optionalSkills": ["Docker"],
  "candidateText": "Projet e-commerce developpe avec React et Node.js...",
  "offerText": "Developper une plateforme React Node.js PostgreSQL...",
  "debug": true
}
```

Le mode debug ajoute les preuves detaillees, les matches semantiques, les warnings de plafonnement et le profil de preuves candidat.

### Workflow LangGraph V3

```text
validate_input
build_candidate_profile
build_offer_requirements
extract_candidate_evidence
compute_requirement_coverage
calculate_hybrid_score
generate_detailed_explanation
quality_control
format_response
```

Le controle qualite verifie la matrice, les doublons, les bornes, le plafond critique et la richesse de l explication.

### Evaluation V3

```bash
python scripts/evaluate_matching_v3.py
python -m unittest discover -s tests -v
```

Cas :

```text
evaluation/cases/matching_v3_cases.json
```

Les 12 scenarios couvrent fullstack, frontend, Java/Spring, QA, DevOps, CV pauvre, offre pauvre, Docker seul, Angular vers React, Python vers Node, Flutter et IA/RAG.

### Pourquoi le score n est pas toujours eleve

Un score est volontairement limite lorsque :

- une competence critique du titre est absente ;
- plus de la moitie des exigences ne sont pas couvertes ;
- le CV contient peu de texte ou peu de preuves ;
- l offre est ambiguë ou sans competences structurees ;
- une technologie est seulement liee a l exigence ;
- la competence apparait sans projet, experience ou contexte exploitable ;
- les competences optionnelles restent absentes.

Le classement aide le recruteur a lire les preuves techniques. Il ne remplace pas une evaluation humaine.

### Limites V3

- Sans dependances optionnelles, la similarite semantique utilise un fallback lexical.
- Les embeddings locaux apportent une meilleure detection des paraphrases mais augmentent le poids et le temps de chargement.
- La detection de negation reste basee sur des formulations connues.
- Les preuves sont limitees par la qualite du texte extrait du PDF ou DOCX.
- Le backend actuel continue de transmettre principalement des listes de competences ; les meilleurs resultats semantiques sont obtenus avec `candidateAnalysis`, `candidateText`, `offerAnalysis` et `offerText`.

## Motivation Letter V2

`POST /ai/generate-letter` utilise maintenant `MotivationLetterAgentV2` et le service deterministe `motivation_letter_v2_service.py`. Les champs historiques restent disponibles (`content`, `letter`, `generatedLetter`, `tone`) et l objet `v2` ajoute la structure, les preuves, les controles et le score de personnalisation.

### Entrees exploitees

- profil etudiant et formation ;
- analyse CV V3, competences detectees, domaines et projets ;
- offre, entreprise et competences structurees ;
- resultat Hybrid Matching V3 et matrice de couverture ;
- message de candidature lorsqu il existe ;
- contexte RAG limite aux faits structures utilisables ;
- ton `PROFESSIONAL`, `DYNAMIC` ou `SIMPLE`.

Un ton inconnu utilise `PROFESSIONAL` et produit un warning. Les tons professionnel et dynamique visent 180 a 280 mots. Le ton simple vise 130 a 220 mots.

### Structure et anti-invention

La lettre contient cinq blocs: ouverture, adequation du profil, motivation, progression et conclusion. Les competences citees proviennent des competences detectees et confirmees par le matching ou le CV. Une competence manquante ne peut pas etre revendiquee comme maitrisee; au maximum une competence importante est traitee sobrement comme axe de progression.

`v2.qualityChecks` expose notamment:

- `mentionsCompany` et `mentionsOffer` ;
- `usesOnlyVerifiedSkills` ;
- `doesNotClaimMissingSkills` ;
- `hasProfessionalTone` et `hasClearStructure` ;
- `lengthOk`, `wordCount` et la plage attendue.

`v2.personalizationScore` est compris entre 0 et 1. Il tient compte de l offre, de l entreprise, des competences verifiees, du projet professionnel, de la formation et des preuves. Ce score mesure la personnalisation du texte, pas la qualite du candidat.

### Workflow LangGraph V2

`POST /ai/workflows/generate-letter` utilise les nodes suivants:

1. `validate_input`
2. `normalize_tone`
3. `extract_letter_evidence`
4. `plan_letter_structure`
5. `draft_opening`
6. `draft_fit_paragraph`
7. `draft_motivation_paragraph`
8. `handle_missing_skills`
9. `draft_closing`
10. `validate_claims`
11. `quality_check`
12. `format_response`

### Evaluation

```bash
python scripts/evaluate_motivation_letter_v2.py
python -m unittest discover -s tests -v
```

### Limites actuelles

- la generation reste deterministe sans LLM externe ;
- la personnalisation depend de la qualite du CV et des donnees de l offre ;
- le RAG n est utilise que lorsqu il apporte un fait structure absent du payload ;
- la lettre reste une base a relire et modifier par l etudiant ;
- le systeme ne doit jamais ajouter une competence ou une experience non prouvee.
