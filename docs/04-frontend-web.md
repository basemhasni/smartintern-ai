# Frontend Web

## Rôle

`frontend-web` fournit l'interface utilisateur de SmartIntern AI. Il contient les pages publiques, les espaces étudiant, entreprise et admin, ainsi que les composants d'affichage des insights IA.

## Stack

- React 18 ;
- Vite 5 ;
- React Router ;
- Axios ;
- Tailwind CSS ;
- lucide-react.

## Structure

```txt
frontend-web/src/
├── api/
├── auth/
├── components/
│   └── ai/
├── hooks/
├── pages/
│   ├── admin/
│   ├── company/
│   └── student/
├── routes/
├── utils/
├── App.jsx
└── main.jsx
```

## Routing

Les routes principales sont déclarées dans `src/routes/AppRoutes.jsx`.

| Route | Accès |
| --- | --- |
| `/` | public |
| `/login` | public |
| `/register` | public |
| `/forgot-password` | public |
| `/reset-password` | public |
| `/student/*` | STUDENT |
| `/company/*` | COMPANY |
| `/admin/*` | ADMIN |

## Authentification frontend

`AuthContext` restaure la session via `/api/auth/me`. Le JWT n'est pas stocké dans `localStorage`. Seul l'utilisateur courant est conservé pour l'état UI. Les anciennes clés de token sont supprimées par compatibilité.

## Client API

`src/api/axiosClient.js` configure :

- `baseURL = VITE_API_BASE_URL || http://localhost:5000` ;
- `withCredentials: true` ;
- ajout automatique du header CSRF pour `POST`, `PUT`, `PATCH`, `DELETE` ;
- retry une fois si le token CSRF est expiré ;
- redirection vers `/login` en cas de 401 hors pages auth.

## Pages principales

### Auth

- Login ;
- Register ;
- Forgot Password ;
- Reset Password.

### Étudiant

- Dashboard ;
- Profil ;
- CV ;
- Offres ;
- Détail offre ;
- Candidatures ;
- Assistant carrière.

### Entreprise

- Dashboard ;
- Profil ;
- Offres ;
- Création / modification d'offre ;
- Détail offre ;
- Candidatures ;
- Classement candidats.

### Admin

- Dashboard ;
- Utilisateurs ;
- Entreprises.

## Composants IA

Le dossier `src/components/ai/` contient notamment :

- `AiScoreCard` ;
- `AiConfidenceBadge` ;
- `AiDecisionLabelBadge` ;
- `AiWarningsPanel` ;
- `ScoreBreakdownCard` ;
- `CareerSignalMap` ;
- `SkillEvidenceMap` ;
- `SkillEvidenceBadge` ;
- `DecisionTraceTimeline` ;
- `MissingSkillsPanel` ;
- `SkillGapSimulatorPanel` ;
- `OfferQualityPanel` ;
- `AiEmptyState` ;
- `AiSectionCard`.

Ces composants doivent gérer les données manquantes sans afficher `undefined` ou `null`.

## Commandes

```bash
cd frontend-web
npm install
npm run dev
npm run build
```

## Variable d'environnement

```env
VITE_API_BASE_URL=http://localhost:5000
```

