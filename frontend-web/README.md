# SmartIntern AI Frontend

Frontend React/Vite de SmartIntern AI.

Le design principal est base sur les captures Google Stitch placees dans :

```text
frontend-web/design-references/stitch/
frontend-web/design-references/stitch/auth/
frontend-web/design-references/stitch/student-dashboard/
```

## Installation

```bash
cd frontend-web
npm install
```

## Lancement

```bash
npm run dev
```

URL frontend :

```text
http://localhost:5173
```

URL backend :

```text
http://localhost:5000
```

## Variables d'environnement

Creer `frontend-web/.env` si necessaire :

```text
VITE_API_BASE_URL=http://localhost:5000
```

Le fichier `.env` est ignore par Git. Seul `.env.example` doit etre versionne.

## Architecture auth

```text
src/
├── api/
│   ├── axiosClient.js
│   └── studentApi.js
├── auth/
│   ├── AuthContext.jsx
│   └── ProtectedRoute.jsx
├── components/
│   ├── auth/
│   ├── common/
│   ├── landing/
│   ├── layout/
│   └── student/
├── pages/
│   └── student/
├── routes/
└── utils/
```

`AuthContext` expose `user`, `token`, `role`, `isAuthenticated`, `isLoading`, `login`, `register`, `logout` et `refreshUser`.

Au chargement, le frontend relit le token local, appelle `GET /api/auth/me`, puis restaure ou supprime la session selon la validite du token.

### Stockage local

```text
smartintern_token
smartintern_user
```

Le mot de passe n'est jamais stocke.

### Axios

`src/api/axiosClient.js` configure :

- `baseURL = VITE_API_BASE_URL || http://localhost:5000`
- timeout de `10000 ms`
- header automatique `Authorization: Bearer <token>`
- suppression de session sur erreur `401`

Les erreurs `400`, `403`, `409` et `500` restent accessibles aux pages pour afficher des messages utiles.

## Endpoints backend utilises

Auth :

```text
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

Dashboard etudiant :

```text
GET /api/students/profile
PUT /api/students/profile
GET /api/students/cv
GET /api/students/cv/:id
POST /api/students/cv/upload
DELETE /api/students/cv/:id
GET /api/students/applications
GET /api/students/recommendations?limit=3&minScore=0
GET /api/offers
GET /api/offers/:id
GET /api/offers/:id/match
POST /api/offers/:offerId/apply
POST /api/applications/:applicationId/generate-letter
GET /api/applications/:applicationId/motivation-letter
PUT /api/applications/:applicationId/motivation-letter
```

`src/api/studentApi.js` centralise ces appels et retourne uniquement les donnees utiles a l'interface.

## Redirection selon le role

```text
STUDENT -> /student/dashboard
COMPANY -> /company/dashboard
ADMIN   -> /admin/dashboard
```

La fonction centralisee se trouve dans `src/utils/auth.js`.

## Routes

```text
/                         Landing page
/login                    Connexion
/register                 Inscription publique
/dashboard                Redirection automatique selon le role
/student/dashboard        Dashboard etudiant connecte
/student/profile          Profil etudiant connecte
/student/cv               Page CV connectee
/student/offers           Liste des offres et recommandations
/student/offers/:offerId  Detail d'une offre
/student/applications     Mes candidatures connectees
/student/career-assistant Placeholder assistant carriere
/company/dashboard        Route protegee COMPANY
/admin/dashboard          Route protegee ADMIN
/access-denied            Role non autorise
*                         Page 404
```

Important : l'inscription publique propose uniquement `STUDENT` et `COMPANY`. Le role `ADMIN` n'est jamais disponible dans l'interface publique.

## StudentLayout

Le layout etudiant se compose de :

- `AppSidebar.jsx` pour la navigation desktop.
- `MobileSidebar.jsx` pour le drawer mobile accessible.
- `AppHeader.jsx` pour le titre de page, le menu mobile, l'utilisateur et logout.
- `StudentLayout.jsx` pour envelopper toutes les pages `/student/*`.

La navigation contient : Dashboard, Mon profil, Mon CV, Offres, Mes candidatures et Assistant carriere.

## Page profil etudiant

`/student/profile` permet a un etudiant connecte de consulter et modifier son profil.

Fichiers principaux :

```text
src/pages/student/StudentProfilePage.jsx
src/components/student/ProfileForm.jsx
src/components/student/ProfileSummaryCard.jsx
src/components/student/ProfileCompletionDetails.jsx
```

Champs affiches en lecture seule :

```text
firstName
lastName
email
role
```

Champs modifiables :

```text
phone
location
educationLevel
targetJob
bio
availabilityDate
```

Le formulaire :

- charge `GET /api/students/profile` au montage ;
- valide les champs cote frontend avant l'appel API ;
- envoie uniquement les champs autorises avec `PUT /api/students/profile` ;
- transforme les champs vides en `null` ;
- affiche un message de succes temporaire ;
- detecte les modifications non enregistrees ;
- propose un bouton `Annuler les modifications`.

Validation frontend :

- `location`, `educationLevel`, `targetJob` : 120 caracteres maximum ;
- `bio` : 500 caracteres maximum avec compteur ;
- `availabilityDate` : date valide si fournie ;
- `phone` : optionnel, validation volontairement souple.

## Page Mon CV

`/student/cv` permet a un etudiant connecte de consulter, importer, analyser et supprimer ses CV.

Fichiers principaux :

```text
src/pages/student/StudentCvPage.jsx
src/api/studentCvApi.js
src/components/student/cv/CvUploadZone.jsx
src/components/student/cv/CvUploadProgress.jsx
src/components/student/cv/CvAnalysisResult.jsx
src/components/student/cv/CvSummaryCard.jsx
src/components/student/cv/CvSkillsSection.jsx
src/components/student/cv/CvHistoryList.jsx
src/components/student/cv/CvHistoryItem.jsx
src/components/student/cv/CvDeleteDialog.jsx
src/components/student/cv/CvEmptyState.jsx
```

Endpoints utilises :

```text
GET    /api/students/cv
GET    /api/students/cv/:id
POST   /api/students/cv/upload
DELETE /api/students/cv/:id
```

Upload :

- requete `multipart/form-data` ;
- champ form-data obligatoire : `cv` ;
- formats acceptes : `.pdf` et `.docx` ;
- types MIME acceptes : `application/pdf` et `application/vnd.openxmlformats-officedocument.wordprocessingml.document` ;
- limite : `5 Mo` ;
- `Content-Type` n'est pas defini manuellement afin de laisser Axios et le navigateur generer la boundary multipart.

La page affiche :

- progression reelle de l'upload HTTP ;
- etat indetermine pour l'extraction et l'analyse IA ;
- resume IA si `analysisJson.summary` existe ;
- competences detectees depuis `analysisJson.skills` ;
- niveau d'experience avec traduction simple ;
- apercu replie du `parsedText`, limite a environ 500 caracteres ;
- statut RAG non bloquant via `ragIndexed` apres upload ;
- historique des CV trie par `uploadedAt` descendant ;
- confirmation accessible avant suppression.

Si `ai-service` est indisponible, le backend peut retourner `CV uploaded successfully, but AI analysis failed`. Le frontend traite ce cas comme un upload reussi avec analyse incomplete.

## Page Offres etudiant

`/student/offers` affiche les recommandations personnalisees et les offres publiees.

Fichiers principaux :

```text
src/pages/student/StudentOffersPage.jsx
src/pages/student/StudentOfferDetailPage.jsx
src/api/offersApi.js
src/api/applicationsApi.js
src/utils/offers.js
src/components/student/offers/
```

Endpoints utilises :

```text
GET  /api/offers
GET  /api/offers/:id
GET  /api/students/recommendations?limit=50&minScore=0
GET  /api/offers/:id/match
GET  /api/students/applications
POST /api/offers/:offerId/apply
```

Fonctionnement :

- les recommandations sont chargees en parallele avec les offres publiees et les candidatures ;
- si les recommandations echouent parce qu'aucun CV n'est analyse, les offres publiques restent visibles ;
- les recommandations sont fusionnees avec les offres publiees sans doublon par `offer.id` ;
- chaque offre recoit des proprietes frontend calculees : `isRecommended`, `hasApplied`, `matching` ;
- les filtres sont realises cote frontend pour cette version.

Recherche et filtres :

- recherche par titre, entreprise, description, localisation et competences ;
- affichage `Toutes` ou `Recommandees` ;
- filtre localisation ;
- filtre duree ;
- score minimum : tous, 50%, 70%, 80% ;
- tri : meilleure compatibilite, plus recentes, titre A-Z.

Detail d'offre :

- charge `GET /api/offers/:id` ;
- calcule le matching via `GET /api/offers/:id/match` ;
- garde l'offre visible si le matching echoue ;
- affiche score, competences correspondantes, competences a developper et explication IA ;
- permet de postuler avec un message optionnel.

Candidature :

- la modale envoie `POST /api/offers/:offerId/apply` ;
- le message est optionnel et limite a 500 caracteres ;
- l'erreur `409` est traitee comme une candidature deja existante ;
- apres succes, le bouton devient `Candidature envoyee`.

## Page Mes candidatures

`/student/applications` permet a un etudiant de suivre ses candidatures et de gerer les lettres de motivation associees.

Fichiers principaux :

```text
src/pages/student/StudentApplicationsPage.jsx
src/api/applicationsApi.js
src/api/motivationLettersApi.js
src/utils/applications.js
src/components/student/applications/
```

Endpoints utilises :

```text
GET  /api/students/applications
POST /api/applications/:applicationId/generate-letter
GET  /api/applications/:applicationId/motivation-letter
PUT  /api/applications/:applicationId/motivation-letter
```

Normalisation :

- `normalizeApplication(application)` adapte la reponse backend vers une structure frontend stable ;
- `offer` et `company` peuvent etre absents partiellement sans casser l'interface ;
- `compatibilityScore` est affiche seulement s'il existe ;
- les statuts sont traduits via `getApplicationStatusLabel`.

Fonctionnalites :

- statistiques par statut ;
- recherche par offre, entreprise, localisation, secteur et message ;
- filtres par statut ;
- tri par date recente, date ancienne, score et entreprise A-Z ;
- panneau de detail sans requete supplementaire par candidature ;
- timeline simple basee sur le statut actuel ;
- navigation vers `/student/offers/:offerId` ;
- lien futur vers `/student/career-assistant?offerId=<id>`.

Lettres de motivation :

- les lettres ne sont pas chargees au montage ;
- `GET /api/applications/:applicationId/motivation-letter` est appele uniquement au clic ;
- `404` affiche un etat vide avec action de generation ;
- generation avec les tons `PROFESSIONAL`, `DYNAMIC`, `SIMPLE` ;
- edition manuelle avec textarea et dirty state ;
- copie via `navigator.clipboard` si disponible.

Erreurs gerees :

- aucune lettre existante ;
- CV analyse manquant pour generer ;
- service IA indisponible ;
- backend indisponible ;
- candidature non autorisee.

## Dashboard etudiant

`StudentDashboardPage.jsx` charge les donnees avec `Promise.allSettled` :

- le profil est indispensable ;
- une erreur CV n'empeche pas l'affichage des candidatures ;
- une erreur recommandations n'empeche pas l'affichage du profil ;
- chaque section affiche son propre etat loading, error ou empty.

Composants principaux :

- `StudentStatsGrid`
- `ProfileCompletionCard`
- `CvStatusCard`
- `RecommendedOffersPreview`
- `ApplicationStatusSummary`
- `SkillsOverview`
- `StudentQuickActions`

## Calcul de completion

Le score de completion du profil est une estimation frontend basee sur :

```text
phone
location
educationLevel
targetJob
bio
availabilityDate
```

Les champs obligatoires de `User` ne sont pas comptes comme manquants.

## Normalisation des donnees

Les utilitaires dans `src/utils/formatters.js` et `src/utils/studentDashboard.js` gerent :

- dates nulles ou invalides ;
- tailles de fichiers ;
- `analysisJson` objet, string JSON ou null ;
- listes de competences absentes ;
- scores string ou number ;
- statuts de candidature traduits en francais.

## Tests manuels

1. Lancer `backend-api` sur `http://localhost:5000`.
2. Lancer le frontend sur `http://localhost:5173`.
3. Se connecter avec un compte `STUDENT`.
4. Verifier la redirection vers `/student/dashboard`.
5. Verifier le chargement du profil.
6. Tester le cas sans CV.
7. Tester le cas avec CV non analyse.
8. Tester le cas avec CV analyse.
9. Tester sans recommandations.
10. Tester avec plusieurs recommandations.
11. Tester sans candidatures.
12. Tester avec candidatures `SENT`, `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`.
13. Arreter le backend et verifier les messages d'erreur.
14. Tester le cas ou une API secondaire echoue.
15. Tester un token expire ou invalide.
16. Actualiser le navigateur et verifier la restauration de session.
17. Naviguer dans la sidebar.
18. Tester le responsive mobile.
19. Tester la navigation clavier.

Tests profil etudiant :

1. Se connecter avec un compte `STUDENT`.
2. Ouvrir `/student/profile`.
3. Verifier le chargement du profil.
4. Modifier le telephone.
5. Modifier la localisation.
6. Modifier le niveau d'etudes.
7. Modifier l'objectif metier.
8. Modifier la bio.
9. Modifier la date de disponibilite.
10. Enregistrer et verifier le message de succes.
11. Actualiser le navigateur et verifier que les donnees restent.
12. Modifier un champ puis cliquer sur `Annuler les modifications`.
13. Tester une bio de plus de 500 caracteres.
14. Arreter le backend et verifier le message reseau.
15. Tester l'acces avec un compte `COMPANY` et verifier le refus.
16. Tester le responsive mobile.
17. Tester la navigation clavier.

Tests CV :

1. Ouvrir `/student/cv` avec un compte `STUDENT`.
2. Verifier l'etat sans CV.
3. Uploader un PDF valide.
4. Uploader un DOCX valide.
5. Tester un fichier de plus de 5 Mo.
6. Tester une extension invalide.
7. Tester un MIME invalide.
8. Cliquer sur analyser sans fichier.
9. Tester avec `ai-service` actif.
10. Tester avec `ai-service` arrete.
11. Verifier `analysisJson` objet.
12. Verifier `analysisJson` string JSON si present.
13. Verifier un CV sans `analysisJson`.
14. Verifier plusieurs CV.
15. Selectionner un CV dans l'historique.
16. Annuler une suppression.
17. Confirmer une suppression.
18. Arreter le backend.
19. Actualiser le navigateur.
20. Naviguer vers `/student/offers` apres analyse.
21. Tester responsive mobile.
22. Tester navigation clavier et modale au clavier.
23. Tester l'acces avec un token `COMPANY`.

Tests offres :

1. Ouvrir `/student/offers` avec un compte `STUDENT`.
2. Tester avec un CV analyse.
3. Tester sans CV analyse.
4. Verifier les recommandations.
5. Verifier les offres publiques.
6. Rechercher par titre.
7. Rechercher par competence.
8. Filtrer par score.
9. Filtrer les recommandations.
10. Trier par score, date et titre.
11. Ouvrir `/student/offers/:offerId`.
12. Verifier un matching valide.
13. Tester le matching sans CV.
14. Postuler avec message.
15. Postuler sans message.
16. Tester une candidature deja existante.
17. Arreter le backend.
18. Arreter `ai-service`.
19. Tester responsive mobile.
20. Tester navigation clavier et modale.
21. Tester l'acces avec un token `COMPANY`.

Tests candidatures :

1. Ouvrir `/student/applications` sans candidature.
2. Tester une candidature `SENT`.
3. Tester `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`.
4. Tester plusieurs candidatures.
5. Rechercher par offre.
6. Rechercher par entreprise.
7. Filtrer par statut.
8. Trier par date, score et entreprise.
9. Ouvrir le detail de l'offre.
10. Ouvrir une lettre inexistante.
11. Generer en ton `PROFESSIONAL`.
12. Generer en ton `DYNAMIC`.
13. Generer en ton `SIMPLE`.
14. Consulter une lettre existante.
15. Modifier manuellement la lettre.
16. Annuler une modification.
17. Copier la lettre.
18. Tester sans CV analyse.
19. Arreter `ai-service`.
20. Arreter le backend.
21. Tester token expire.
22. Tester l'acces `COMPANY`.
23. Tester responsive mobile.
24. Tester navigation clavier et fermeture par `Escape`.
25. Tester le lien assistant carriere avec `offerId`.

## Assistant carriere etudiant

Route :

- `/student/career-assistant`
- `/student/career-assistant?offerId=123` pour preselectionner une offre depuis le detail d'une offre ou une candidature.

Endpoint backend utilise :

- `POST /api/students/career-assistant`

Payload envoye :

```json
{
  "offerId": 1,
  "question": "Quelles competences dois-je ameliorer pour cette offre ?"
}
```

Sources de donnees pour le selecteur :

- `GET /api/offers` pour les offres publiees.
- `GET /api/students/recommendations?limit=10&minScore=0` pour prioriser les offres recommandees et recuperer les scores deja calcules.

La page ne lance pas de generation automatiquement au chargement. L'utilisateur choisit une offre, peut saisir une question ou laisser le champ vide, puis declenche la generation. Si `offerId` est present dans l'URL et correspond a une offre disponible, l'offre est selectionnee automatiquement.

La reponse `careerAdvice` est normalisee cote frontend pour gerer les champs absents, les listes nulles, les scores sous forme de chaine ou de nombre, les priorites inconnues et les reponses partielles. Les conseils restent uniquement dans l'etat React de la page : aucun historique persistant n'est cree tant que le backend ne fournit pas d'endpoint dedie.

Affichage RAG :

- `careerAdvice.ragInsights` est affiche sous forme de pistes courtes.
- `ragContext.documents` est affiche dans un panneau repliable avec titre, type de document et score de similarite si disponible.
- Les embeddings, metadonnees techniques brutes et contenus longs ne sont jamais affiches.

Erreurs gerees :

- Aucun CV analyse : message invitant a importer un CV.
- `offerId` absent ou invalide : selection d'offre demandee.
- Offre introuvable : message non technique.
- `ai-service` indisponible : message temporaire.
- Erreur reseau : verification backend et ai-service.

Tests assistant carriere :

1. Ouvrir `/student/career-assistant` avec un compte `STUDENT`.
2. Ouvrir `/student/career-assistant?offerId=1`.
3. Tester un `offerId` invalide.
4. Selectionner une offre recommandee.
5. Selectionner une offre publique.
6. Cliquer sur une question suggeree.
7. Envoyer une question personnalisee.
8. Envoyer sans question pour l'analyse complete.
9. Verifier le resume profil et le score.
10. Verifier les points forts.
11. Verifier les competences a developper.
12. Verifier le plan d'action.
13. Verifier le conseil final.
14. Verifier le panneau RAG avec documents.
15. Verifier le cas sans contexte RAG.
16. Tester sans CV analyse.
17. Arreter `ai-service`.
18. Arreter le backend.
19. Tester token expire.
20. Tester l'acces avec un compte `COMPANY`.
21. Tester les liens vers offre, CV, profil et candidatures.
22. Tester responsive mobile.
23. Tester navigation clavier.

## Espace entreprise

Architecture :

- `CompanyLayout` enveloppe les routes entreprise avec sidebar desktop, drawer mobile, header connecte et bouton logout.
- `CompanySidebar`, `CompanyMobileSidebar` et `CompanyHeader` sont separes du layout etudiant pour garder une navigation adaptee au role `COMPANY`.
- Le dashboard dynamique vit dans `/company/dashboard`.

Routes entreprise :

- `/company/dashboard`
- `/company/profile`
- `/company/offers`
- `/company/applications`
- `/company/candidate-ranking`

La route `/company/candidate-ranking` est encore un placeholder professionnel pour cette etape.

Services API :

- `src/api/companyApi.js`
- `src/api/companyOffersApi.js`
- `src/api/companyApplicationsApi.js`

Endpoints utilises :

- `GET /api/companies/profile`
- `GET /api/companies/offers`
- `GET /api/companies/offers/:id`
- `GET /api/companies/offers/:offerId/applications`
- `GET /api/companies/offers/:offerId/candidates/ranking`

Strategie de chargement :

- Le profil entreprise et les offres sont charges en parallele.
- Le profil est indispensable au dashboard.
- Les offres, candidatures et classement IA peuvent echouer localement sans bloquer toute la page.
- Les candidatures ne sont chargees que pour un maximum de 5 offres publiees afin d eviter un N+1 lourd.
- Si les candidatures sont partielles, l interface indique que les chiffres sont un apercu.

Statistiques :

- Offres totales.
- Offres publiees.
- Brouillons.
- Candidatures recues sur le perimetre charge.

Aucune statistique non fournie par le backend, comme vues, taux de recrutement ou croissance, n est inventee.

Classement IA :

- Une seule offre est envoyee au classement au chargement du dashboard.
- Priorite : offre publiee avec candidatures, sinon offre publiee la plus recente.
- Le dashboard affiche au maximum 3 candidats.
- Le score est presente comme une aide a la decision, pas comme une decision automatique.

Normalisation :

- `src/utils/companyDashboard.js` centralise les mappings profil, offres, candidatures, classement, statuts, scores et listes JSON.
- Les objets API originaux ne sont pas mutes.

Tests entreprise :

1. Login avec un compte `COMPANY`.
2. Verifier la redirection vers `/company/dashboard`.
3. Tester profil `PENDING`.
4. Tester profil `VALIDATED`.
5. Tester profil incomplet.
6. Tester profil complet.
7. Tester aucune offre.
8. Tester plusieurs offres.
9. Tester statuts `DRAFT`, `PUBLISHED`, `ARCHIVED`, `CLOSED`.
10. Tester aucune candidature.
11. Tester plusieurs candidatures.
12. Tester une offre avec candidats classes.
13. Tester une offre sans candidat.
14. Arreter `ai-service`.
15. Arreter le backend.
16. Tester une seule section en erreur.
17. Tester token expire.
18. Tester l acces avec un compte `STUDENT`.
19. Tester navigation sidebar.
20. Tester logout.
21. Actualiser le navigateur.
22. Tester responsive mobile.
23. Tester navigation clavier.
24. Tester reduced motion.

### Profil entreprise

Route :

- `/company/profile`

Endpoints utilises :

- `GET /api/companies/profile`
- `PUT /api/companies/profile`

Champs modifiables :

- `companyName`
- `sector`
- `description`
- `website`
- `address`

Champs en lecture seule :

- `firstName`
- `lastName`
- `email`
- `role`
- `status`

Le frontend n envoie jamais `status`, `userId`, `companyId`, `role` ou `email` dans le `PUT`.

Payload de mise a jour :

```json
{
  "companyName": "SmartTech",
  "sector": "Informatique",
  "description": "Entreprise specialisee dans le developpement web, mobile et IA.",
  "website": "https://smarttech.com",
  "address": "Tunis, Tunisie"
}
```

Validation frontend :

- `companyName` obligatoire.
- `sector` limite a 120 caracteres.
- `description` limitee a 1000 caracteres avec compteur.
- `website` optionnel, mais doit commencer par `http` ou `https` si renseigne.
- `address` limitee a 250 caracteres.

Gestion du statut :

- `PENDING` : en attente de validation.
- `VALIDATED` : entreprise validee.
- `REJECTED` : validation refusee.
- `SUSPENDED` : compte suspendu.

Le statut est affiche dans une bannière lisible et reste non modifiable par l entreprise.

Completion :

- Score estime cote frontend.
- Champs pris en compte : `companyName`, `sector`, `description`, `website`, `address`.
- Formule : champs remplis / 5 x 100.
- Le statut n est pas inclus dans le calcul.

Dirty state :

- Le bouton `Enregistrer les modifications` est desactive sans modification.
- `Annuler les modifications` restaure les dernieres donnees enregistrees.
- Un message `Modifications non enregistrees` apparait lorsque le formulaire differe des donnees initiales.

Tests profil entreprise :

1. Login avec un compte `COMPANY`.
2. Ouvrir `/company/profile`.
3. Verifier le chargement d un profil complet.
4. Verifier un profil incomplet.
5. Verifier les statuts `PENDING`, `VALIDATED`, `REJECTED`, `SUSPENDED`.
6. Modifier le nom de l entreprise.
7. Modifier le secteur.
8. Modifier la description.
9. Tester le compteur de description.
10. Modifier le site web.
11. Tester une URL invalide.
12. Modifier l adresse.
13. Sauvegarder et verifier le message de succes.
14. Actualiser et verifier la persistance.
15. Modifier puis annuler les changements.
16. Verifier que le bouton sauvegarde est desactive sans changement.
17. Arreter le backend.
18. Tester un token expire.
19. Tester l acces avec un compte `STUDENT`.
20. Tester responsive mobile.
21. Tester navigation clavier.
22. Verifier que le statut est comprehensible sans couleur.
23. Retourner au dashboard et verifier les donnees au prochain chargement.

### Gestion des offres entreprise

Routes :

- `/company/offers`
- `/company/offers/new`
- `/company/offers/:offerId`
- `/company/offers/:offerId/edit`

Endpoints utilises :

- `POST /api/companies/offers`
- `GET /api/companies/offers`
- `GET /api/companies/offers/:id`
- `PUT /api/companies/offers/:id`
- `DELETE /api/companies/offers/:id`

Endpoints lies depuis l interface :

- `/company/applications?offerId=<offerId>`
- `/company/candidate-ranking?offerId=<offerId>`

Modele de donnees gere :

- `title`
- `description`
- `location`
- `duration`
- `startDate`
- `requiredSkills`
- `optionalSkills`
- `status`
- `createdAt`
- `updatedAt`

Statuts :

- `DRAFT` : Brouillon
- `PUBLISHED` : Publiee
- `ARCHIVED` : Archivee
- `CLOSED` : Fermee

Validation :

- `title` obligatoire.
- `description` obligatoire.
- `startDate` doit etre une date valide si renseignee.
- `requiredSkills` et `optionalSkills` sont envoyes comme tableaux.
- Les doublons de competences sont ignores.
- Une competence optionnelle ne peut pas etre aussi requise.

Flux creation :

- `Enregistrer en brouillon` envoie `status = DRAFT`.
- `Publier l offre` envoie `status = PUBLISHED`.
- Apres succes, l utilisateur est redirige vers `/company/offers/:offerId`.

Flux modification :

- La page charge l offre avec `GET /api/companies/offers/:id`.
- Le formulaire est pre-rempli.
- Le dirty state active ou desactive les actions.
- `Annuler les modifications` restaure les dernieres donnees chargees.

Archivage :

- Le backend ne supprime pas definitivement l offre.
- `DELETE /api/companies/offers/:id` archive l offre avec `status = ARCHIVED`.
- L interface utilise donc le libelle `Archiver`, pas `Supprimer`.

Recherche et filtres :

- Recherche frontend sur titre, description, localisation, duree et competences.
- Filtres frontend par statut, localisation et duree.
- Tri frontend par recence, anciennete, titre ou statut.

Tests offres entreprise :

1. Ouvrir `/company/offers` avec un compte `COMPANY`.
2. Tester le cas sans offre.
3. Creer un brouillon.
4. Creer une offre publiee.
5. Tester les champs obligatoires manquants.
6. Ajouter des competences.
7. Tester les doublons de competences.
8. Tester une competence requise aussi ajoutee en optionnelle.
9. Tester une date valide.
10. Tester une date invalide.
11. Verifier la liste avec plusieurs statuts.
12. Rechercher par titre.
13. Rechercher par competence.
14. Filtrer `DRAFT`.
15. Filtrer `PUBLISHED`.
16. Trier par recence.
17. Ouvrir le detail d une offre.
18. Modifier un brouillon.
19. Modifier une offre publiee.
20. Annuler les modifications.
21. Verifier le dirty state.
22. Publier un brouillon.
23. Passer une offre en `CLOSED` via le statut si necessaire.
24. Archiver une offre.
25. Annuler l archivage.
26. Arreter le backend.
27. Tester token expire.
28. Tester une offre introuvable.
29. Tester acces `STUDENT` refuse.
30. Tester responsive mobile.
31. Tester navigation clavier.
32. Tester la modale avec `Escape`.
33. Verifier le lien candidatures avec `offerId`.
34. Verifier le lien classement avec `offerId`.

### Candidatures entreprise

Route :

- `/company/applications`
- `/company/applications?offerId=<offerId>`

Endpoints utilises :

- `GET /api/companies/offers`
- `GET /api/companies/offers/:offerId/applications`
- `PUT /api/applications/:id/status`
- `GET /api/companies/offers/:offerId/candidates/ranking`

Chargement :

- La page charge d abord les offres de l entreprise.
- Si `offerId` est present dans l URL et correspond a une offre, cette offre est selectionnee.
- Sinon, la page selectionne une offre publiee, puis a defaut l offre la plus recente.
- Les candidatures sont chargees uniquement pour l offre active.
- Quand l utilisateur change d offre, l URL est mise a jour avec `offerId`.

Strategie anti-N+1 :

- La page ne charge pas les candidatures de toutes les offres.
- La page n appelle pas un endpoint de profil pour chaque candidat.
- Un seul appel au classement IA de l offre active est effectue pour enrichir les candidatures avec `score`, `matchedSkills`, `missingSkills` et `explanation` si disponibles.
- Si le classement IA echoue, les candidatures restent consultables sans score.

Normalisation :

- `src/utils/companyApplications.js` transforme les candidatures en format frontend stable.
- Les champs disponibles sont : identite du candidat, email, telephone, localisation, niveau d etude, objectif metier, message, statut, dates et matching si disponible.
- `passwordHash`, tokens, CV complet, embeddings et donnees RAG brutes ne sont jamais affiches.

Statuts geres :

- `SENT` : Recue
- `PENDING` : En cours d examen
- `ACCEPTED` : Acceptee
- `REJECTED` : Refusee
- `CANCELLED` : Annulee

Le backend accepte les 5 statuts via `PUT /api/applications/:id/status` avec :

```json
{
  "status": "PENDING"
}
```

Transitions :

- Le frontend propose les statuts acceptes par le backend, en excluant le statut actuel.
- Les decisions `ACCEPTED` et `REJECTED` sont presentees avec une confirmation explicite.

Filtres et tri :

- Recherche frontend sur nom, email, localisation, niveau, objectif metier et competences.
- Filtre par statut.
- Filtre score : tous, 50+, 70+, 80+.
- Tri : plus recentes, plus anciennes, meilleur score, nom A-Z, statut.

Navigation :

- Chaque candidature permet d ouvrir un panneau de detail local.
- Liens vers `/company/offers/:offerId`.
- Liens vers `/company/candidate-ranking?offerId=<offerId>`.

Tests candidatures entreprise :

1. Login avec un compte `COMPANY`.
2. Ouvrir `/company/applications`.
3. Tester sans offre.
4. Tester une offre sans candidature.
5. Tester une offre avec une candidature.
6. Tester plusieurs offres.
7. Ouvrir `/company/applications?offerId=<id>` avec un id valide.
8. Tester un `offerId` invalide.
9. Changer d offre et verifier l URL.
10. Verifier une candidature `SENT`.
11. Verifier `PENDING`.
12. Verifier `ACCEPTED`.
13. Verifier `REJECTED`.
14. Verifier une candidature sans score.
15. Verifier une candidature avec matching.
16. Rechercher par nom.
17. Rechercher par competence.
18. Filtrer par statut.
19. Filtrer par score.
20. Trier par recent.
21. Trier par meilleur score.
22. Ouvrir le panneau candidat.
23. Mettre `SENT` vers `PENDING`.
24. Accepter avec confirmation.
25. Refuser avec confirmation.
26. Tester une erreur de statut.
27. Tester une offre d une autre entreprise.
28. Arreter le backend.
29. Tester token expire.
30. Tester acces `STUDENT` refuse.
31. Verifier le lien detail offre.
32. Verifier le lien classement IA avec `offerId`.
33. Tester responsive mobile.
34. Tester navigation clavier.
35. Fermer la modale avec `Escape`.
36. Changer rapidement d offre.
