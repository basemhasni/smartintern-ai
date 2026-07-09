# Endpoints API

Cette page documente les endpoints principaux observés dans `backend-api/src/routes` et `ai-service/app/api`.

## Backend API

### Health

| Méthode | URL | Accès | Description |
| --- | --- | --- | --- |
| GET | `/health` | public | Vérifie que le backend répond |

### Auth

| Méthode | URL | Accès | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | public + CSRF | Inscription |
| POST | `/api/auth/login` | public + CSRF | Connexion |
| POST | `/api/auth/forgot-password` | public + CSRF | Demande reset password |
| POST | `/api/auth/reset-password` | public + CSRF | Réinitialisation mot de passe |
| POST | `/api/auth/logout` | authentifié + CSRF | Déconnexion |
| GET | `/api/auth/csrf-token` | public | Génère un token CSRF |
| GET | `/api/auth/me` | authentifié | Retourne l'utilisateur courant |

### Étudiant

| Méthode | URL | Accès | Description |
| --- | --- | --- | --- |
| GET | `/api/students/profile` | STUDENT | Profil étudiant |
| PUT | `/api/students/profile` | STUDENT + CSRF | Mise à jour profil |
| GET | `/api/students/recommendations` | STUDENT | Recommandations |
| POST | `/api/students/career-assistant` | STUDENT + CSRF | Conseil carrière |

### CV

| Méthode | URL | Accès | Description |
| --- | --- | --- | --- |
| POST | `/api/students/cv/upload` | STUDENT + CSRF | Upload CV |
| GET | `/api/students/cv` | STUDENT | Liste CV |
| GET | `/api/students/cv/:id` | STUDENT | Détail CV |
| DELETE | `/api/students/cv/:id` | STUDENT + CSRF | Suppression CV |

### Entreprise

| Méthode | URL | Accès | Description |
| --- | --- | --- | --- |
| GET | `/api/companies/profile` | COMPANY | Profil entreprise |
| PUT | `/api/companies/profile` | COMPANY + CSRF | Mise à jour profil |

### Offres

| Méthode | URL | Accès | Description |
| --- | --- | --- | --- |
| GET | `/api/offers` | public | Offres publiées |
| GET | `/api/offers/:id` | public | Détail offre publiée |
| GET | `/api/offers/:id/match` | STUDENT | Matching IA pour une offre |
| POST | `/api/offers/:offerId/apply` | STUDENT + CSRF | Postuler |
| POST | `/api/companies/offers` | COMPANY + CSRF | Créer offre |
| GET | `/api/companies/offers` | COMPANY | Offres de l'entreprise |
| GET | `/api/companies/offers/:id` | COMPANY | Détail offre entreprise |
| PUT | `/api/companies/offers/:id` | COMPANY + CSRF | Modifier offre |
| DELETE | `/api/companies/offers/:id` | COMPANY + CSRF | Archiver offre |

### Candidatures

| Méthode | URL | Accès | Description |
| --- | --- | --- | --- |
| GET | `/api/students/applications` | STUDENT | Candidatures étudiant |
| GET | `/api/companies/offers/:offerId/applications` | COMPANY | Candidatures reçues |
| PUT | `/api/applications/:id/status` | COMPANY + CSRF | Changer statut candidature |

### Lettre de motivation

| Méthode | URL | Accès | Description |
| --- | --- | --- | --- |
| POST | `/api/applications/:applicationId/generate-letter` | STUDENT + CSRF | Générer lettre |
| GET | `/api/applications/:applicationId/motivation-letter` | STUDENT | Lire lettre |
| PUT | `/api/applications/:applicationId/motivation-letter` | STUDENT + CSRF | Modifier lettre |

### Classement candidat

| Méthode | URL | Accès | Description |
| --- | --- | --- | --- |
| GET | `/api/companies/offers/:offerId/candidates/ranking` | COMPANY | Ranking candidat |

### AI proxy

| Méthode | URL | Accès | Description |
| --- | --- | --- | --- |
| POST | `/api/ai/analyze-offer-quality` | COMPANY, ADMIN + CSRF | Analyse qualité offre |
| POST | `/api/ai/skill-gap-simulator` | STUDENT, ADMIN + CSRF | Simulation de gaps |
| POST | `/api/ai/orchestrate` | STUDENT, COMPANY, ADMIN + CSRF | Orchestration IA |

### RAG

| Méthode | URL | Accès | Description |
| --- | --- | --- | --- |
| POST | `/api/rag/search` | STUDENT, COMPANY, ADMIN + CSRF | Recherche RAG |
| POST | `/api/rag/ask` | STUDENT, COMPANY, ADMIN + CSRF | Question RAG |
| POST | `/api/rag/reindex` | ADMIN + CSRF | Réindexation globale |
| POST | `/api/rag/reindex/:ownerType/:ownerId` | ADMIN + CSRF | Réindexation ciblée |
| GET | `/api/rag/documents` | ADMIN | Liste documents |
| GET | `/api/rag/documents/:id` | ADMIN | Détail document |

### Admin

| Méthode | URL | Accès | Description |
| --- | --- | --- | --- |
| GET | `/api/admin/dashboard` | ADMIN | Dashboard admin |
| GET | `/api/admin/users` | ADMIN | Liste utilisateurs |
| PATCH | `/api/admin/users/:userId/status` | ADMIN + CSRF | Statut utilisateur |
| GET | `/api/admin/companies` | ADMIN | Liste entreprises |
| PATCH | `/api/admin/companies/:companyId/status` | ADMIN + CSRF | Statut entreprise |

## AI-service

| Méthode | URL | Description |
| --- | --- | --- |
| GET | `/ai/health` | Santé du service IA |
| POST | `/ai/analyze-cv` | Analyse CV |
| POST | `/ai/analyze-offer` | Analyse offre |
| POST | `/ai/analyze-offer-quality` | Analyse qualité offre |
| POST | `/ai/match` | Matching V3 |
| POST | `/ai/generate-letter` | Lettre de motivation |
| POST | `/ai/career-advice` | Career Assistant |
| POST | `/ai/orchestrate` | Orchestrateur historique |
| POST | `/ai/orchestrate/v2` | Orchestrator V2 |
| POST | `/ai/skill-gap-simulator` | Skill Gap Simulator |
| POST | `/ai/rag/embed` | Embedding compatible |
| POST | `/ai/rag/chunk` | Chunking compatible |
| POST | `/ai/rag/search-demo` | Démo recherche |
| POST | `/ai/rag/answer` | Réponse RAG |
| POST | `/ai/rag/v2/index-document` | Indexation document V2 |
| POST | `/ai/rag/v2/embed` | Embedding V2 |
| POST | `/ai/rag/v2/chunk` | Chunking V2 |
| POST | `/ai/rag/v2/retrieve` | Retrieval V2 |
| POST | `/ai/rag/v2/answer` | Réponse grounded V2 |


## Note auth mobile

Pour React Native / Expo :

| Methode | URL | Acces mobile | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `X-Client-Type: mobile` | Inscription etudiant, retourne `accessToken` seulement au mobile |
| POST | `/api/auth/login` | `X-Client-Type: mobile` | Connexion, retourne `accessToken` seulement au mobile |
| POST | `/api/auth/forgot-password` | `X-Client-Type: mobile` | Demande reset password avec message generique |
| GET | `/api/auth/me` | `Authorization: Bearer <token>` | Restaure l'utilisateur courant |
| POST | `/api/auth/logout` | `Authorization: Bearer <token>` | Deconnexion mobile et nettoyage local cote app |

Le web garde cookie HttpOnly + CSRF. Le mobile utilise Bearer token stocke via SecureStore.
