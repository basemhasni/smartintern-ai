# Contexte du projet SmartIntern AI

## Description du projet

SmartIntern AI est une plateforme PFE destinee a faciliter la gestion des stages et le matching entre etudiants et entreprises.

La plateforme devra permettre, progressivement, de gerer les utilisateurs, les profils etudiants, les entreprises, les offres de stage, les candidatures et les recommandations intelligentes.

## Regles techniques

- Respecter la stack prevue.
- Developper le projet module par module.
- Ne pas ajouter de technologie non validee.
- Ne pas initialiser un framework avant la phase correspondante.
- Garder une architecture lisible et evolutive.
- Separar clairement les responsabilites entre backend, frontend, IA, mobile, base de donnees et DevOps.

## Architecture prevue

- `backend-api/` : API Node.js avec Express.js, puis Prisma ORM.
- `frontend-web/` : interface web React.js avec Vite et Tailwind CSS.
- `ai-service/` : service IA Python avec FastAPI.
- `mobile-app/` : application mobile Flutter.
- `database/` : scripts, schemas et ressources lies a PostgreSQL.
- `devops/` : configuration Docker, Docker Compose et CI/CD.
- `docs/` : documentation fonctionnelle et technique.

## Regles de developpement

- Suivre l'ordre de developpement defini dans le README.
- Valider chaque module avant de passer au suivant.
- Garder les commits petits et explicites.
- Documenter les decisions techniques importantes.
- Ajouter les tests progressivement selon le module implemente.
- Ne pas melanger plusieurs phases dans une meme tache.

## Regle importante

Une tache = un module = un test = un commit.

