# 🔐 Guide de Signature des Applications

Ce guide explique en détail la signature des applications iOS et Android pour MizanPro.

## Table des matières

- [Pourquoi signer les applications ?](#pourquoi-signer-les-applications)
- [Signature iOS](#signature-ios)
- [Signature Android](#signature-android)
- [Sécurité et meilleures pratiques](#sécurité-et-meilleures-pratiques)

## Pourquoi signer les applications ?

La signature des applications garantit :

1. **Authenticité** : Prouve que l'app provient bien de vous
2. **Intégrité** : Assure que l'app n'a pas été modifiée
3. **Sécurité** : Protège contre les applications malveillantes
4. **Mises à jour** : Seul le détenteur de la clé peut publier des mises à jour

⚠️ **IMPORTANT** : Perdre vos clés de signature = impossibilité de mettre à jour vos apps !

## Signature iOS

### Concepts

iOS utilise plusieurs types de certificats et profils :

1. **Certificates** (Certificats)
   - Development Certificate (développement)
   - Distribution Certificate (App Store)

2. **Provisioning Profiles** (Profils de provisioning)
   - Development Profile
   - App Store Profile
   - Ad Hoc Profile (distribution hors App Store)

3. **App IDs** (Identifiants d'application)
   - Bundle Identifier : `com.mizanpro.app`

4. **Devices** (Appareils)
   - UDIDs des appareils de test

### Méthode 1 : Fastlane Match (Recommandé)

Match automatise la gestion des certificats en les stockant dans un dépôt Git.

#### Configuration initiale

```bash
cd ios
bundle exec fastlane match init
```

Répondez aux questions :
- Storage mode : `git`
- Git URL : URL de votre dépôt privé pour les certificats

#### Créer les certificats

```bash
# Certificat de développement
bundle exec fastlane match development

# Certificat App Store
bundle exec fastlane match appstore

# Certificat Ad Hoc
bundle exec fastlane match adhoc
```

Match va :
1. Créer les certificats sur Apple Developer
2. Les télécharger
3. Les chiffrer avec un mot de passe
4. Les commiter dans le dépôt Git

#### Variables d'environnement

Créez `ios/fastlane/.env` :

```bash
MATCH_GIT_URL=https://github.com/votre-org/certificates-private
MATCH_PASSWORD=votre_mot_de_passe_tres_securise

# Pour l'authentification Git
MATCH_GIT_BASIC_AUTHORIZATION=base64_encoded_credentials
```

Pour générer `MATCH_GIT_BASIC_AUTHORIZATION` :

```bash
echo -n "username:personal_access_token" | base64
```

#### Utiliser les certificats

Match les installe automatiquement lors du build :

```bash
bundle exec fastlane beta  # Match s'exécute automatiquement
```

#### Synchronisation entre machines

Sur une nouvelle machine :

```bash
cd ios
bundle exec fastlane match development --readonly
bundle exec fastlane match appstore --readonly
```

#### Reset en cas de problème

```bash
# ⚠️ ATTENTION : Ceci supprime TOUS les certificats et profils

# Supprimer certificats development
bundle exec fastlane match nuke development

# Supprimer certificats distribution
bundle exec fastlane match nuke distribution

# Puis recréer
bundle exec fastlane match development
bundle exec fastlane match appstore
```

### Méthode 2 : Manuelle (Apple Developer Portal)

Si vous ne souhaitez pas utiliser Match :

#### 1. Créer un App ID

1. Allez sur [Apple Developer Portal](https://developer.apple.com/account)
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Cliquez sur **+**
4. Sélectionnez **App IDs** → **App**
5. Configuration :
   - Description : `MizanPro`
   - Bundle ID : `com.mizanpro.app`
   - Capabilities : Sélectionnez celles nécessaires

#### 2. Créer un certificat

1. **Certificates** → **+**
2. Sélectionnez le type :
   - **iOS Development** pour développement
   - **iOS Distribution** pour App Store
3. Générez un CSR (Certificate Signing Request) :

```bash
# Sur macOS, ouvrir Keychain Access
# Menu : Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority

# Remplir :
# - User Email Address : votre email
# - Common Name : MizanPro Distribution
# - Request is: Saved to disk
```

4. Uploadez le CSR
5. Téléchargez le certificat (.cer)
6. Double-cliquez pour l'installer dans Keychain

#### 3. Créer un profil de provisioning

1. **Profiles** → **+**
2. Type : **App Store** (pour production)
3. Sélectionnez votre App ID
4. Sélectionnez votre certificat
5. Téléchargez le profil (.mobileprovision)

#### 4. Configuration dans Xcode

```bash
npx cap open ios
```

Dans Xcode :
1. Sélectionnez le projet **App**
2. **Signing & Capabilities**
3. Décochez "Automatically manage signing"
4. **Provisioning Profile** : Sélectionnez votre profil
5. **Signing Certificate** : Sélectionnez votre certificat

### App Store Connect API (Authentification recommandée)

Plus sécurisée que l'Apple ID/mot de passe.

#### 1. Créer une clé API

1. [App Store Connect](https://appstoreconnect.apple.com)
2. **Users and Access** → **Keys** (onglet Integrations)
3. Cliquez sur **+**
4. Nom : `MizanPro CI/CD`
5. Access : **App Manager**
6. Téléchargez le fichier `.p8` (une seule fois !)
7. Notez le **Key ID** et **Issuer ID**

#### 2. Configuration

Dans `ios/fastlane/.env` :

```bash
APP_STORE_CONNECT_API_KEY_KEY_ID=XXXXXXXXXX
APP_STORE_CONNECT_API_KEY_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
APP_STORE_CONNECT_API_KEY_KEY_FILEPATH=./AuthKey_XXXXXXXXXX.p8
```

Ou utilisez directement dans Fastfile :

```ruby
app_store_connect_api_key(
  key_id: ENV["APP_STORE_CONNECT_API_KEY_KEY_ID"],
  issuer_id: ENV["APP_STORE_CONNECT_API_KEY_ISSUER_ID"],
  key_filepath: ENV["APP_STORE_CONNECT_API_KEY_KEY_FILEPATH"]
)
```

## Signature Android

### Concepts

Android utilise un système de keystore :

- **Keystore** : Fichier contenant une ou plusieurs clés privées
- **Key Alias** : Nom de la clé dans le keystore
- **Passwords** : Mot de passe du keystore et de la clé

### Génération du Keystore

#### Méthode automatique (recommandé)

```bash
./scripts/generate-android-keystore.sh
```

Ce script vous guide à travers la génération.

#### Méthode manuelle

```bash
keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore android/app/keystores/release.keystore \
  -alias mizanpro \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass MOT_DE_PASSE_KEYSTORE \
  -keypass MOT_DE_PASSE_CLE \
  -dname "CN=Votre Nom, OU=Votre Organisation, O=Votre Organisation, L=Ville, ST=Region, C=MA"
```

Paramètres :
- `-storetype PKCS12` : Format moderne de keystore
- `-keyalg RSA -keysize 2048` : Algorithme et taille de clé
- `-validity 10000` : Validité en jours (environ 27 ans)
- `-alias` : Nom de la clé (ex: mizanpro)

### Configuration du Keystore

#### 1. Créer keystore.properties

Créez `android/keystore.properties` :

```properties
storeFile=keystores/release.keystore
storePassword=VOTRE_MOT_DE_PASSE_KEYSTORE
keyAlias=mizanpro
keyPassword=VOTRE_MOT_DE_PASSE_CLE
```

⚠️ Ce fichier est automatiquement ignoré par git !

#### 2. Vérifier build.gradle

Le fichier `android/app/build.gradle` est déjà configuré :

```gradle
// Load keystore properties
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ...

    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ...
        }
    }
}
```

### Vérifier la signature

#### Lister les clés du keystore

```bash
keytool -list -v \
  -keystore android/app/keystores/release.keystore \
  -storepass VOTRE_MOT_DE_PASSE
```

#### Vérifier la signature d'un APK

```bash
# Installer apksigner (part of Android SDK)
apksigner verify --verbose app-release.apk

# Avec jarsigner
jarsigner -verify -verbose -certs app-release.apk
```

### Google Play App Signing

Google Play peut gérer la clé de signature finale.

#### Configuration

1. **Google Play Console** → Votre app → **Setup** → **App integrity**
2. Activez **Google Play App Signing**
3. Uploadez votre keystore ou laissez Google en créer un

#### Avantages

- Google stocke la clé finale de manière sécurisée
- Vous pouvez révoquer votre upload key si compromise
- Google optimise les APKs pour chaque appareil

#### Upload Key vs App Signing Key

- **Upload Key** : Clé que vous utilisez pour signer les bundles uploadés
- **App Signing Key** : Clé finale utilisée par Google Play

```
Vous → Upload Key → Google Play → App Signing Key → Utilisateurs
```

### Service Account (Google Play Console API)

Pour automatiser les déploiements.

#### 1. Créer un compte de service

1. [Google Cloud Console](https://console.cloud.google.com)
2. Créez un projet (si pas déjà fait)
3. **IAM & Admin** → **Service Accounts**
4. **Create Service Account**
   - Name : `mizanpro-fastlane`
   - Role : `Service Account User`
5. **Keys** → **Add Key** → **JSON**
6. Téléchargez le fichier JSON

#### 2. Activer l'API Google Play

1. [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Library**
3. Recherchez "Google Play Android Developer API"
4. Cliquez sur **Enable**

#### 3. Donner accès dans Play Console

1. [Google Play Console](https://play.google.com/console)
2. **Setup** → **API access**
3. Liez votre projet Google Cloud
4. Sous **Service accounts**, accordez l'accès
5. Permissions : **Admin** (Release to production, manage releases)

#### 4. Configuration Fastlane

Dans `android/fastlane/Appfile` :

```ruby
json_key_file("./fastlane/google-play-key.json")
package_name("com.mizanpro.app")
```

Ou avec variable d'environnement :

```bash
# android/fastlane/.env
PLAY_STORE_JSON_KEY_PATH=./fastlane/google-play-key.json
```

## Sécurité et meilleures pratiques

### Stockage des secrets

#### ❌ Ne JAMAIS :

- Commiter les keystores dans Git
- Commiter les mots de passe
- Commiter les clés API
- Partager les fichiers .p8 ou .json publiquement
- Stocker les secrets non chiffrés

#### ✅ TOUJOURS :

- Utiliser `.gitignore` pour exclure les secrets
- Stocker les keystores dans un coffre-fort sécurisé
- Utiliser des variables d'environnement en CI/CD
- Chiffrer les secrets (ex: GitHub Secrets, 1Password)
- Avoir des backups des keystores

### Checklist de sécurité

- [ ] Keystores et certificats backupés dans un lieu sûr
- [ ] Mots de passe stockés dans un gestionnaire de mots de passe
- [ ] `.gitignore` configuré correctement
- [ ] Secrets GitHub configurés pour CI/CD
- [ ] Accès aux comptes Developer limité (2FA activée)
- [ ] Documentation des secrets (sans les valeurs !) accessible à l'équipe

### Backup recommandé

```bash
# Créer une archive chiffrée
tar -czf mizanpro-secrets.tar.gz \
  android/app/keystores/release.keystore \
  android/keystore.properties \
  ios/fastlane/AuthKey_*.p8

# Chiffrer avec GPG
gpg -c mizanpro-secrets.tar.gz

# Supprimer l'archive non chiffrée
rm mizanpro-secrets.tar.gz

# Stocker mizanpro-secrets.tar.gz.gpg dans :
# - Coffre-fort cloud (1Password, LastPass)
# - Disque dur externe chiffré
# - USB chiffrée
```

### Rotation des clés

#### iOS

Les certificats iOS expirent après 1 an. Match les renouvelle automatiquement :

```bash
cd ios
bundle exec fastlane match appstore
```

#### Android

Les keystores Android ne devraient jamais être changés (sinon impossible de mettre à jour l'app).

Si compromis :
1. Contactez Google Play Support
2. Ils peuvent vous aider à changer la clé (avec Google Play App Signing activé)

### CI/CD Secrets

#### GitHub Actions

Encodez les fichiers en base64 :

```bash
# Keystore Android
base64 -i android/app/keystores/release.keystore > keystore.b64

# Puis dans GitHub Secrets :
KEYSTORE_BASE64=<contenu de keystore.b64>

# Clé iOS
cat ios/fastlane/AuthKey_XXXXX.p8 | base64
# Copier dans APP_STORE_CONNECT_API_KEY_KEY
```

Dans le workflow :

```yaml
- name: Decode Keystore
  run: |
    echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 --decode > android/app/release.keystore
```

## Dépannage

### iOS : "Signing certificate is invalid"

```bash
# Reset Match
cd ios
bundle exec fastlane match nuke distribution
bundle exec fastlane match appstore
```

### Android : "Failed to read key from keystore"

```bash
# Vérifier le keystore
keytool -list -keystore android/app/keystores/release.keystore

# Vérifier keystore.properties
cat android/keystore.properties
```

### "Provisioning profile doesn't match"

Dans Xcode :
1. Product → Clean Build Folder
2. Xcode → Preferences → Accounts → Download Manual Profiles
3. Rebuild

## Ressources

- [Code Signing Guide (Apple)](https://developer.apple.com/support/code-signing/)
- [Fastlane Match](https://docs.fastlane.tools/actions/match/)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [Google Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)
