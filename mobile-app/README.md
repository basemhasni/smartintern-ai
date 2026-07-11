# SmartIntern AI Mobile

Application React Native / Expo de SmartIntern AI pour les etudiants.

## Statut

**Step 4 - Detail d'offre, matching IA et candidature**

- authentification mobile reelle avec Bearer token et Expo SecureStore ;
- dashboard, profil, CV, offres et recommandations reels ;
- detail d'offre charge par identifiant ;
- analyse de compatibilite declenchee explicitement ;
- candidature reelle avec confirmation et protection contre les doublons ;
- suivi reel des candidatures.

## Stack

- Expo SDK 57 ;
- React Native 0.86 ;
- TypeScript strict ;
- React Navigation ;
- Expo SecureStore ;
- design system clair/sombre centralise.

## Installation et lancement

```bash
cd mobile-app
npm install
npm start
```

```bash
npm run android
npm run ios
npm run web
npm run lint
npm run typecheck
```

Expo SDK 57 requiert Node.js `>=20.19.4`.

## Configuration API

La configuration se trouve dans `src/core/config/appConfig.ts`.

| Cible | URL par defaut |
| --- | --- |
| Expo Web | `http://localhost:5000/api` |
| iOS Simulator | `http://localhost:5000/api` |
| Android Emulator | `http://10.0.2.2:5000/api` |

Pour un telephone reel :

```bash
EXPO_PUBLIC_API_URL=http://IP_LOCALE_DU_PC:5000/api npm start
```

Le client ajoute `X-Client-Type: mobile` et
`Authorization: Bearer <token>` lorsque la session existe.

## Endpoints utilises

| Endpoint | Utilisation mobile |
| --- | --- |
| `GET /students/profile` | profil etudiant courant |
| `GET /students/cv` | dernier CV et etat d'analyse |
| `GET /offers` | offres publiees |
| `GET /offers/:id` | detail reel d'une offre |
| `GET /students/recommendations?limit=10` | recommandations et matchings disponibles |
| `GET /offers/:id/match` | declenche le Matching V3 pour l'etudiant |
| `GET /students/applications` | suivi et verification d'une candidature existante |
| `POST /offers/:offerId/apply` | cree une candidature avec un corps JSON vide |

La base URL contient deja `/api`.

## Detail et matching

Le detail recharge l'offre avec `offerId`. Il affiche uniquement les champs
exposes par le backend : titre, description, entreprise, secteur, localisation,
duree, date de debut et competences.

Un matching deja fourni par les recommandations est reutilise. Sinon,
l'utilisateur choisit `Analyser mon profil`. Le backend orchestre alors
`ai-service` et enregistre le resultat. React Native ne calcule aucun score et ne
contacte jamais directement le service IA.

Le resultat est conserve dans le provider mobile pendant la session afin
d'eviter une nouvelle analyse lors d'un retour sur la meme offre. Un CV analyse
est necessaire pour le matching.

## Candidature

Le provider charge `GET /students/applications` et recherche `offerId` avant
d'activer le bouton. Apres confirmation, le mobile envoie `{}` a
`POST /offers/:offerId/apply`. Le statut initial retourne par le backend est
`SENT`.

La protection contre les doublons existe a deux niveaux : bouton desactive dans
l'interface et contrainte Prisma unique `(studentId, offerId)`. Une reponse `409`
declenche aussi un rafraichissement des candidatures.

Le backend actuel ne demande ni CV ni lettre de motivation pour postuler. La
confirmation indique donc seulement que la candidature et le profil SmartIntern
sont transmis.

## Etats geres

- chargement, rafraichissement, erreur et nouvelle tentative ;
- offre introuvable ou non publiee ;
- profil incomplet et CV absent ;
- analyse non lancee, en cours, indisponible ou partielle ;
- candidature existante, envoi en cours, succes et erreur `409` ;
- champs d'offre et informations entreprise absents.

## Limites actuelles

- le schema d'offre ne contient pas de deadline, missions structurees, type de
  contrat, remuneration, avantages ou logo d'entreprise ;
- il n'existe pas de route de lecture seule d'un matching enregistre ;
- l'endpoint `/offers/:id/match` calcule puis enregistre le resultat ;
- upload CV, lettre de motivation complete, Career Assistant, Skill Gap
  Simulator et notifications push restent hors perimetre ;
- aucune infrastructure de tests mobile n'est installee actuellement.
