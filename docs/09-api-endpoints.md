# Endpoints API

Cette page documente les endpoints principaux observés dans `backend-api/src/routes` et `ai-service/app/api`.

## Backend API

### Health

| Méthode | URL | Accès | Description |
| --- | --- | --- | --- |
| GET | `/health` | public | Vérifie que le backend répond |
| GET | `/health/ai` | public | Diagnostic HTTP court du service IA |

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

#### Career Assistant mobile

`POST /api/students/career-assistant` accepte
`{ "offerId": "...", "question": "..." }`. `question` est optionnelle et limitee
a 500 caracteres. Le web utilise cookie et CSRF; le mobile utilise Bearer avec
`X-Client-Type: mobile`.

Le backend derive l'etudiant du token, charge le CV analyse et l'offre publiee,
genere le Matching V3, filtre les sources RAG autorisees et appelle
`POST /ai/career-advice`. Le client ne transmet jamais `studentId`, CV, matching,
prompt interne ou contexte RAG.

### CV

| Méthode | URL | Accès | Description |
| --- | --- | --- | --- |
| POST | `/api/students/cv/upload` | STUDENT + CSRF | Upload CV |
| GET | `/api/students/cv` | STUDENT | Liste CV |
| GET | `/api/students/cv/:id` | STUDENT | Détail CV |
| DELETE | `/api/students/cv/:id` | STUDENT + CSRF | Suppression CV |

L'upload attend le champ multipart `cv`, accepte PDF/DOCX jusqu'a 5 Mo et lance
l'analyse CV automatiquement. Il cree une nouvelle entree ; la liste est
ordonnee du CV le plus recent au plus ancien. Une taille excessive retourne
`413` et un format non supporte `415`.

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
| POST | `/api/offers/:id/skill-gap-simulation` | STUDENT | Simulation securisee des axes de progression |
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
| GET | `/api/applications/motivation-letters` | STUDENT | Lister les lettres de l'étudiant connecté |
| POST | `/api/applications/:applicationId/generate-letter` | STUDENT + CSRF | Générer lettre |
| GET | `/api/applications/:applicationId/motivation-letter` | STUDENT | Lire lettre |
| PUT | `/api/applications/:applicationId/motivation-letter` | STUDENT + CSRF | Modifier lettre (10 000 caractères maximum) |

La génération accepte uniquement le champ `tone` avec `PROFESSIONAL`,
`DYNAMIC` ou `SIMPLE`. Elle crée ou remplace automatiquement la lettre unique
liée à la candidature. Une modification manuelle positionne
`generatedByAI=false`. Pour le client mobile authentifié par Bearer, le
middleware CSRF ignore les requêtes portant `X-Client-Type: mobile`.

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
| GET | `/health` | Santé du service IA, sans workflow |
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

## Note mobile - detail et candidature

- `GET /api/offers/:id/match` calcule puis enregistre un Matching V3 ; ce n'est
  pas une route de lecture seule du dernier resultat ;
- `GET /api/students/applications` permet au mobile de detecter une candidature
  existante par `offerId` ;
- `POST /api/offers/:offerId/apply` accepte `{}` ou un champ `message` optionnel ;
- le statut initial est `SENT` ;
- Prisma impose l'unicite `(studentId, offerId)` et l'API retourne `409` pour un
  doublon ;
- `X-Client-Type: mobile` conserve le flux Bearer mobile, tandis que le web garde
  sa protection cookie HttpOnly et CSRF.

## Note mobile - suivi des candidatures

`GET /api/students/applications` retourne actuellement une liste complete, sans
pagination ni parametres de recherche ou statut. Chaque element contient les
champs de candidature et une offre partielle avec `id`, `title`, `location`,
`duration`, `status` et `company { id, companyName }`.

Il n'existe pas de route etudiant pour lire une candidature par identifiant, ni
d'historique de statut, ni d'endpoint de retrait. Le client mobile construit le
detail depuis son state global et n'affiche que `appliedAt` et `updatedAt`.

## Note mobile - explicabilite IA

Le dashboard IA reutilise les matchings complets renvoyes par
`GET /api/students/recommendations`, puis appelle explicitement
`GET /api/offers/:id/match` lorsqu'une nouvelle analyse est demandee. Cette route
est protegee `STUDENT`, construit les donnees CV/offre cote backend et appelle le
Matching V3 existant. Aucun payload mobile n'est requis.

Il n'existe pas encore de route permettant de relire toute l'explicabilite V3
persistee. La table `MatchingResult` conserve le resume legacy, mais pas Skill
Evidence Map, Career Signal Map ou Decision Trace.

## Note mobile - Skill Gap Simulator

`POST /api/offers/:id/skill-gap-simulation` accepte uniquement un corps
`{ "mode": "CONSERVATIVE|REALISTIC|OPTIMISTIC" }`. La route, protegee pour le
role `STUDENT`, reconstruit le matching depuis l'utilisateur authentifie et
l'offre cible, puis appelle le simulateur existant via `ai-service`.

Le mobile ne transmet jamais de `matchingResult`. La reponse conserve les champs
reels du simulateur : scores, gaps, simulations, parcours, projets, plafonds,
warnings et hypotheses.
