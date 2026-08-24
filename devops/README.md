# DevOps - SmartIntern AI

Le dossier `devops` est prévu pour regrouper les éléments de déploiement et d'industrialisation.

## Statut actuel

Le projet dispose d'images Docker, d'une stack Compose, d'une CI Jenkins avec
Quality Gate SonarQube, d'une publication Docker Hub et d'un déploiement local
Kubernetes dans le profil Minikube `smartintern-ai`.

## Objectifs futurs

- déploiement cloud ;
- stratégie CD de production ;
- monitoring ;
- logs centralisés.

## Points d'attention

- ne jamais versionner de secrets ;
- utiliser des `.env.example` ;
- activer `AUTH_COOKIE_SECURE=true` en production ;
- configurer CORS avec les vraies origines ;
- vérifier SMTP et base PostgreSQL.

## Documentation liée

Voir [../docs/14-local-setup.md](../docs/14-local-setup.md), [../docs/16-troubleshooting.md](../docs/16-troubleshooting.md) et [../docs/17-roadmap.md](../docs/17-roadmap.md).

