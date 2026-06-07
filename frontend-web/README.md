# SmartIntern AI Frontend

Frontend React/Vite de SmartIntern AI.

Le design principal est base sur les captures Google Stitch placees dans :

```text
frontend-web/design-references/stitch/
frontend-web/design-references/stitch/auth/
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

Créer `frontend-web/.env` si nécessaire :

```text
VITE_API_BASE_URL=http://localhost:5000
```

Le fichier `.env` est ignore par Git. Seul `.env.example` doit être versionne.

## Architecture auth

```text
src/
├── api/
│   └── axiosClient.js
├── auth/
│   ├── AuthContext.jsx
│   └── ProtectedRoute.jsx
├── components/
│   ├── auth/
│   └── landing/
├── pages/
├── routes/
└── utils/
    └── auth.js
```

### AuthContext

`AuthContext` expose :

- `user`
- `token`
- `role`
- `isAuthenticated`
- `isLoading`
- `login(email, password)`
- `register(formData)`
- `logout()`
- `refreshUser()`

Au chargement, le frontend relit le token local, appelle `GET /api/auth/me`, puis restaure ou supprime la session selon la validite du token.

### Stockage local

Clés localStorage :

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

```text
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

## Redirection selon le role

```text
STUDENT -> /student/dashboard
COMPANY -> /company/dashboard
ADMIN   -> /admin/dashboard
```

La fonction centralisee se trouve dans `src/utils/auth.js`.

## Routes

```text
/                    Landing page
/login               Connexion
/register            Inscription publique
/dashboard           Redirection automatique selon le role
/student/dashboard   Route protegee STUDENT
/company/dashboard   Route protegee COMPANY
/admin/dashboard     Route protegee ADMIN
/access-denied       Role non autorise
*                    Page 404
```

Important : l'inscription publique propose uniquement `STUDENT` et `COMPANY`. Le role `ADMIN` n'est jamais disponible dans l'interface publique.

## Tests manuels

1. Lancer `backend-api` sur `http://localhost:5000`.
2. Lancer le frontend sur `http://localhost:5173`.
3. Tester une inscription `STUDENT` valide.
4. Vérifier la redirection vers `/student/dashboard`.
5. Tester `logout`.
6. Tester un login `STUDENT`.
7. Actualiser la page et vérifier la restauration de session.
8. Tester une inscription `COMPANY`.
9. Vérifier la redirection vers `/company/dashboard`.
10. Tester un login `ADMIN` existant.
11. Vérifier la redirection vers `/admin/dashboard`.
12. Tester un mauvais mot de passe.
13. Tester un email deja utilise.
14. Arrêter le backend et vérifier le message reseau.
15. Acceder a une route protegee sans token.
16. Acceder a une route `COMPANY` avec un token `STUDENT`.
17. Tester un token invalide ou expire.
18. Vérifier le responsive mobile.
19. Vérifier la navigation clavier.
