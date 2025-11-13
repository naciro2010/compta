# MizanPro Backend

Backend API pour MizanPro - Logiciel de gestion comptable marocain

## 🚀 Technologies

- **Kotlin** 1.9.21
- **Spring Boot** 3.2.0
- **Gradle** 8.5
- **PostgreSQL** 16
- **Redis** 7
- **JWT** Authentication
- **OAuth2** (Google, Microsoft, Azure)
- **Spring Security**
- **Spring Data JPA**

## 📋 Prérequis

- JDK 17 ou supérieur
- Docker & Docker Compose (optionnel)
- PostgreSQL 16 (si pas Docker)
- Redis 7 (si pas Docker)

## 🛠️ Installation

### Avec Docker (Recommandé)

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter les services
docker-compose down
```

### Sans Docker

1. **Installer PostgreSQL et Redis**

2. **Configurer la base de données**
```bash
createdb mizanpro
```

3. **Configurer les variables d'environnement**
```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/mizanpro
export DATABASE_USERNAME=votre_user
export DATABASE_PASSWORD=votre_password
export JWT_SECRET=votre-secret-jwt-min-256-bits
```

4. **Lancer l'application**
```bash
./gradlew bootRun
```

## 🔑 Authentification

### Compte par défaut

```
Email: admin@mizanpro.ma
Mot de passe: admin123
```

### API Endpoints

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@mizanpro.ma",
  "password": "admin123",
  "rememberMe": false
}
```

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "language": "fr",
  "timezone": "Africa/Casablanca"
}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer your-access-token
```

## 🔗 Intégrations

Le backend supporte les intégrations avec:

### ✅ Disponibles
- **Sage Business Cloud** - Synchronisation comptable
- **QuickBooks Online** - ERP complet
- **Xero** - Gestion financière
- **Zoho Books** - Suite comptable
- **Odoo** - ERP open source

### 🔜 À venir
- **FreshBooks** - Facturation et temps
- **Wave Accounting** - Comptabilité gratuite

### 🏢 Enterprise
- **SAP Business One** - ERP entreprise

### Utilisation

```bash
# Liste des intégrations
GET /api/integrations

# Statut d'une intégration
GET /api/integrations/{integrationId}/status

# Connecter une intégration
POST /api/integrations/{integrationId}/connect

# Synchroniser
POST /api/integrations/{integrationId}/sync
```

## 🔐 OAuth2

### Google OAuth

1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com)
2. Configurer OAuth2 credentials
3. Ajouter les variables d'environnement:

```bash
export GOOGLE_CLIENT_ID=your-client-id
export GOOGLE_CLIENT_SECRET=your-client-secret
```

### Microsoft/Azure OAuth

1. Créer une app sur [Azure Portal](https://portal.azure.com)
2. Configurer les variables:

```bash
export MICROSOFT_CLIENT_ID=your-client-id
export MICROSOFT_CLIENT_SECRET=your-client-secret
export AZURE_CLIENT_ID=your-azure-client-id
export AZURE_CLIENT_SECRET=your-azure-client-secret
```

## 📊 Monitoring

### Actuator Endpoints

```bash
# Health check
GET /actuator/health

# Metrics (Prometheus format)
GET /actuator/metrics

# Application info
GET /actuator/info
```

### H2 Console (Dev only)

```
URL: http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:mizanpro
Username: sa
Password: (vide)
```

## 🏗️ Architecture

```
backend/
├── src/
│   ├── main/
│   │   ├── kotlin/ma/mizanpro/backend/
│   │   │   ├── config/          # Configuration Spring
│   │   │   ├── controller/      # REST Controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── entity/          # JPA Entities
│   │   │   ├── repository/      # Spring Data Repositories
│   │   │   ├── security/        # JWT & Security
│   │   │   └── service/         # Business Logic
│   │   └── resources/
│   │       └── application.yml  # Configuration
│   └── test/                    # Tests
├── build.gradle.kts             # Gradle config
├── Dockerfile                   # Docker image
└── docker-compose.yml           # Services stack
```

## 🧪 Tests

```bash
# Lancer les tests
./gradlew test

# Tests avec coverage
./gradlew test jacocoTestReport

# Tests d'intégration
./gradlew integrationTest
```

## 📦 Build

```bash
# Build JAR
./gradlew bootJar

# Build Docker image
docker build -t mizanpro-backend:1.0.0 .

# Build avec Gradle
./gradlew bootBuildImage
```

## 🌍 Environnements

### Development
```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### Production
```bash
./gradlew bootJar
java -jar build/libs/mizanpro-backend-1.0.0.jar --spring.profiles.active=prod
```

## 🔧 Configuration

Toutes les configurations sont dans `src/main/resources/application.yml`

### Variables d'environnement importantes

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | URL de la base de données | `jdbc:h2:mem:mizanpro` |
| `JWT_SECRET` | Secret pour JWT (min 256 bits) | - |
| `REDIS_HOST` | Hôte Redis | `localhost` |
| `CORS_ALLOWED_ORIGINS` | Origins autorisées | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | - |
| `MICROSOFT_CLIENT_ID` | Microsoft OAuth Client ID | - |

## 🛡️ Sécurité

- ✅ JWT avec refresh tokens
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Account lockout (5 tentatives)
- ✅ CORS configuré
- ✅ OAuth2 (Google, Microsoft, Azure)
- ✅ Session Redis avec expiration
- ✅ HTTPS ready

## 📝 License

Propriétaire - MizanPro © 2025

## 🤝 Support

Pour toute question ou problème:
- Email: support@mizanpro.ma
- Documentation: https://docs.mizanpro.ma
