# Architecture IA

## Consommation mobile explicable

React Native ne reproduit aucun calcul de Matching V3. Il normalise uniquement
les champs retournes par `backend-api` et affiche separement les sections
disponibles. Les formats legacy sans `explainability` restent supportes sans
score, confiance ou insight fictif.

## Objectif IA

La partie IA de SmartIntern AI doit aider l'utilisateur à comprendre une décision, pas seulement recevoir un score. Les services IA sont donc conçus autour de trois axes :

- précision du matching ;
- explicabilité ;
- transformation du résultat en actions concrètes.

## Matching V3

Le Matching V3 compare les compétences candidat et les compétences d'une offre. Il utilise les informations disponibles :

- compétences candidates ;
- compétences obligatoires ;
- compétences optionnelles ;
- analyse CV ;
- analyse offre ;
- texte CV et texte offre si disponibles.

Il retourne notamment :

- `score` ;
- `confidence` ;
- `decisionLabel` ;
- `matchedSkills` ;
- `missingSkills` ;
- `optionalMatchedSkills` ;
- `v3.coverageMatrix` ;
- `v3.scoreBreakdown` ;
- `v3.criticalMissingSkills` ;
- `v3.missingRequiredSkills` ;
- `v3.missingOptionalSkills` ;
- `v3.evidenceSummary` ;
- `explainability`.

## Evidence Checker

L'Evidence Checker qualifie la preuve associée à une compétence :

| Niveau | Signification |
| --- | --- |
| STRONG | compétence prouvée dans un projet ou une expérience concrète |
| MEDIUM | compétence présente dans un contexte utile |
| WEAK | compétence mentionnée faiblement |
| MISSING | aucune preuve détectée |

Cette distinction évite de traiter une simple mention comme une maîtrise réelle.

## Career Signal Map

La Career Signal Map regroupe les signaux par domaine :

- Frontend ;
- Backend ;
- Database ;
- DevOps ;
- Cloud ;
- Data / AI ;
- Mobile ;
- QA / Testing ;
- Tools ;
- Soft Skills.

Chaque catégorie peut contenir un score, un niveau, les compétences couvertes, faibles ou manquantes et une explication.

## Decision Trace

La Decision Trace explique les étapes qui ont conduit au score :

1. analyse du CV ;
2. analyse de l'offre ;
3. couverture des exigences ;
4. calcul du score ;
5. limites ou warnings.

Elle rend la décision lisible pour un étudiant, une entreprise ou un jury.

## Skill Gap Simulator

Le Skill Gap Simulator estime l'impact potentiel d'une amélioration du profil :

- score actuel ;
- score potentiel ;
- gain estimé ;
- compétences prioritaires ;
- chemin recommandé ;
- projets recommandés ;
- plafonds de score appliqués.

Important : il ne garantit pas le score futur. Il estime ce qui pourrait arriver si l'étudiant ajoute une vraie preuve dans son CV ou son portfolio.

## Offer Quality Analyzer

L'Offer Quality Analyzer aide les entreprises à améliorer leurs offres :

- `qualityScore` ;
- `qualityLevel` ;
- `matchingReadiness` ;
- problèmes détectés ;
- recommandations ;
- proposition d'offre améliorée ;
- trace de décision.

Il signale par exemple une description trop courte, des compétences obligatoires absentes, un niveau trop senior pour un stage ou un titre trop générique.

## Career Assistant V2

Career Assistant V2 transforme le matching en plan d'action :

- `readinessLevel` ;
- priorités ;
- gaps critiques ;
- projets recommandés ;
- conseils CV ;
- conseils entretien ;
- roadmap d'apprentissage.

## Motivation Letter V2

Motivation Letter V2 génère une lettre professionnelle basée sur les preuves :

- compétences vérifiées ;
- compétences manquantes traitées prudemment ;
- ton professionnel, dynamique ou simple ;
- quality checks ;
- `personalizationScore`.

Le service ne doit pas revendiquer une compétence absente.

## RAG V2

Le RAG V2 enrichit les réponses avec du contexte documentaire :

- découpage en chunks ;
- métadonnées ;
- embeddings ou fallback ;
- recherche ;
- reranking ;
- citations ;
- réponse grounded.

## Orchestrator V2

L'Orchestrator V2 coordonne les services :

- détection d'intent ;
- plan d'exécution ;
- réutilisation des résultats ;
- Matching V3 ;
- RAG V2 optionnel ;
- Career Assistant V2 ;
- Motivation Letter V2 ;
- quality control global.

## AI Evaluation Suite

La suite d'évaluation teste :

- Matching V3 ;
- Career Assistant V2 ;
- Motivation Letter V2 ;
- RAG V2 ;
- Orchestrator V2 ;
- Explainability ;
- Skill Gap Simulator ;
- Offer Quality Analyzer.

Commande principale :

```bash
cd ai-service
python scripts/evaluate_ai_suite.py
```

## Limites IA

- Le score n'est pas une décision de recrutement.
- La qualité dépend du CV et de l'offre.
- Le simulateur donne une estimation, pas une garantie.
- Les services doivent rester prudents et ne pas inventer de compétences.

