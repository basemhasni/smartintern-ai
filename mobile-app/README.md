# SmartIntern AI Mobile

Application React Native / Expo de SmartIntern AI. La version actuelle couvre la
fondation mobile, l'authentification réelle et le dashboard étudiant avec les
offres publiées et les recommandations du backend.

## Statut

**Step 3 - Dashboard étudiant et offres**

- authentification mobile par Bearer token stocké dans Expo SecureStore ;
- restauration de session avec `/auth/me` ;
- profil étudiant, CV et indicateurs réels ;
- offres publiées et recommandations réelles ;
- recherche et filtres locaux ;
- aperçu du matching lorsque le backend le fournit ;
- détail d'offre préparé, sans candidature.

## Stack

- Expo SDK 57 ;
- React Native 0.86 ;
- TypeScript strict ;
- React Navigation ;
- Expo SecureStore ;
- design system clair/sombre centralisé.

## Architecture utile

```text
src/
|-- core/
|   |-- api/                 # Client HTTP central et erreurs
|   |-- config/              # URL API selon la plateforme
|   |-- navigation/          # Stack et bottom tabs
|   |-- storage/             # SecureStore
|   `-- theme/               # Couleurs, espacements, typo, thèmes
|-- features/
|   |-- auth/                # Auth API, contexte et écrans
|   |-- student/             # Profil, CV, statistiques et provider dashboard
|   |-- studentHome/         # Dashboard étudiant
|   `-- offers/              # Modèles, API, provider, liste, cartes et détail
`-- shared/components/       # Composants UI réutilisables
```

## Installation et lancement

```bash
cd mobile-app
npm install
npm start
```

Autres cibles :

```bash
npm run android
npm run ios
npm run web
```

Qualité :

```bash
npm run lint
npm run typecheck
```

Expo SDK 57 requiert Node.js `>=20.19.4`.

## Configuration API

La configuration est dans `src/core/config/appConfig.ts`.

| Cible | URL par défaut |
| --- | --- |
| Expo Web | `http://localhost:5000/api` |
| iOS Simulator | `http://localhost:5000/api` |
| Android Emulator | `http://10.0.2.2:5000/api` |

Pour un téléphone réel :

```bash
EXPO_PUBLIC_API_URL=http://IP_LOCALE_DU_PC:5000/api npm start
```

Le client ajoute `X-Client-Type: mobile` et le token
`Authorization: Bearer <token>` lorsqu'une session existe.

## Endpoints utilisés à l'étape 3

| Endpoint | Utilisation mobile |
| --- | --- |
| `GET /students/profile` | profil étudiant courant |
| `GET /students/cv` | dernier CV, état d'analyse et compétences détectées |
| `GET /students/applications` | nombre de candidatures actives du dashboard |
| `GET /offers` | toutes les offres `PUBLISHED` |
| `GET /offers/:id` | rechargement du détail d'une offre |
| `GET /students/recommendations?limit=10` | recommandations et matching réels |

La base URL contient déjà `/api`.

## Dashboard étudiant

Le dashboard affiche uniquement des données disponibles dans les réponses du
backend : identité, objectif, formation, localisation, état du CV, compétences
détectées, offres publiées, recommandations analysées et candidatures actives.

Le pourcentage de complétion est un indicateur **local d'affichage**, calculé sur
huit champs connus : prénom, nom, localisation, formation, objectif, bio,
disponibilité et présence d'un CV. Il ne s'agit pas d'un score métier et il n'est
jamais envoyé au backend.

## Offres et recommandations

`GET /offers` fournit les objets offre complets. La réponse de recommandations
contient une offre partielle avec un objet `matching`. Le provider mobile fusionne
les deux réponses par `offer.id` et ne recalcule jamais un score.

Un score est affiché seulement si la réponse contient un matching exploitable.
Sinon l'interface affiche `Analyse non disponible`, jamais `0 %` par défaut.

La recherche porte localement sur le titre, l'entreprise, le lieu et les
compétences. Les filtres disponibles sont : toutes, analysées et
hybride/distance.

## États gérés

- chargement initial ;
- pull-to-refresh ;
- erreur avec nouvelle tentative ;
- liste vide ;
- profil étudiant absent ;
- CV absent ou analyse échouée ;
- recommandations indisponibles avec offres publiques toujours visibles ;
- matching partiel ;
- entreprise ou champs d'offre manquants.

## Limites actuelles

- `/api/offers` ne propose pas encore de pagination ni de paramètres de recherche ;
- la recherche et les filtres portent donc sur la liste complète reçue ;
- l'endpoint de recommandations calcule les offres publiées avant d'appliquer
  `limit`, ce qui devra être optimisé côté backend si le volume augmente ;
- aucune candidature, upload CV, Career Assistant, Skill Gap Simulator ou
  notification push n'est ajouté dans cette étape ;
- le détail d'offre reste volontairement limité et le bouton de candidature est
  désactivé jusqu'à l'étape suivante.
