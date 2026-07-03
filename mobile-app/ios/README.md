# iOS runner

The iOS runner is intentionally not generated on this Windows/OneDrive workspace.

Reason: Flutter recreates `ios/Flutter/ephemeral/Packages/.packages` as a Windows reparse point, and OneDrive can prevent the Flutter tool from deleting it during `flutter pub get` or `flutter analyze`.

For iOS development, use macOS or a workspace outside OneDrive, then run:

```bash
flutter create . --platforms=ios
flutter pub get
flutter analyze
```

The shared Flutter application code lives in `lib/` and remains platform-independent.

