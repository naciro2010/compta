# 📱 MizanPro - Guide de Déploiement Mobile

Ce guide explique comment déployer MizanPro sur iOS (App Store) et Android (Google Play).

## Table des matières

- [Prérequis](#prérequis)
- [Configuration initiale](#configuration-initiale)
- [Déploiement iOS](#déploiement-ios)
- [Déploiement Android](#déploiement-android)
- [CI/CD avec GitHub Actions](#cicd-avec-github-actions)
- [Dépannage](#dépannage)

## Prérequis

### Environnement de développement

- **Node.js** 18 ou supérieur
- **npm** ou **yarn**
- **Ruby** 2.7 ou supérieur (pour Fastlane)
- **Bundler** (gem install bundler)

### Pour iOS

- **macOS** (requis pour le build iOS)
- **Xcode** 14 ou supérieur
- **CocoaPods** (gem install cocoapods)
- **Compte Apple Developer** (99$/an)

### Pour Android

- **Java JDK** 17 ou supérieur
- **Android Studio** ou **Android SDK**
- **Compte Google Play Console** (25$ unique)

## Configuration initiale

### 1. Installation des dépendances

```bash
# Installer les dépendances npm
npm install

# Exécuter le script de configuration (recommandé)
./scripts/setup-mobile-env.sh

# Ou manuellement :
cd ios && bundle install && cd ..
cd android && bundle install && cd ..
```

### 2. Build de l'application web

```bash
# Build pour mobile (sans basePath)
npm run build:mobile

# Synchroniser avec Capacitor
npx cap sync
```

## Déploiement iOS

### Configuration

#### 1. Identifiants Apple

Créez un fichier `ios/fastlane/.env` basé sur `.env.default` :

```bash
# Méthode 1 : Apple ID (plus simple mais moins sécurisé)
APPLE_ID=votre-email@example.com
TEAM_ID=VOTRE_TEAM_ID
ITC_TEAM_ID=VOTRE_ITC_TEAM_ID

# Méthode 2 : App Store Connect API (recommandé)
APP_STORE_CONNECT_API_KEY_KEY_ID=VOTRE_KEY_ID
APP_STORE_CONNECT_API_KEY_ISSUER_ID=VOTRE_ISSUER_ID
APP_STORE_CONNECT_API_KEY_KEY_FILEPATH=./AuthKey_XXXXXX.p8
```

Pour obtenir une clé API App Store Connect :
1. Connectez-vous à [App Store Connect](https://appstoreconnect.apple.com)
2. Allez dans **Users and Access** → **Keys**
3. Créez une nouvelle clé avec le rôle **App Manager**
4. Téléchargez le fichier `.p8` et notez le Key ID et Issuer ID

#### 2. Gestion des certificats (Match)

Fastlane Match gère automatiquement vos certificats et profils de provisioning.

```bash
# Configuration du dépôt de certificats
MATCH_GIT_URL=https://github.com/votre-org/certificates
MATCH_PASSWORD=votre_mot_de_passe_securise
```

Première utilisation :

```bash
cd ios
bundle exec fastlane match init
bundle exec fastlane match appstore
```

#### 3. Configuration de l'app dans Xcode

```bash
# Ouvrir le projet dans Xcode
npx cap open ios
```

Dans Xcode :
1. Sélectionnez le projet **App** dans le navigateur
2. Sous **Signing & Capabilities** :
   - Cochez "Automatically manage signing"
   - Sélectionnez votre Team
3. Vérifiez le Bundle Identifier : `com.mizanpro.app`
4. Configurez les capacités nécessaires

### Build et déploiement

#### Build local

```bash
cd ios
bundle exec fastlane build
```

#### Déploiement TestFlight (Beta)

```bash
cd ios
bundle exec fastlane beta
```

#### Déploiement App Store (Production)

```bash
cd ios
bundle exec fastlane release
```

### Processus de publication sur l'App Store

1. **TestFlight** : Les builds sont automatiquement disponibles pour les testeurs internes
2. **App Store Connect** :
   - Connectez-vous à [App Store Connect](https://appstoreconnect.apple.com)
   - Créez une nouvelle version dans **My Apps**
   - Remplissez les métadonnées (déjà pré-configurées via Fastlane)
   - Ajoutez des captures d'écran
   - Soumettez pour examen

## Déploiement Android

### Configuration

#### 1. Génération du keystore

Le keystore est nécessaire pour signer l'application :

```bash
# Utiliser le script de génération
./scripts/generate-android-keystore.sh

# Ou manuellement avec keytool
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore android/app/keystores/release.keystore \
  -alias mizanpro \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

⚠️ **IMPORTANT** : Conservez le keystore et ses mots de passe en sécurité ! Si vous le perdez, vous ne pourrez plus mettre à jour l'app.

#### 2. Configuration du keystore

Créez le fichier `android/keystore.properties` :

```properties
storeFile=keystores/release.keystore
storePassword=VOTRE_MOT_DE_PASSE_KEYSTORE
keyAlias=mizanpro
keyPassword=VOTRE_MOT_DE_PASSE_CLE
```

⚠️ Ce fichier est automatiquement ignoré par git

#### 3. Configuration Google Play Console

1. Créez une clé de service :
   - Allez dans [Google Cloud Console](https://console.cloud.google.com)
   - Créez un compte de service
   - Téléchargez le JSON
   - Placez-le dans `android/fastlane/google-play-key.json`

2. Configurez les permissions :
   - Dans Google Play Console → **Setup** → **API access**
   - Liez le compte de service
   - Accordez les permissions nécessaires

### Build et déploiement

#### Build local

```bash
cd android
bundle exec fastlane build
```

Cela génère :
- APK : `android/app/build/outputs/apk/release/app-release.apk`
- AAB : `android/app/build/outputs/bundle/release/app-release.aab`

#### Déploiement Internal Testing (Beta)

```bash
cd android
bundle exec fastlane beta
```

#### Déploiement Production

```bash
cd android
bundle exec fastlane release
```

#### Promotion entre tracks

```bash
# Internal → Beta
cd android
bundle exec fastlane promote_to_beta

# Beta → Production
cd android
bundle exec fastlane promote_to_production
```

### Processus de publication sur Google Play

1. **Internal Testing** : Testez avec votre équipe
2. **Closed Testing** : Tests avec un groupe limité
3. **Open Testing** : Tests publics
4. **Production** : Publication officielle

Dans Google Play Console :
1. Créez une nouvelle release
2. Uploadez l'AAB (ou utilisez Fastlane)
3. Remplissez les notes de version
4. Soumettez pour examen

## CI/CD avec GitHub Actions

### Configuration des secrets

Dans GitHub, allez dans **Settings** → **Secrets and variables** → **Actions** et ajoutez :

#### Pour iOS

```
APPLE_ID
TEAM_ID
ITC_TEAM_ID
APP_STORE_CONNECT_API_KEY_KEY_ID
APP_STORE_CONNECT_API_KEY_ISSUER_ID
APP_STORE_CONNECT_API_KEY_KEY (contenu du fichier .p8)
MATCH_PASSWORD
MATCH_GIT_URL
MATCH_GIT_BASIC_AUTHORIZATION
```

#### Pour Android

```
KEYSTORE_BASE64 (keystore encodé en base64)
KEYSTORE_PASSWORD
KEY_ALIAS
KEY_PASSWORD
PLAY_STORE_JSON_KEY (contenu du fichier JSON)
```

Pour encoder le keystore en base64 :

```bash
base64 -i android/app/keystores/release.keystore | pbcopy
```

### Déclenchement manuel

Le workflow peut être déclenché manuellement via GitHub Actions :

1. Allez dans l'onglet **Actions**
2. Sélectionnez **Mobile Release**
3. Cliquez sur **Run workflow**
4. Choisissez la plateforme (iOS, Android, ou both)
5. Choisissez le type de release (build, beta, release)

### Déclenchement automatique

Le workflow se déclenche automatiquement sur :
- Push sur `main` ou `release/*`
- Tags commençant par `v*`

## Scripts NPM disponibles

```bash
# Build
npm run build:mobile              # Build web pour mobile
npm run mobile:build              # Build web + sync Capacitor

# Capacitor
npm run cap:sync                  # Sync web assets
npm run cap:open:ios             # Ouvrir dans Xcode
npm run cap:open:android         # Ouvrir dans Android Studio

# Déploiement
npm run ios:build                # Build iOS
npm run ios:release              # Release iOS
npm run android:build            # Build Android
npm run android:release          # Release Android
```

## Dépannage

### Problèmes courants iOS

#### Erreur de certificat

```bash
cd ios
bundle exec fastlane match nuke distribution
bundle exec fastlane match appstore
```

#### Problème CocoaPods

```bash
cd ios/App
pod deintegrate
pod install
```

### Problèmes courants Android

#### Erreur de signature

Vérifiez que `android/keystore.properties` existe et contient les bonnes informations.

#### Gradle out of memory

Dans `android/gradle.properties` :

```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=1024m
```

### Logs détaillés

Pour obtenir plus d'informations :

```bash
# iOS
cd ios
bundle exec fastlane beta --verbose

# Android
cd android
bundle exec fastlane beta --verbose
```

## Ressources

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Documentation Fastlane](https://docs.fastlane.tools/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)
- [Guide Match](https://docs.fastlane.tools/actions/match/)

## Support

Pour toute question ou problème :
1. Consultez les issues GitHub
2. Vérifiez la documentation Fastlane
3. Contactez l'équipe de développement
