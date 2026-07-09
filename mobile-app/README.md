# SmartIntern AI Mobile

## 1. Objectif

Application mobile React Native de SmartIntern AI, la plateforme de gestion de
stages et de matching intelligent entre étudiants et entreprises.

Ce dossier contient uniquement la fondation mobile. Il ne consomme encore aucun
endpoint réel et n'implémente ni authentification, ni candidature, ni upload de
CV, ni notification.

## 2. Statut

**Step 1 - Foundation**

- architecture TypeScript modulaire ;
- navigation auth et étudiant ;
- design system sombre premium ;
- écrans alimentés par des données de démonstration ;
- client API préparé mais non utilisé.

## 3. Stack

- Expo SDK 57 ;
- React Native 0.86 ;
- TypeScript strict ;
- React Navigation (Native Stack + Bottom Tabs) ;
- `react-native-safe-area-context` ;
- `expo-linear-gradient` ;
- `@expo/vector-icons`.

AsyncStorage n'est pas installé à cette étape. `expo-secure-store` sera ajouté
avec l'authentification mobile à l'étape 2.

## 4. Architecture

```text
mobile-app/
├── App.tsx
├── index.ts
├── src/
│   ├── bootstrap/           # Composition racine
│   ├── core/
│   │   ├── api/             # Client HTTP et erreurs
│   │   ├── config/          # Configuration d'environnement
│   │   ├── navigation/      # Stack et bottom tabs
│   │   ├── storage/         # Contrat de stockage sécurisé
│   │   └── theme/           # Tokens du design system
│   ├── features/            # Écrans organisés par domaine
│   └── shared/components/   # Composants UI réutilisables
└── assets/
```

## 5. Installation

```bash
cd mobile-app
npm install
```

## 6. Lancement

```bash
npx expo start
npm run android
npm run ios
npm run web
```

Contrôles qualité :

```bash
npm run lint
npm run typecheck
```

## 7. Configuration API

La configuration se trouve dans `src/core/config/appConfig.ts`.

| Cible | URL par défaut |
| --- | --- |
| Web | `http://localhost:5000/api` |
| iOS Simulator | `http://localhost:5000/api` |
| Android Emulator | `http://10.0.2.2:5000/api` |

Pour un téléphone réel, utiliser l'adresse IP locale du PC :

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:5000/api npm start
```

Le client central ajoute déjà `X-Client-Type: mobile`, gère un timeout et
normalise les erreurs. Il n'est volontairement relié à aucun écran.

## 8. Écrans disponibles

- Splash ;
- Login ;
- Register ;
- Forgot Password ;
- Student Home ;
- Offers ;
- Offer Detail ;
- Applications ;
- AI Insights ;
- Profile.

Le bouton de connexion ouvre directement l'espace étudiant pour permettre la
revue de l'interface sans authentification réelle.

## 9. Design system

Les couleurs, espacements, rayons et styles typographiques sont centralisés dans
`src/core/theme`. Les composants partagés incluent :

- `AppBackground` ;
- `GlassCard` ;
- `GradientButton` ;
- `AppTextInput` ;
- `AppBadge` ;
- `SectionHeader` ;
- `LoadingState` ;
- `ErrorState` ;
- `EmptyState` ;
- `Screen` et `OfferCard`.

## 10. Prochaines étapes

1. **Step 2** : authentification API et token avec SecureStore.
2. **Step 3** : offres réelles et recherche.
3. **Step 4** : candidatures et suivi.
4. **Step 5** : insights IA réels et explicables.
5. Étapes ultérieures : CV, notifications et préparation stores.
