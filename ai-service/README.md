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

## RAG V1 (compatibilite historique)

Objectif :

- preparer l'architecture RAG sans OpenAI API, LLM externe, RAG complet ou pgvector reel ;
- generer un embedding simple et deterministe base sur des mots-cles techniques ;
- tester le chunking et une recherche cosine en memoire avant de brancher PostgreSQL/pgvector.

Ces routes restent disponibles pour compatibilite et deleguent maintenant aux services RAG V2 documentes plus bas.

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

## RAG V2

RAG V2 suit le pipeline : normalisation, chunking par sections et phrases, enrichissement metadata, embedding, recherche hybride, reranking, contexte borne, reponse fondee et citations. Les anciennes routes `/ai/rag/embed`, `/chunk`, `/search-demo` et `/answer` restent compatibles et deleguent aux services V2.

Nouvelles routes :

```http
POST /ai/rag/v2/index-document
POST /ai/rag/v2/embed
POST /ai/rag/v2/chunk
POST /ai/rag/v2/retrieve
POST /ai/rag/v2/answer
```

### Chunking et metadata

Les chunks visent 500 a 900 caracteres avec environ 100 caracteres de recouvrement. Les limites de phrase sont conservees et les petits chunks sont fusionnes. Les sections CV (`skills`, `projects`, `experience`, `education`) et offre (`missions`, `required_skills`, `optional_skills`) sont reconnues. Chaque chunk contient `chunkIndex`, `section`, `tokenEstimate`, langue, domaine, skills, sourceType et scope transmis par le backend.

### Embeddings et fallback

`embedding_service_v2.py` charge paresseusement `all-MiniLM-L6-v2` si `sentence-transformers` et le modele local sont disponibles. Par defaut, aucun telechargement reseau n est tente. Le fallback `hashing-v2` produit un vecteur deterministe normalise de dimension 384 a partir des tokens et bigrams. `RAG_ALLOW_MODEL_DOWNLOAD=true` autorise explicitement le chargement distant du modele.

### Retrieval, reranking et grounded answer

Le score hybride utilise 60 % vectoriel, 25 % lexical, 10 % metadata et 5 % recence. Le reranking ajoute des signaux de skills, de section et d identifiants (`offerId`, `applicationId`, `studentId`, `companyId`). Les chunks faibles sont filtres et deux chunks maximum sont gardes par document.

`grounded_answer_service_v2.py` construit une synthese extractive seulement depuis les contextes fournis. Si le contexte est insuffisant, il le dit explicitement. Chaque citation fournit `sourceId`, `title`, `sourceType`, `ownerType`, `chunkIndex`, `score` et un snippet court. Aucun embedding ni document complet n est expose.

Career Assistant V2 recoit maintenant `ragCitations` et `ragWarnings`; Matching V3 reste sa source principale. Motivation Letter V2 expose `usedRagContext` et `ragCitations`, mais son controle anti-invention reste prioritaire. Les deux fonctions continuent sans RAG en cas d indisponibilite.

### Evaluation

```bash
python scripts/evaluate_rag_v2.py
python -m unittest tests.test_rag_v2 -v
python -m unittest discover -s tests -v
```

L evaluation couvre React/Node.js, Docker/CI-CD, contexte CV plus offre, hors contexte, scopes etudiant/entreprise, deduplication et reranking QA.

### Limites actuelles

- le stockage backend reste en JSON; pgvector est une evolution preparee mais non activee ;
- le fallback hashing reconnait surtout les recouvrements lexicaux et techniques ;
- la reponse fondee est extractive et deterministe sans LLM externe ;
- la pertinence depend de la qualite des documents et de leurs metadonnees ;
- RAG enrichit Matching V3, Career Assistant V2 et Motivation Letter V2 sans remplacer leurs controles metier.

## Orchestrator V2

Orchestrator V2 est la couche de coordination multi-agents de SmartIntern AI. Il ne remplace pas les agents specialises: il decide quoi executer, reutilise les resultats deja fournis, partage un contexte commun, applique Matching V3 comme source centrale, enrichit avec RAG V2 si disponible, puis transmet les preuves a Career Assistant V2 et Motivation Letter V2.

L ancien endpoint `POST /ai/orchestrate` reste disponible avec son format historique `{ intent, agent, result }`. Le nouveau endpoint complet est :

```http
POST /ai/orchestrate/v2
```

Un wrapper LangGraph est aussi expose :

```http
POST /ai/workflows/orchestrate-v2
```

### Pourquoi l orchestrateur est important

- evite que les agents fonctionnent comme des briques isolees ;
- garde les analyses CV, offre, matching, conseils et lettre coherentes ;
- evite de relancer inutilement une analyse deja fournie ;
- centralise les controles qualite ;
- rend les reponses IA plus explicables pour le backend et le frontend.

### Intents supportes

```text
ANALYZE_CV
ANALYZE_OFFER
MATCH
CAREER_ADVICE
GENERATE_LETTER
FULL_APPLICATION_ASSISTANCE
CANDIDATE_RANKING_ASSISTANCE
RAG_QUESTION
UNKNOWN
```

Si `intent` est absent, `intent_router.py` detecte une intention simple depuis `question` : matching, compatibilite, conseils, lettre, dossier de candidature, RAG ou source documentaire. Aucun LLM externe n est requis pour cette detection.

### Payload V2

```json
{
  "intent": "FULL_APPLICATION_ASSISTANCE",
  "question": "Je veux postuler a cette offre, aide-moi a ameliorer mon dossier.",
  "studentProfile": {
    "firstName": "Nabil",
    "lastName": "Haddad",
    "educationLevel": "Licence Informatique",
    "targetJob": "Developpeur Fullstack"
  },
  "cvText": "Projets realises avec React, Node.js, PostgreSQL, Docker et Git.",
  "cvAnalysis": {},
  "offer": {
    "id": 1,
    "title": "Stage developpeur fullstack React Node.js",
    "companyName": "SmartTech",
    "description": "Stage React, Node.js, API REST et PostgreSQL.",
    "requiredSkills": ["React", "Node.js", "PostgreSQL", "REST API"],
    "optionalSkills": ["Docker", "CI/CD"]
  },
  "offerAnalysis": {},
  "matchingResult": {},
  "careerAdvice": {},
  "tone": "PROFESSIONAL",
  "ragContextDocuments": [],
  "options": {
    "includeMatching": true,
    "includeCareerAdvice": true,
    "includeMotivationLetter": true,
    "includeRag": true,
    "debug": false
  }
}
```

Regles de cache :

- si `cvAnalysis` existe, l analyse CV n est pas relancee ;
- si `offerAnalysis` existe, l analyse offre n est pas relancee ;
- si `matchingResult` V3 existe, le matching n est pas relance sauf `options.forceRecompute=true` ;
- RAG V2 est optionnel et ne bloque pas la chaine complete ;
- `includeMotivationLetter=false` empeche la generation de lettre.

### Execution plan

`execution_plan.py` produit une liste de steps avec `required` et `canUseCache`. Pour `FULL_APPLICATION_ASSISTANCE`, le plan standard est :

```text
ANALYZE_CV
ANALYZE_OFFER
MATCH_V3
RAG_V2
CAREER_ASSISTANT_V2
MOTIVATION_LETTER_V2
QUALITY_CONTROL
```

Une etape optionnelle en echec donne `PARTIAL_SUCCESS`. Une etape requise en echec donne `FAILED`.

### Contexte partage

`OrchestrationContext` transporte :

- `cvAnalysis` ;
- `offerAnalysis` ;
- `matchingResult` ;
- `ragContext` ;
- `careerAdvice` ;
- `motivationLetter` ;
- `stepResults`, `warnings`, `errors` et `debugInfo`.

Ce contexte evite de refaire le parsing dans chaque agent et permet a Motivation Letter V2 de recevoir les preuves deja produites par Matching V3 et Career Assistant V2.

### Coordination des agents

Matching V3 est utilise pour `MATCH`, `CAREER_ADVICE`, `GENERATE_LETTER`, `FULL_APPLICATION_ASSISTANCE` et `CANDIDATE_RANKING_ASSISTANCE`. L orchestrateur transmet notamment `coverageMatrix`, `scoreBreakdown`, `criticalMissingSkills`, `evidenceSummary`, `confidence` et `decisionLabel`.

RAG V2 enrichit la reponse si `ragContextDocuments` ou `contexts` sont fournis. Il retourne `used`, `retrievedContextCount`, `citations`, `confidence`, `answer` et `warnings`. Il ne remplace jamais le matching.

Career Assistant V2 recoit le matching complet, la question utilisateur, le profil, l offre et le contexte RAG. Il retourne `readinessLevel`, `priorityFocus`, `criticalGaps`, `recommendedProjects`, `cvImprovementTips`, `interviewPreparationTips` et `learningRoadmap`.

Motivation Letter V2 recoit profil, CV analysis, offre, matching, career advice et RAG. L orchestrateur verifie ensuite `qualityChecks`, notamment `usesOnlyVerifiedSkills` et `doesNotClaimMissingSkills`.

### Quality control global

`quality_control_v2.py` verifie :

- score matching entre 0 et 100 ;
- presence de `decisionLabel` et `coverageMatrix` lorsque des competences requises existent ;
- coherence des plafonds de score si des competences critiques manquent ;
- presence de `readinessLevel` et de priorites dans Career Assistant V2 ;
- lettre sans revendication de competence manquante ;
- citations ou warning si RAG est utilise ;
- absence d embeddings bruts dans les sources.

La reponse V2 retourne :

```json
{
  "intent": "FULL_APPLICATION_ASSISTANCE",
  "status": "SUCCESS",
  "summary": "...",
  "steps": [],
  "results": {
    "cvAnalysis": {},
    "offerAnalysis": {},
    "matching": {},
    "rag": {},
    "careerAdvice": {},
    "motivationLetter": {}
  },
  "qualityControl": {
    "passed": true,
    "checks": [],
    "warnings": [],
    "blockingIssues": []
  },
  "recommendations": [],
  "warnings": []
}
```

### Commandes de test

Demarrer le service :

```bash
uvicorn app.main:app --reload --port 8000
```

Tester MATCH :

```bash
curl -X POST http://localhost:8000/ai/orchestrate/v2 -H "Content-Type: application/json" -d "{\"intent\":\"MATCH\",\"cvText\":\"React Node.js PostgreSQL REST API\",\"offer\":{\"title\":\"Stage React Node\",\"description\":\"React Node PostgreSQL REST API\",\"requiredSkills\":[\"React\",\"Node.js\",\"PostgreSQL\",\"REST API\"]}}"
```

Tester CAREER_ADVICE :

```bash
curl -X POST http://localhost:8000/ai/orchestrate/v2 -H "Content-Type: application/json" -d "{\"intent\":\"CAREER_ADVICE\",\"question\":\"Quelles competences ameliorer ?\",\"studentProfile\":{\"firstName\":\"Nabil\",\"lastName\":\"Haddad\"},\"cvText\":\"React Node.js PostgreSQL\",\"offer\":{\"title\":\"Stage React\",\"description\":\"React Node PostgreSQL\",\"requiredSkills\":[\"React\",\"Node.js\",\"PostgreSQL\"]}}"
```

Tester GENERATE_LETTER :

```bash
curl -X POST http://localhost:8000/ai/orchestrate/v2 -H "Content-Type: application/json" -d "{\"intent\":\"GENERATE_LETTER\",\"studentProfile\":{\"firstName\":\"Nabil\",\"lastName\":\"Haddad\",\"educationLevel\":\"Licence Informatique\"},\"cvText\":\"Projet React Node.js PostgreSQL\",\"offer\":{\"title\":\"Stage React Node.js\",\"companyName\":\"SmartTech\",\"description\":\"React Node PostgreSQL\",\"requiredSkills\":[\"React\",\"Node.js\"]},\"tone\":\"PROFESSIONAL\"}"
```

Tester FULL_APPLICATION_ASSISTANCE :

```bash
curl -X POST http://localhost:8000/ai/orchestrate/v2 -H "Content-Type: application/json" -d "{\"intent\":\"FULL_APPLICATION_ASSISTANCE\",\"question\":\"Je veux postuler a cette offre\",\"studentProfile\":{\"firstName\":\"Nabil\",\"lastName\":\"Haddad\"},\"cvText\":\"React Node.js PostgreSQL Docker Git\",\"offer\":{\"title\":\"Stage fullstack React Node\",\"companyName\":\"SmartTech\",\"description\":\"React Node PostgreSQL API REST\",\"requiredSkills\":[\"React\",\"Node.js\",\"PostgreSQL\"],\"optionalSkills\":[\"Docker\"]},\"options\":{\"includeMotivationLetter\":true}}"
```

Evaluation :

```bash
python scripts/evaluate_orchestrator_v2.py
python -m unittest tests.test_orchestrator_v2 -v
python -m unittest discover -s tests -v
```

### Limites actuelles

- Orchestrator V2 ne remplace pas les endpoints metier existants du backend ; il ajoute une couche de coordination.
- Le RAG V2 est enrichissant uniquement si le backend transmet des contextes deja recuperes.
- La detection d intent reste deterministe et volontairement prudente.
- La generation reste deterministic-first sans LLM externe.
- `PARTIAL_SUCCESS` est frequent lorsque RAG est demande mais aucun contexte n est fourni.

## Evidence Checker & Career Signal Map

Matching V3 retourne maintenant un objet `explainability` en plus des champs historiques (`score`, `matchedSkills`, `missingSkills`, `optionalMatchedSkills`, `explanation`, `confidence`, `decisionLabel`, `v3`).

```json
{
  "explainability": {
    "skillEvidenceMap": {},
    "evidenceSummary": {},
    "careerSignalMap": {
      "categories": [],
      "globalSignals": {}
    },
    "decisionTrace": []
  }
}
```

### Evidence Checker

`evidence_checker_service.py` classe chaque competence en quatre niveaux :

- `STRONG` : preuve dans un projet ou une experience concrete.
- `MEDIUM` : preuve utile mais moins contextualisee, par exemple une section competences.
- `WEAK` : mention vague, apprentissage en cours, correspondance partielle ou related skill.
- `MISSING` : aucune preuve exploitable.

Chaque entree contient `evidenceType`, `confidence`, snippets courts, raison et recommandation. Les snippets sont limites pour eviter d exposer tout le CV.

### Career Signal Map

`career_signal_map_service.py` regroupe les signaux par domaine : Frontend, Backend, Database, DevOps, Cloud, Data / AI, Mobile, QA / Testing, Tools et Soft Skills. Le score de categorie combine couverture des exigences, qualite des preuves et competences manquantes. `globalSignals` expose les domaines dominants, les domaines faibles, le type de profil et la confiance du signal.

### AI Decision Trace

`decision_trace_service.py` produit une trace lisible :

- analyse du CV ;
- analyse de l offre ;
- verification des preuves ;
- couverture des exigences ;
- calcul du score.

La trace est destinee au frontend, a un jury ou a un recruteur. Elle explique le score sans exposer de JSON technique brut.

### Integrations

- Career Assistant V2 lit `explainability` pour recommander des actions sur les preuves faibles et les domaines a renforcer.
- Orchestrator V2 propage `explainability` dans `results.matching`.
- Quality Control V2 verifie la presence de `skillEvidenceMap`, `careerSignalMap` et `decisionTrace` quand un matching est calcule.
- Le backend relaie les nouveaux champs quand un matching frais revient de l AI service, sans migration Prisma.

### Frontend Usage Recommendation

Le frontend pourra afficher :

- badges de preuve `STRONG`, `MEDIUM`, `WEAK`, `MISSING` ;
- barres ou radar par domaine a partir de `careerSignalMap.categories` ;
- domaines dominants/faibles depuis `globalSignals` ;
- trace de decision et recommandations CV.

Ces donnees doivent rester presentees comme une aide a la decision, pas comme une decision automatique.

## AI Evaluation Suite

La suite d evaluation IA centralise les tests fonctionnels de qualite pour :

- analyse CV et analyse offre via les cas Matching ;
- Matching V3 ;
- RAG V2 en mode mock ;
- Career Assistant V2 ;
- Motivation Letter V2 ;
- Orchestrator V2 ;
- regles anti-invention et quality control global.

Commande principale :

```bash
python scripts/evaluate_ai_suite.py
```

La commande lance les six evaluateurs :

1. `matching_evaluator.py`
2. `career_evaluator.py`
3. `letter_evaluator.py`
4. `rag_evaluator.py`
5. `orchestrator_evaluator.py`
6. `explainability_evaluator.py`

Elle genere automatiquement :

```text
evaluation/reports/ai_evaluation_report_YYYYMMDD_HHMMSS.json
evaluation/reports/ai_evaluation_report_YYYYMMDD_HHMMSS.md
```

### Structure

```text
evaluation/
  cases/
    matching_cases.json
    career_assistant_cases.json
    motivation_letter_cases.json
    rag_cases.json
    orchestrator_cases.json
    explainability_cases.json
  evaluators/
    quality_metrics.py
    matching_evaluator.py
    career_evaluator.py
    letter_evaluator.py
    rag_evaluator.py
    orchestrator_evaluator.py
    explainability_evaluator.py
  reports/
  run_all_evaluations.py
```

### Metriques

Le rapport global expose :

- nombre total de cas ;
- `PASS`, `WARNING`, `FAIL` ;
- score moyen Matching V3 ;
- taux de quality checks lettre ;
- taux de readiness coherent ;
- taux de reponses RAG avec citations ;
- taux de succes Orchestrator V2 ;
- taux de passage Explainability.

Les checks communs sont dans `evaluation/evaluators/quality_metrics.py` :

- score dans une plage attendue ;
- competences attendues presentes ;
- competence manquante non revendiquee dans une lettre ;
- texte non generique ;
- quality checks lettre ;
- citations RAG si contexte utilise ;
- statut orchestrator `SUCCESS` ou `PARTIAL_SUCCESS`.

### Seuils d acceptation

- Matching : au moins 80 % des cas doivent passer.
- Career Assistant : au moins 80 % des cas doivent passer.
- Motivation Letter : aucun cas ne doit revendiquer une competence manquante et aucune lettre ne doit contenir `undefined`.
- RAG : au moins 75 % des cas doivent passer, sans fail de scope securite.
- Orchestrator : au moins 80 % des cas doivent passer.

### Commandes individuelles

```bash
python scripts/evaluate_matching_v3.py
python scripts/evaluate_career_assistant_v2.py
python scripts/evaluate_motivation_letter_v2.py
python scripts/evaluate_rag_v2.py --mode mock
python scripts/evaluate_orchestrator_v2.py
python scripts/evaluate_explainability.py
python -m unittest tests.test_ai_quality_rules -v
python -m unittest discover -s tests -v
```

### Ajouter un cas

1. Ajouter un objet JSON dans le fichier de cas correspondant.
2. Renseigner `id`, `description` si pertinent, payload metier et `expected`.
3. Lancer `python scripts/evaluate_ai_suite.py`.
4. Lire le rapport Markdown pour verifier les warnings/fails.

### Workflow de correction qualite

Pour une branche de correction comme `feature/ai-quality-fixes`, ne corriger que les problemes effectivement signales par le dernier rapport :

1. lancer la suite complete ;
2. lire le dernier JSON dans `evaluation/reports` ;
3. identifier les `FAIL` et les `WARNING` importants ;
4. relier chaque correction a une cause racine precise ;
5. relancer l evaluateur cible ;
6. relancer `python scripts/evaluate_ai_suite.py`.

Le baseline actuel de triage qualite est :

```text
Matching V3: 15/15 PASS
Career Assistant V2: 8/8 PASS
Motivation Letter V2: 10/10 PASS
RAG V2: 8/8 PASS
Orchestrator V2: 8/8 PASS
Explainability: 8/8 PASS
Global: 57/57 PASS
Status: PASS
```

Aucune correction service n est necessaire tant que ce baseline reste sans `FAIL` ni `WARNING`.

### Limites

Ces tests ne prouvent pas une precision parfaite. Ils verifient des scenarios controles et des regles de regression. Les plages de score doivent etre ajustees progressivement apres revue. Le matching depend de la qualite du CV, le RAG depend des documents indexes, et la generation reste deterministe sans LLM externe.
