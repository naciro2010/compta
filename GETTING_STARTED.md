# 🚀 Guide de Démarrage Rapide - MizanPro

Bienvenue dans MizanPro ! Ce guide vous aidera à démarrer rapidement avec le système complet (Frontend + Backend).

## 📋 Table des Matières

1. [Architecture](#architecture)
2. [Prérequis](#prérequis)
3. [Installation Rapide](#installation-rapide)
4. [Lancement du Backend](#lancement-du-backend)
5. [Lancement du Frontend](#lancement-du-frontend)
6. [Connexion](#connexion)
7. [Fonctionnalités Principales](#fonctionnalités-principales)

---

## 🏗️ Architecture

MizanPro est composé de deux parties :

### Frontend (Next.js + TypeScript)
- **Framework** : Next.js 14 avec App Router
- **Language** : TypeScript
- **UI** : TailwindCSS + composants personnalisés
- **State** : Zustand (pour compatibilité, mais utilise maintenant le backend)
- **i18n** : Support FR, AR, EN

### Backend (Spring Boot + Kotlin)
- **Framework** : Spring Boot 3.2
- **Language** : Kotlin 1.9
- **Build** : Gradle 8.5
- **Base de données** : PostgreSQL (prod) / H2 (dev)
- **Cache** : Redis
- **Security** : JWT + OAuth2 + Spring Security

```
compta/
├── app/                    # Frontend Next.js
├── components/             # Composants React
├── lib/                    # Utilitaires et API client
├── store/                  # Zustand stores (legacy)
├── backend/                # Backend Spring Boot + Kotlin
│   ├── src/main/kotlin/    # Code source Kotlin
│   ├── build.gradle.kts    # Configuration Gradle
│   ├── Dockerfile          # Image Docker
│   └── docker-compose.yml  # Stack complète
└── docs/                   # Documentation
```

---

## 🔧 Prérequis

### Pour le Frontend
- Node.js 18+ et npm/yarn
- Navigateur moderne (Chrome, Firefox, Safari, Edge)

### Pour le Backend
- JDK 17 ou supérieur
- Docker & Docker Compose (recommandé)
- PostgreSQL 16 (si pas Docker)
- Redis 7 (si pas Docker)

---

## ⚡ Installation Rapide

### Option 1 : Avec Docker (Recommandé)

```bash
# 1. Cloner le projet
cd compta

# 2. Lancer le backend avec Docker
cd backend
docker-compose up -d

# 3. Installer les dépendances frontend
cd ..
npm install

# 4. Lancer le frontend
npm run dev
```

✅ **C'est tout !** Le système est maintenant accessible sur :
- Frontend : http://localhost:3000
- Backend : http://localhost:8080
- API Docs : http://localhost:8080/swagger-ui.html

### Option 2 : Sans Docker

#### Backend

```bash
cd backend

# Créer la base de données PostgreSQL
createdb mizanpro

# Configuration (créer .env ou exporter)
export DATABASE_URL=jdbc:postgresql://localhost:5432/mizanpro
export DATABASE_USERNAME=votre_user
export DATABASE_PASSWORD=votre_password
export JWT_SECRET=votre-secret-jwt-min-256-bits
export REDIS_HOST=localhost

# Lancer le backend
./gradlew bootRun

# Ou builder un JAR
./gradlew bootJar
java -jar build/libs/mizanpro-backend-1.0.0.jar
```

#### Frontend

```bash
# Créer .env.local
cp .env.local.example .env.local

# Éditer .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Installer et lancer
npm install
npm run dev
```

---

## 🚀 Lancement du Backend

### Démarrage Simple

```bash
cd backend
./gradlew bootRun
```

Le backend démarre sur **http://localhost:8080**

### Vérification

```bash
# Health check
curl http://localhost:8080/actuator/health

# Devrait retourner : {"status":"UP"}
```

### Endpoints Disponibles

- **API Auth** : http://localhost:8080/api/auth/*
- **API Intégrations** : http://localhost:8080/api/integrations
- **API Docs** : http://localhost:8080/swagger-ui.html
- **H2 Console** (dev) : http://localhost:8080/h2-console
- **Actuator** : http://localhost:8080/actuator

### Logs

```bash
# Voir les logs en temps réel
docker-compose logs -f backend

# Ou avec Gradle
./gradlew bootRun --info
```

---

## 🎨 Lancement du Frontend

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

Le frontend démarre sur **http://localhost:3000**

### Vérification

Ouvrez http://localhost:3000 dans votre navigateur. Vous devriez voir la page d'accueil de MizanPro.

---

## 🔐 Connexion

### Compte Administrateur par Défaut

```
Email : admin@mizanpro.ma
Mot de passe : admin123
```

⚠️ **Important** : Changez ce mot de passe en production !

### Test via API

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mizanpro.ma",
    "password": "admin123",
    "rememberMe": false
  }'

# Réponse
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "admin@mizanpro.ma",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "SUPER_ADMIN"
  }
}
```

### OAuth2 (Optionnel)

Pour utiliser Google/Microsoft/Azure OAuth :

1. **Créer les applications OAuth**
   - Google : https://console.cloud.google.com
   - Microsoft : https://portal.azure.com

2. **Configurer les variables d'environnement**

```bash
# Backend (backend/src/main/resources/application.yml ou .env)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

3. **Accéder aux endpoints OAuth**
   - Google : http://localhost:8080/oauth2/authorization/google
   - Microsoft : http://localhost:8080/oauth2/authorization/microsoft

---

## 🎯 Fonctionnalités Principales

### 1. Authentification Sécurisée

- ✅ Login/Register avec email et mot de passe
- ✅ JWT avec refresh tokens
- ✅ OAuth2 (Google, Microsoft, Azure)
- ✅ Bcrypt password hashing
- ✅ Account lockout après 5 tentatives
- ✅ Session management avec Redis

### 2. Intégrations Comptables

Le backend expose des endpoints pour se connecter à :

- **Sage Business Cloud**
- **QuickBooks Online**
- **Xero**
- **Zoho Books**
- **Odoo**
- **SAP Business One** (Enterprise)
- **FreshBooks** (à venir)
- **Wave Accounting** (à venir)

```bash
# Liste des intégrations
curl http://localhost:8080/api/integrations \
  -H "Authorization: Bearer YOUR_TOKEN"

# Connecter une intégration
curl -X POST http://localhost:8080/api/integrations/sage/connect \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "your-api-key"}'

# Synchroniser
curl -X POST http://localhost:8080/api/integrations/sage/sync \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Gestion Multilingue

Le frontend supporte 3 langues :
- 🇫🇷 Français
- 🇸🇦 Arabe
- 🇬🇧 Anglais

Changez la langue dans le menu utilisateur ou via l'URL.

### 4. Conformité CGNC

- Plan comptable marocain
- Déclarations TVA
- Relevés fiscaux
- Exports comptables

---

## 📊 Architecture Backend Détaillée

### Couches

```
Controller → Service → Repository → Database
     ↓          ↓          ↓
   DTO    → Entity  →   JPA
```

### Sécurité

1. **JwtAuthenticationFilter** : Vérifie le token JWT sur chaque requête
2. **SecurityConfig** : Configuration Spring Security avec CORS
3. **UserDetailsService** : Charge les utilisateurs depuis la DB

### Endpoints

| Endpoint | Méthode | Description | Auth |
|----------|---------|-------------|------|
| `/api/auth/login` | POST | Connexion | ❌ |
| `/api/auth/register` | POST | Inscription | ❌ |
| `/api/auth/refresh` | POST | Refresh token | ❌ |
| `/api/auth/logout` | POST | Déconnexion | ✅ |
| `/api/auth/me` | GET | Utilisateur courant | ✅ |
| `/api/auth/change-password` | POST | Changer mot de passe | ✅ |
| `/api/integrations` | GET | Liste intégrations | ✅ |
| `/api/integrations/{id}/connect` | POST | Connecter | ✅ |
| `/api/integrations/{id}/sync` | POST | Synchroniser | ✅ |

---

## 🧪 Tests

### Backend

```bash
cd backend

# Tous les tests
./gradlew test

# Tests avec coverage
./gradlew test jacocoTestReport

# Tests d'intégration
./gradlew integrationTest
```

### Frontend

```bash
# Tests Jest
npm test

# Tests E2E (si configurés)
npm run test:e2e
```

---

## 🐛 Dépannage

### Le backend ne démarre pas

```bash
# Vérifier Java
java -version  # Doit être 17+

# Vérifier les logs
./gradlew bootRun --info

# Vérifier PostgreSQL
psql -U postgres -c "SELECT version();"

# Vérifier Redis
redis-cli ping  # Doit retourner PONG
```

### Le frontend ne se connecte pas au backend

```bash
# Vérifier .env.local
cat .env.local
# Doit contenir : NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Vérifier le backend est accessible
curl http://localhost:8080/actuator/health

# Vérifier les logs du navigateur (F12)
# Regarder la console et l'onglet Network
```

### Erreur CORS

Le backend a CORS configuré pour :
- http://localhost:3000
- http://localhost:3001

Si vous utilisez un autre port, ajoutez-le dans `backend/src/main/resources/application.yml` :

```yaml
cors:
  allowed-origins: http://localhost:3000,http://localhost:VOTRE_PORT
```

### Base de données ne se crée pas

```bash
# Mode H2 (développement, pas de config requise)
# Le backend utilise H2 en mémoire par défaut

# Mode PostgreSQL (production)
createdb mizanpro
psql mizanpro -c "\dt"  # Lister les tables
```

---

## 📚 Documentation Complète

- **Backend API** : Voir `/backend/README.md`
- **Frontend** : Voir `/README.md`
- **Architecture** : Voir `/docs/`

---

## 🤝 Support

Pour toute question ou problème :
- Email : support@mizanpro.ma
- Issues GitHub : [Ouvrir une issue]
- Documentation : https://docs.mizanpro.ma

---

## 🎉 Prochaines Étapes

1. **Configurer OAuth2** pour Google/Microsoft
2. **Connecter les intégrations** comptables (Sage, QuickBooks, etc.)
3. **Personnaliser** l'application selon vos besoins
4. **Déployer** en production avec Docker

---

**Bon développement avec MizanPro ! 🚀**
