# 📱 MizanPro Mobile

Guide rapide pour le développement et le déploiement mobile de MizanPro.

## Architecture

MizanPro utilise **Capacitor** pour transformer l'application web Next.js en applications mobiles natives pour iOS et Android.

```
┌─────────────────────────────────────┐
│         Next.js Web App             │
│    (React + TypeScript + Zustand)   │
└──────────────┬──────────────────────┘
               │
               │ Capacitor Bridge
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐           ┌───▼────┐
│  iOS   │           │Android │
│  App   │           │  App   │
└────────┘           └────────┘
```

## Quick Start

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configuration de l'environnement
./scripts/setup-mobile-env.sh

# 3. Build et sync
npm run mobile:build
```

### Développement

#### iOS

```bash
# Ouvrir dans Xcode
npm run cap:open:ios

# Puis dans Xcode : Cmd+R pour build et run
```

#### Android

```bash
# Ouvrir dans Android Studio
npm run cap:open:android

# Puis dans Android Studio : Shift+F10 pour build et run
```

### Hot Reload en développement

Pour un développement plus rapide, vous pouvez pointer l'app mobile vers votre serveur de développement local :

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  // ...
  server: {
    url: 'http://192.168.1.XX:3000', // Votre IP locale
    cleartext: true
  }
}
```

```bash
# Terminal 1 : Démarrer le serveur Next.js
npm run dev

# Terminal 2 : Sync et ouvrir
npx cap sync
npx cap open ios  # ou android
```

⚠️ N'oubliez pas de retirer la configuration `server.url` avant le build de production !

## Structure des fichiers

```
compta/
├── capacitor.config.ts          # Configuration Capacitor
├── ios/                         # Projet iOS natif
│   ├── App/                     # Code source iOS
│   ├── fastlane/               # Configuration Fastlane
│   │   ├── Fastfile            # Lanes de déploiement
│   │   ├── Appfile             # Identifiants Apple
│   │   ├── Matchfile           # Gestion des certificats
│   │   └── metadata/           # Métadonnées App Store
│   └── Gemfile                 # Dépendances Ruby
├── android/                     # Projet Android natif
│   ├── app/                    # Code source Android
│   ├── fastlane/               # Configuration Fastlane
│   │   ├── Fastfile            # Lanes de déploiement
│   │   ├── Appfile             # Config Google Play
│   │   └── metadata/           # Métadonnées Play Store
│   └── Gemfile                 # Dépendances Ruby
└── scripts/
    ├── setup-mobile-env.sh     # Setup environnement
    └── generate-android-keystore.sh
```

## Capacitor

### Plugins utilisés

- `@capacitor/core` - Core de Capacitor
- `@capacitor/ios` - Plateforme iOS
- `@capacitor/android` - Plateforme Android

### Ajout de plugins

```bash
# Installer un plugin
npm install @capacitor/camera

# Synchroniser
npx cap sync
```

### APIs natives

Capacitor permet d'accéder aux APIs natives :

```typescript
import { Camera } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
};
```

Plugins disponibles :
- Camera
- Geolocation
- Filesystem
- Share
- Haptics
- Status Bar
- Toast
- Et bien d'autres...

[Liste complète des plugins](https://capacitorjs.com/docs/plugins)

## Fastlane

### Lanes disponibles

#### iOS

```bash
cd ios

# Build local
bundle exec fastlane build

# Upload vers TestFlight
bundle exec fastlane beta

# Release vers App Store
bundle exec fastlane release

# Capturer des screenshots
bundle exec fastlane screenshots
```

#### Android

```bash
cd android

# Build local (APK + AAB)
bundle exec fastlane build

# Upload vers Internal Testing
bundle exec fastlane beta

# Release vers Production
bundle exec fastlane release

# Promouvoir internal → beta
bundle exec fastlane promote_to_beta

# Promouvoir beta → production
bundle exec fastlane promote_to_production
```

### Variables d'environnement

Les lanes Fastlane utilisent des variables d'environnement pour la configuration :

#### iOS (`ios/fastlane/.env`)

```bash
APPLE_ID=email@example.com
TEAM_ID=XXXXXXXXXX
APP_STORE_CONNECT_API_KEY_KEY_ID=XXXXXXXXXX
MATCH_GIT_URL=https://github.com/org/certificates
MATCH_PASSWORD=xxxxxx
```

#### Android (`android/fastlane/.env`)

```bash
PLAY_STORE_JSON_KEY_PATH=./fastlane/google-play-key.json
KEYSTORE_PATH=./keystores/release.keystore
KEYSTORE_PASSWORD=xxxxxx
KEY_ALIAS=mizanpro
KEY_PASSWORD=xxxxxx
```

## CI/CD

### GitHub Actions

Le workflow `.github/workflows/mobile-release.yml` gère les builds automatiques.

#### Déclenchement manuel

```bash
# Via l'interface GitHub Actions
1. Actions → Mobile Release → Run workflow
2. Choisir platform: ios | android | both
3. Choisir release_type: build | beta | release
```

#### Déclenchement automatique

- Push sur `main` ou `release/*`
- Tags `v*` (ex: `v1.0.0`)

### Secrets GitHub requis

#### iOS
- `APPLE_ID`
- `TEAM_ID`
- `APP_STORE_CONNECT_API_KEY_*`
- `MATCH_PASSWORD`
- `MATCH_GIT_URL`

#### Android
- `KEYSTORE_BASE64`
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `PLAY_STORE_JSON_KEY`

## Versioning

### iOS

Les versions sont gérées dans `ios/App/App.xcodeproj`.

Fastlane les incrémente automatiquement :
- **Version** (CFBundleShortVersionString): 1.0.0, 1.1.0, etc.
- **Build** (CFBundleVersion): Basé sur le nombre de commits

### Android

Les versions sont dans `android/app/build.gradle` :

```gradle
defaultConfig {
    versionCode 1      // Entier, doit toujours augmenter
    versionName "1.0"  // String, version affichée
}
```

Fastlane les incrémente automatiquement.

### Stratégie de versioning

Pour une nouvelle release :

```bash
# iOS
cd ios
bundle exec fastlane increment_version_number bump_type:patch  # ou minor, major

# Android
cd android
bundle exec fastlane increment_version_name bump_type:patch
bundle exec fastlane increment_version_code
```

## Métadonnées des stores

### App Store (iOS)

Métadonnées dans `ios/fastlane/metadata/en-US/` :

- `name.txt` - Nom de l'app
- `subtitle.txt` - Sous-titre
- `description.txt` - Description complète
- `keywords.txt` - Mots-clés (max 100 caractères)
- `release_notes.txt` - Notes de version
- `privacy_url.txt` - URL politique de confidentialité
- `support_url.txt` - URL support

### Google Play (Android)

Métadonnées dans `android/fastlane/metadata/android/en-US/` :

- `title.txt` - Titre (max 50 caractères)
- `short_description.txt` - Description courte (max 80 caractères)
- `full_description.txt` - Description complète (max 4000 caractères)
- `changelogs/default.txt` - Notes de version
- `video.txt` - URL vidéo YouTube

### Screenshots

Les stores requièrent des screenshots. Placez-les dans :

- iOS : `ios/fastlane/screenshots/en-US/`
- Android : `android/fastlane/metadata/android/en-US/images/phoneScreenshots/`

Tailles requises :
- **iOS** : 1290x2796 (iPhone 15 Pro Max), 2048x2732 (iPad Pro)
- **Android** : Min 320px, max 3840px, ratio 2:1

Générer avec Fastlane :

```bash
# iOS
cd ios && bundle exec fastlane screenshots

# Android
cd android && bundle exec fastlane screenshots
```

## Signature et certificats

### iOS - Apple Certificates

Gérés automatiquement par **Fastlane Match**.

Match stocke les certificats dans un dépôt Git privé et les synchronise entre les machines.

```bash
# Initialiser Match
cd ios
bundle exec fastlane match init

# Créer/récupérer les certificats
bundle exec fastlane match development
bundle exec fastlane match appstore

# Reset (en cas de problème)
bundle exec fastlane match nuke development
bundle exec fastlane match nuke distribution
```

### Android - Keystore

Le keystore doit être créé une fois et conservé précieusement.

```bash
# Générer le keystore
./scripts/generate-android-keystore.sh

# Backup recommandé
cp android/app/keystores/release.keystore ~/Backup/
```

⚠️ **CRITIQUE** : Si vous perdez le keystore, vous ne pourrez plus publier de mises à jour !

Stockage recommandé :
- Manager de mots de passe (1Password, LastPass)
- Coffre-fort cloud sécurisé
- Support physique chiffré

## Performance

### Optimisations Web

L'app mobile charge le code web. Optimisations recommandées :

```typescript
// next.config.js
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Capacitor ne supporte pas l'optimisation Next.js
  },
  // Compression
  compress: true,
  // Minification
  swcMinify: true,
}
```

### Optimisations Capacitor

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  // ...
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000, // Durée splash screen
      backgroundColor: "#ffffff",
      showSpinner: false, // Désactiver pour plus de perf
    }
  }
}
```

### Build optimisé

```bash
# iOS - Release build
cd ios
xcodebuild -workspace App.xcworkspace \
           -scheme App \
           -configuration Release \
           -derivedDataPath build \
           CODE_SIGN_IDENTITY="" \
           CODE_SIGNING_REQUIRED=NO

# Android - Release build
cd android
./gradlew assembleRelease --max-workers=4
```

## Testing

### Tests locaux

```bash
# iOS Simulator
npm run cap:open:ios
# Dans Xcode : Choisir un simulateur et Cmd+R

# Android Emulator
npm run cap:open:android
# Dans Android Studio : Créer/démarrer un émulateur et Shift+F10
```

### Distribution pour tests

#### iOS - TestFlight

```bash
cd ios
bundle exec fastlane beta
```

Les testeurs reçoivent une invitation par email.

#### Android - Internal Testing

```bash
cd android
bundle exec fastlane beta
```

Partagez le lien de test depuis Google Play Console.

## Troubleshooting

### Erreurs fréquentes

#### "Could not find capacitor.config.ts"

```bash
# Vérifier que le fichier existe
ls capacitor.config.ts

# Recréer si nécessaire
npx cap init
```

#### "web assets not found"

```bash
# Build l'app web d'abord
npm run build:mobile

# Puis sync
npx cap sync
```

#### iOS : "No provisioning profiles found"

```bash
cd ios
bundle exec fastlane match development
```

#### Android : "Keystore not found"

```bash
# Générer le keystore
./scripts/generate-android-keystore.sh

# Vérifier keystore.properties
cat android/keystore.properties
```

### Logs de debug

```bash
# Capacitor
npx cap doctor

# iOS
cd ios && xcodebuild -showBuildSettings

# Android
cd android && ./gradlew tasks
```

## Ressources

### Documentation
- [Capacitor](https://capacitorjs.com/docs)
- [Fastlane](https://docs.fastlane.tools/)
- [Next.js](https://nextjs.org/docs)

### App Stores
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)

### Communauté
- [Capacitor Discord](https://discord.gg/UPYYRhtyzp)
- [Ionic Forum](https://forum.ionicframework.com/)

## Prochaines étapes

- [ ] Ajouter des plugins natifs (Camera, Geolocation, etc.)
- [ ] Configurer les push notifications
- [ ] Implémenter le mode hors-ligne
- [ ] Ajouter des tests E2E mobiles
- [ ] Optimiser les performances
- [ ] Traduire les métadonnées des stores
