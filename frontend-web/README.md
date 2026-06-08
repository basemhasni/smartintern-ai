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
GET /api/students/applications
GET /api/students/recommendations?limit=3&minScore=0
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
/student/cv               Placeholder CV
/student/offers           Placeholder offres
/student/applications     Placeholder candidatures
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
