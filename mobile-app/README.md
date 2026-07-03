# SmartIntern AI Mobile

Application mobile Flutter de SmartIntern AI.

## Statut actuel

Cette branche correspond à `feature/mobile-step-1-foundation`.

Objectif de cette étape : créer uniquement la fondation mobile propre, maintenable et visuellement premium.

Les fonctionnalités métier ne sont pas encore connectées aux APIs. Les écrans utilisent des données mockées pour préparer le design et la navigation.

## Stack

- Flutter ;
- Dart ;
- Dio ;
- go_router ;
- provider ;
- flutter_secure_storage.

## Architecture

```txt
lib/
├── main.dart
├── app.dart
├── core/
│   ├── config/
│   ├── network/
│   ├── routing/
│   ├── storage/
│   ├── theme/
│   └── utils/
├── features/
│   ├── splash/
│   ├── auth/
│   ├── student_home/
│   ├── offers/
│   ├── applications/
│   ├── ai_insights/
│   └── profile/
└── shared/
    └── widgets/
```

## Écrans créés

- Splash ;
- Login ;
- Register ;
- Forgot password ;
- Student home ;
- Offers ;
- Offer detail ;
- Applications ;
- AI Insights ;
- Profile.

## Widgets partagés

- `AppGradientBackground` ;
- `AppGlassCard` ;
- `AppPrimaryButton` ;
- `AppTextField` ;
- `AppBadge` ;
- `LoadingView` ;
- `ErrorView` ;
- `EmptyState`.

## Configuration API

Le fichier `lib/core/config/app_config.dart` prépare l'URL backend.

Exemples :

- Android Emulator : `http://10.0.2.2:5000/api`
- iOS Simulator : `http://localhost:5000/api`
- Device réel : `http://IP_LOCALE_DU_PC:5000/api`

Pour surcharger au lancement :

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api
```

## Commandes

```bash
flutter pub get
flutter analyze ou flutter analyze --no-pub
flutter run

```

### Lancer sur Chrome sous Windows / OneDrive

Si `flutter run -d chrome` echoue avec un message indiquant que Flutter ne peut pas supprimer `build/flutter_assets`, utiliser le script de nettoyage :

```powershell
powershell -ExecutionPolicy Bypass -File .\tool\run_web.ps1
```

Ou manuellement :

```powershell
powershell -ExecutionPolicy Bypass -File .\tool\clean_generated.ps1
flutter pub get
flutter run -d chrome
```

Le probleme vient de dossiers generes par Flutter que OneDrive peut marquer comme `ReparsePoint` ou `ReadOnly`.

## Plateformes Android / iOS

Dans cet environnement, le SDK Flutter n'est pas disponible, donc les runners Android/iOS n'ont pas pu être générés par `flutter create`.

Quand Flutter est installé, exécuter :

```bash
flutter create . --platforms=android,ios
flutter pub get
flutter analyze
```

Conserver ensuite le dossier `lib/` déjà préparé.

## Prochaines étapes

1. Installer/générer les runners Flutter Android/iOS.
2. Connecter login/register/forgot password aux APIs backend.
3. Gérer l'auth mobile avec fallback Bearer si nécessaire.
4. Connecter profil, offres, candidatures et insights IA.
5. Ajouter upload CV et notifications dans des étapes séparées.
