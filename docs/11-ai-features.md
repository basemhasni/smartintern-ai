# Fonctionnalités IA

Cette page explique les fonctionnalités IA de manière lisible pour un jury ou un utilisateur métier.

## Analyse CV

Objectif : extraire les informations utiles du CV.

Entrées :

- texte du CV ;
- compétences détectables ;
- projets et signaux de domaine.

Sorties :

- compétences ;
- niveau d'expérience estimé ;
- résumé ;
- catégories de compétences ;
- signaux de projet.

## Analyse offre

Objectif : structurer une offre de stage.

Entrées :

- titre ;
- description ;
- compétences requises ;
- compétences optionnelles.

Sorties :

- domaine ;
- résumé ;
- responsabilités ;
- compétences critiques ;
- niveau attendu ;
- qualité de l'offre si disponible.

## Matching IA

Objectif : comparer un profil étudiant à une offre.

Sorties principales :

- score ;
- confiance ;
- label de décision ;
- compétences couvertes ;
- compétences manquantes ;
- explication ;
- scoreBreakdown ;
- explainability.

## Explainability

Objectif : éviter l'effet boîte noire.

Elle inclut :

- Skill Evidence Map ;
- Career Signal Map ;
- Decision Trace.

## Career Signal Map

Objectif : montrer les forces et faiblesses du profil par domaine technique.

Exemple :

- Frontend : fort ;
- Backend : bon ;
- DevOps : faible.

## Skill Evidence Map

Objectif : distinguer une compétence prouvée d'une compétence seulement mentionnée.

Niveaux :

- STRONG ;
- MEDIUM ;
- WEAK ;
- MISSING.

## Skill Gap Simulator

Objectif : estimer quelles compétences améliorer en priorité.

Sorties :

- score potentiel ;
- gain estimé ;
- compétences prioritaires ;
- chemin recommandé ;
- projets conseillés.

L'application mobile expose les trois modes du moteur (`CONSERVATIVE`,
`REALISTIC`, `OPTIMISTIC`) et exige une action explicite. Elle presente les
resultats sans recalcul local; ces estimations restent pedagogiques et ne
garantissent aucune decision de recrutement.

## Offer Quality Analyzer

Objectif : aider les entreprises à rédiger des offres plus exploitables.

Il détecte :

- description trop courte ;
- compétences obligatoires manquantes ;
- trop de compétences demandées ;
- chevauchement required/optional ;
- niveau trop senior ;
- titre trop générique.

## Career Assistant

Objectif : transformer le matching en plan d'action.

Il propose :

- points forts ;
- gaps critiques ;
- roadmap ;
- projets ;
- conseils CV ;
- conseils entretien.

## Motivation Letter

Objectif : générer une lettre professionnelle basée sur des preuves réelles.

Le service applique un contrôle anti-invention :

- ne pas revendiquer une compétence manquante ;
- ne pas inventer un projet ;
- ne pas inventer une expérience.

## RAG

Objectif : enrichir certaines réponses avec un contexte documentaire.

Le RAG retourne des citations et doit signaler quand le contexte est insuffisant.

## Orchestrator

Objectif : coordonner les services IA dans le bon ordre.

Exemples d'intents :

- matching ;
- career advice ;
- generate letter ;
- full application assistance ;
- skill gap simulation ;
- offer quality analysis.

## Utilisation du matching sur mobile

Le detail d'offre reutilise d'abord le matching present dans les recommandations.
En son absence, l'etudiant declenche explicitement
`GET /api/offers/:id/match`. Le mobile passe exclusivement par `backend-api`, ne
contacte jamais directement `ai-service` et ne recalcule aucun score. Un CV
analyse est requis pour lancer cette action.

Le simulateur mobile utilise `POST /api/offers/:id/skill-gap-simulation`. Le
backend reconstruit le matching authentifie avant de deleguer au service IA; le
client envoie seulement le mode choisi.

