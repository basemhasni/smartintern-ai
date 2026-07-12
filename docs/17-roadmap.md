# Roadmap

## Progression mobile IA

- dashboard IA par offre et reutilisation du cache de matching ;
- Score Breakdown, Skill Evidence Map, Career Signal Map et Decision Trace ;
- prochaines evolutions : lecture persistante de l'explicabilite V3 et politique
  de retention adaptee.

## Deja realise

### Backend

- Express API, Prisma et PostgreSQL ;
- authentification, roles et profils ;
- offres, candidatures, CV et matching IA ;
- protection web par cookie/CSRF et mobile par Bearer token.

### Frontend web

- espaces etudiant, entreprise et admin ;
- offres, candidatures, CV et composants IA.

### Mobile React Native

- fondation Expo et TypeScript ;
- authentification reelle et SecureStore ;
- dashboard etudiant, profil et offres reels ;
- recommandations, recherche et filtres ;
- detail d'offre, compatibilite IA explicite et candidature reelle ;
- verification des doublons et suivi des candidatures.
- liste mobile avec recherche, filtres et detail de candidature ;
- synchronisation des compteurs apres candidature.
- Skill Gap Simulator mobile avec modes, cache de session et parcours conseille.
- Career Assistant V2 mobile avec questions ciblees et historique de session.

### IA

- Matching V3 et Evidence Checker ;
- Career Signal Map et Decision Trace ;
- Skill Gap Simulator, Career Assistant, Motivation Letter et RAG V2.

## Court terme

- ajouter une route de lecture seule pour les matchings enregistres ;
- paginer et filtrer les offres cote backend ;
- enrichir le modele d'offre avec deadline, missions, contrat et remuneration ;
- ajouter un historique de statuts et, si le metier le valide, un retrait
  etudiant protege ;
- ajouter des tests mobiles et E2E.

## Moyen terme

- connecter upload CV et autres modules IA avances dans `mobile-app` ;
- optimiser les recommandations pour eviter le calcul de toutes les offres ;
- completer Docker Compose, monitoring et qualite IA.

## Long terme

- deploiement cloud et CI/CD ;
- boucle de feedback utilisateur ;
- observabilite RAG et stockage vectoriel adapte au volume.

## Limites actuelles

- schema d'offre encore minimal ;
- endpoint de recommandations couteux lorsque le nombre d'offres augmente ;
- pas de lecture seule du dernier matching ;
- candidatures sans pagination, endpoint detail ou historique de statut ;
- upload CV, lettre de motivation et modules IA mobiles restants non developpes ;
- tests E2E navigateur non integres.
