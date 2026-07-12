# SmartIntern AI Mobile

Application React Native / Expo de SmartIntern AI pour les etudiants.

## Statut

**Step 6 - Dashboard IA et explicabilite**

- authentification mobile reelle avec Bearer token et Expo SecureStore ;
- dashboard, profil, CV, offres et recommandations reels ;
- detail d'offre charge par identifiant ;
- analyse de compatibilite declenchee explicitement ;
- candidature reelle avec confirmation et protection contre les doublons ;
- suivi reel des candidatures.
- recherche et filtres locaux par statut ;
- detail d'une candidature et acces a l'offre liee ;
- synchronisation immediate apres une nouvelle candidature.
- dashboard IA reel avec selection d'offre ;
- Matching V3, score, verdict, confiance et decomposition ;
- Skill Evidence Map, Career Signal Map et Decision Trace ;
- warnings et controles qualite lorsqu'ils sont exposes.

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
| `POST /offers/:id/skill-gap-simulation` | simule les axes de progression depuis le matching backend |
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

## Suivi des candidatures

`GET /students/applications` retourne la liste complete, triee par date de
candidature descendante. Le provider global conserve cette liste ainsi que la
recherche et le filtre selectionne. Une candidature ajoutee depuis le detail
d'offre apparait immediatement dans la liste et actualise le compteur dashboard.

La recherche porte localement sur le titre de l'offre, l'entreprise, la
localisation et le message. Les filtres utilisent exclusivement les statuts
Prisma reels : `SENT`, `PENDING`, `ACCEPTED`, `REJECTED` et `CANCELLED`.

Le backend ne fournit pas de route de detail et la reponse de liste contient deja
les informations disponibles sur l'offre et l'entreprise. L'ecran detail utilise
donc le state global, sans appel supplementaire. Il affiche `appliedAt` et
`updatedAt`, mais ne fabrique aucune etape intermediaire.

## Etats geres

- chargement, rafraichissement, erreur et nouvelle tentative ;
- offre introuvable ou non publiee ;
- profil incomplet et CV absent ;
- analyse non lancee, en cours, indisponible ou partielle ;
- candidature existante, envoi en cours, succes et erreur `409` ;
- champs d'offre et informations entreprise absents.
- reponse Matching legacy ou V3 partielle ;
- score, confiance ou explicabilite absents ;
- CV absent et service IA indisponible.

## Dashboard IA

L'onglet IA utilise les offres publiees et recommandees deja chargees. Une
analyse presente dans le provider d'offres est affichee immediatement. Sinon,
l'etudiant lance explicitement `GET /offers/:id/match`. Le resultat est partage
avec `OfferDetailScreen`, ce qui evite un second appel lors de la navigation.

La normalisation mobile accepte les formats legacy et V3. Elle n'ajoute aucune
valeur metier absente : un score manquant reste indisponible et une confiance
manquante est affichee comme telle.

Sections disponibles selon la reponse : score principal, `scoreBreakdown`,
competences, Skill Evidence Map, Career Signal Map, Decision Trace, warnings et
quality checks. Les snippets de preuve sont limites a 220 caracteres.

## Skill Gap Simulator

Depuis le detail d'une offre ou son analyse IA, l'etudiant peut lancer une
simulation explicite dans un des modes reels du moteur : `CONSERVATIVE`,
`REALISTIC` ou `OPTIMISTIC`. Le mobile envoie uniquement `{ "mode": "..." }` a
`POST /offers/:id/skill-gap-simulation`.

Le backend reconstruit le Matching V3 avec le profil et le CV authentifies, puis
transmet ce resultat au Skill Gap Simulator de `ai-service`. Le client mobile ne
peut donc pas fournir ni modifier un score de matching. Il affiche uniquement
les resultats renvoyes par le moteur.

Les resultats sont caches en memoire par couple `(offerId, mode)` pendant la
session. Une relance reste une action volontaire. Ce cache n'est pas persiste
apres fermeture de l'application et aucune simulation n'est enregistree en base.

## Limites actuelles

- le schema d'offre ne contient pas de deadline, missions structurees, type de
  contrat, remuneration, avantages ou logo d'entreprise ;
- il n'existe pas de route de lecture seule d'un matching enregistre ;
- il n'existe pas de pagination, recherche ou filtres serveur pour les
  candidatures ;
- il n'existe pas d'endpoint de detail ni d'historique des statuts ;
- aucun endpoint de retrait etudiant n'existe, donc aucun bouton de retrait
  n'est affiche ;
- `MatchingResult` ne conserve que le resume legacy et pas toute
  l'explicabilite V3 ; une analyse complete n'est donc pas restaurable apres un
  redemarrage sans relancer le matching ;
- l'endpoint `/offers/:id/match` calcule puis enregistre le resultat ;
- upload CV, lettre de motivation complete, Career Assistant et notifications
  push restent hors perimetre ;
- le Skill Gap Simulator exige un CV deja analyse et depend de la disponibilite
  du service IA ; ses estimations restent pedagogiques et non contractuelles ;
- aucune infrastructure de tests mobile n'est installee actuellement.
