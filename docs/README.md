# Documentation SmartIntern AI

Ce dossier regroupe la documentation principale du projet SmartIntern AI. Elle est organisée pour un double usage :

- présenter clairement le projet dans un contexte PFE ;
- permettre à un développeur de reprendre le code sans repartir de zéro.

## Index

| Fichier | Objectif |
| --- | --- |
| [00-overview.md](00-overview.md) | Vue d'ensemble du projet et de sa valeur ajoutée |
| [01-functional-specification.md](01-functional-specification.md) | Spécification fonctionnelle par rôle utilisateur |
| [02-technical-architecture.md](02-technical-architecture.md) | Architecture technique globale |
| [03-backend-api.md](03-backend-api.md) | Documentation du backend Express / Prisma |
| [04-frontend-web.md](04-frontend-web.md) | Documentation du frontend React / Vite |
| [05-ai-service.md](05-ai-service.md) | Documentation du service IA FastAPI |
| [06-ai-architecture.md](06-ai-architecture.md) | Architecture IA détaillée |
| [07-auth-security.md](07-auth-security.md) | Authentification, cookies HttpOnly, CSRF et sécurité |
| [08-database-model.md](08-database-model.md) | Modèle de données Prisma |
| [09-api-endpoints.md](09-api-endpoints.md) | Endpoints backend et ai-service |
| [10-user-roles-and-permissions.md](10-user-roles-and-permissions.md) | Rôles et permissions |
| [11-ai-features.md](11-ai-features.md) | Fonctionnalités IA expliquées simplement |
| [12-rag-and-orchestration.md](12-rag-and-orchestration.md) | RAG V2 et Orchestrator V2 |
| [13-testing-and-quality.md](13-testing-and-quality.md) | Tests, évaluations et qualité |
| [14-local-setup.md](14-local-setup.md) | Installation locale |
| [15-demo-guide.md](15-demo-guide.md) | Guide de démonstration PFE |
| [16-troubleshooting.md](16-troubleshooting.md) | Problèmes fréquents et solutions |
| [17-roadmap.md](17-roadmap.md) | Roadmap et limites restantes |

## Documentation complémentaire

- [../README.md](../README.md) : présentation racine du projet.
- [../backend-api/README.md](../backend-api/README.md) : prise en main backend.
- [../frontend-web/README.md](../frontend-web/README.md) : prise en main frontend.
- [../ai-service/README.md](../ai-service/README.md) : prise en main service IA.
- [../DEV_TESTING_GUIDE.md](../DEV_TESTING_GUIDE.md) : guide de tests de développement, si présent sur la branche.
- [devops/01-docker-images.md](devops/01-docker-images.md) : images Docker applicatives.
- [devops/02-postgres-pgvector.md](devops/02-postgres-pgvector.md) : PostgreSQL et pgvector.
- [devops/03-docker-compose.md](devops/03-docker-compose.md) : stack Docker Compose.
- [devops/04-jenkins-ci.md](devops/04-jenkins-ci.md) : intégration continue Jenkins.
- [devops/05-dockerhub-registry.md](devops/05-dockerhub-registry.md) : publication Docker Hub depuis Jenkins.
- [devops/06-sonarqube-quality-gate.md](devops/06-sonarqube-quality-gate.md) : analyse SonarQube et Quality Gate Jenkins bloquant.

