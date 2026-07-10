# Roadmap

## Déjà réalisé

### Backend

- Express API, Prisma et PostgreSQL ;
- authentification, rôles et profils ;
- offres, candidatures et CV ;
- proxy IA et routes admin.

### Frontend web

- React / Vite ;
- espaces étudiant, entreprise et admin ;
- offres, candidatures et CV ;
- composants IA et simulateurs.

### Mobile React Native

- fondation Expo / TypeScript ;
- authentification réelle et SecureStore ;
- dashboard étudiant connecté ;
- offres publiées, recommandations et aperçu matching ;
- recherche et filtres simples ;
- détail d'offre préparé.

### IA

- Matching V3 et Evidence Checker ;
- Career Signal Map et Decision Trace ;
- Skill Gap Simulator et Offer Quality Analyzer ;
- Career Assistant V2 et Motivation Letter V2 ;
- RAG V2, Orchestrator V2 et AI Evaluation Suite.

### Documentation

- documentation technique dans `docs/` ;
- README par module.

## Court terme

- ajouter des tests E2E navigateur ;
- consolider les pages placeholder restantes ;
- améliorer les messages d'erreur utilisateur ;
- enrichir les seeds de démonstration ;
- optimiser le bundle frontend ;
- connecter les candidatures mobiles.

## Moyen terme

- compléter le CV et les modules IA de `mobile-app` ;
- industrialiser `devops` ;
- préparer Docker Compose complet ;
- ajouter monitoring backend/IA ;
- ajouter tableaux de bord qualité IA.

## Long terme

- déploiement cloud et CI/CD ;
- feedback loop utilisateur ;
- amélioration continue des scores ;
- meilleure observabilité RAG ;
- intégration d'un vrai stockage vectoriel si nécessaire.

## Limites actuelles

- candidature et modules IA mobiles avancés non développés ;
- offres backend non paginées ;
- endpoint de recommandations coûteux lorsque le nombre d'offres augmente ;
- devops non finalisé ;
- tests E2E navigateur non intégrés ;
- scoring IA dépendant de la qualité des données.
