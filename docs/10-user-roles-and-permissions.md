# Rôles et permissions

## Rôles

SmartIntern AI définit trois rôles principaux :

- `STUDENT` ;
- `COMPANY` ;
- `ADMIN`.

Ces rôles existent dans le modèle Prisma `UserRole` et sont utilisés côté backend avec `authorizeRoles`.

## STUDENT

### Autorisé

- accéder à l'espace étudiant ;
- gérer son profil ;
- uploader et consulter ses CV ;
- consulter les offres publiées ;
- lancer un matching sur une offre ;
- postuler ;
- consulter ses candidatures ;
- générer des conseils carrière ;
- générer ou modifier une lettre de motivation ;
- utiliser le Skill Gap Simulator.

### Interdit

- créer ou modifier une offre entreprise ;
- consulter les candidatures reçues par une entreprise ;
- accéder aux pages admin ;
- lancer l'analyse qualité d'une offre via le proxy entreprise.

## COMPANY

### Autorisé

- accéder à l'espace entreprise ;
- gérer son profil ;
- créer, modifier, archiver ses offres ;
- consulter les candidatures reçues sur ses offres ;
- modifier le statut d'une candidature ;
- consulter le ranking candidat ;
- utiliser Offer Quality Analyzer.

### Interdit

- gérer les CV étudiants hors candidatures ;
- accéder à l'espace étudiant ;
- accéder aux routes admin ;
- utiliser les endpoints strictement étudiant comme `/api/students/career-assistant`.

## ADMIN

### Autorisé

- accéder à `/admin/*` ;
- consulter dashboard admin ;
- consulter utilisateurs ;
- mettre à jour le statut d'un utilisateur ;
- consulter entreprises ;
- mettre à jour le statut d'une entreprise ;
- accéder aux routes RAG admin ;
- utiliser certains endpoints IA proxy.

## Frontend

Les routes privées sont protégées par `ProtectedRoute` et les layouts dédiés :

- `/student/*` pour `STUDENT` ;
- `/company/*` pour `COMPANY` ;
- `/admin/*` pour `ADMIN`.

## Backend

Chaque route sensible combine :

```js
protect
authorizeRoles(...)
```

`protect` vérifie l'identité, puis `authorizeRoles` vérifie le rôle.

