# CGNC Flow — Application de comptabilité marocaine moderne

Application Next.js de comptabilité générale conforme au plan comptable marocain (CGNC), avec un design inspiré de Claude Code.

## ✨ Caractéristiques

- **Next.js 14** avec App Router et TypeScript
- **Spring Boot 3.2 + Kotlin 1.9** Backend professionnel avec Gradle
- **Export statique** pour déploiement sur GitHub Pages
- **Design moderne** inspiré de Claude Code
- **Tailwind CSS** pour le styling
- **Zustand** pour la gestion d'état (+ API Backend)
- **Lucide Icons** pour les icônes
- **PostgreSQL + Redis** pour le backend
- **JWT + OAuth2** pour l'authentification

## 📊 État du Projet

### ✅ Complété Récemment (Backend Professionnel)

#### 🚀 Backend Spring Boot + Kotlin
- ✅ **Architecture complète** : Spring Boot 3.2, Kotlin 1.9, Gradle 8.5
- ✅ **Base de données** : PostgreSQL (prod) + H2 (dev)
- ✅ **Cache** : Redis pour la gestion des sessions
- ✅ **Documentation** : README complet + Guide de démarrage
- ✅ **Docker** : Dockerfile + docker-compose.yml pour déploiement facile

#### 🔐 Authentification Sécurisée
- ✅ **JWT** : Access tokens + Refresh tokens
- ✅ **OAuth2** : Google, Microsoft, Azure
- ✅ **Spring Security** : Configuration complète avec CORS
- ✅ **Bcrypt** : Password hashing (10 rounds)
- ✅ **Account Lockout** : 5 tentatives max avant verrouillage
- ✅ **API Endpoints** : login, register, refresh, logout, change-password

#### 🔗 Intégrations Comptables (API)
- ✅ **Sage Business Cloud** - Synchronisation comptable
- ✅ **QuickBooks Online** - ERP complet
- ✅ **Xero** - Gestion financière
- ✅ **Zoho Books** - Suite comptable
- ✅ **Odoo** - ERP open source
- ✅ **SAP Business One** - Enterprise
- ✅ **API Endpoints** : /api/integrations/* (liste, statut, connexion, sync)

#### 💻 Frontend Amélioré
- ✅ **API Client** : Client TypeScript pour le backend (`lib/api/client.ts`)
- ✅ **Homepage** : Section "Backend Professionnel" avec showcase
- ✅ **Intégrations** : Affichage des intégrations disponibles
- ✅ **OAuth2 UI** : Préparé pour Google/Microsoft login

#### 📚 Documentation
- ✅ **backend/README.md** : Documentation complète du backend
- ✅ **GETTING_STARTED.md** : Guide de démarrage rapide
- ✅ **.env.local.example** : Template de configuration
- ✅ **API Documentation** : OpenAPI/Swagger ready

### 🚧 En Cours / À Faire

**Résumé :**
```
🚧 À FAIRE (34 items)
├── 7 Backend (Tests, OAuth2 config, API métier...)
├── 6 Frontend (Migration auth, OAuth2 UI...)
├── 6 Infrastructure (CI/CD, Monitoring, K8s...)
├── 6 Sécurité (Rate limit, 2FA, SAML...)
└── 7 Modules Métier (API Factures, Clients...)
```

#### Backend
- [ ] **Connexion Frontend ↔ Backend** : Remplacer Zustand auth par API backend
- [ ] **Tests** : Tests unitaires et d'intégration (JUnit, Mockk)
- [ ] **OAuth2 Configuration** : Configurer vraies apps Google/Microsoft
- [ ] **Intégrations** : Implémenter les vraies connexions API (Sage, QuickBooks, etc.)
- [ ] **API Métier** : Endpoints pour factures, clients, fournisseurs, etc.
- [ ] **Webhooks** : Réception d'événements des intégrations
- [ ] **Jobs asynchrones** : Synchronisation en arrière-plan

#### Frontend
- [ ] **Migration Auth** : Utiliser `lib/api/client.ts` au lieu de `store/auth.ts`
- [ ] **Gestion des tokens** : Automatic refresh token rotation
- [ ] **OAuth2 Buttons** : Boutons "Se connecter avec Google/Microsoft"
- [ ] **Loading states** : Indicateurs de chargement pour les appels API
- [ ] **Error handling** : Gestion d'erreurs robuste avec retry
- [ ] **Intégrations UI** : Interfaces pour configurer les intégrations

#### Infrastructure
- [ ] **CI/CD** : Pipeline GitHub Actions pour le backend
- [ ] **Monitoring** : Prometheus + Grafana
- [ ] **Logs** : ELK Stack ou équivalent
- [ ] **Déploiement** : Configuration Kubernetes ou Docker Swarm
- [ ] **Backup** : Stratégie de backup PostgreSQL
- [ ] **SSL/TLS** : Configuration HTTPS en production

#### Sécurité
- [ ] **Rate Limiting** : Protection contre le brute force
- [ ] **SAML Support** : Pour les entreprises
- [ ] **2FA/MFA** : Authentification à deux facteurs
- [ ] **Audit Logs** : Logs détaillés des actions utilisateurs
- [ ] **Permissions** : Système de permissions granulaires
- [ ] **API Keys** : Gestion de clés API pour intégrations

#### Modules Métier
- [ ] **API Factures** : CRUD factures côté backend
- [ ] **API Clients** : CRUD clients côté backend
- [ ] **API Fournisseurs** : CRUD fournisseurs côté backend
- [ ] **API Paiements** : Gestion des paiements
- [ ] **API Banque** : Rapprochements bancaires
- [ ] **API TVA** : Déclarations fiscales
- [ ] **API États** : États financiers CGNC

## 🚀 Modules

- **Dashboard** — Vue d'ensemble de l'activité
- **Ventes** — Facturation (devis, commandes, livraisons, factures, avoirs)
- **Factures** ✅ — Gestion complète des factures clients avec calculs automatiques
- **Achats** — Gestion des fournisseurs
- **Clients** ✅ — Gestion des clients avec identifiants légaux (ICE, IF, RC, CNSS)
- **Fournisseurs** ✅ — Gestion des fournisseurs
- **Banque** — Rapprochement bancaire
- **Grand livre** — Plan comptable CGNC
- **États de synthèse** ✅ — Bilan, CPC, ESG (Normes CGNC)
- **TVA** — Déclarations fiscales
- **Paie** — Bulletins et CNSS
- **Paramètres** — Configuration

## 📦 Installation

### Frontend uniquement (mode démo)

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
```

L'application sera accessible sur `http://localhost:3000`

### Avec Backend (mode complet)

#### Option 1 : Docker (Recommandé)

```bash
# 1. Lancer le backend (PostgreSQL + Redis + Spring Boot)
cd backend
docker-compose up -d

# 2. Lancer le frontend
cd ..
npm install
npm run dev
```

#### Option 2 : Sans Docker

```bash
# 1. Backend (nécessite JDK 17+, PostgreSQL, Redis)
cd backend
./gradlew bootRun

# 2. Frontend
cd ..
npm install
npm run dev
```

**Accès :**
- Frontend : http://localhost:3000
- Backend : http://localhost:8080
- API Docs : http://localhost:8080/swagger-ui.html

**Compte admin :**
- Email : `admin@mizanpro.ma`
- Mot de passe : `admin123`

📖 **Guide complet** : Voir [GETTING_STARTED.md](GETTING_STARTED.md) pour plus de détails.

## 🎨 Design System

L'application utilise un design system inspiré de Claude Code avec :

- Palette de couleurs sombre et élégante
- Typographie system-ui pour une lecture optimale
- Composants réutilisables (Button, Card, Input, etc.)
- Transitions fluides
- Scrollbar personnalisée

## 🌍 Déploiement

L'application est configurée pour être déployée automatiquement sur GitHub Pages via GitHub Actions.

### Configuration GitHub Pages

1. Allez dans **Settings** → **Pages**
2. Source : **GitHub Actions**
3. Le workflow `.github/workflows/deploy.yml` se chargera du déploiement

Chaque push sur `main` ou `master` déclenchera un déploiement automatique.

## 🛠️ Technologies

- [Next.js 14](https://nextjs.org/) - Framework React
- [TypeScript](https://www.typescriptlang.org/) - Typage statique
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Zustand](https://github.com/pmndrs/zustand) - Gestion d'état
- [Lucide React](https://lucide.dev/) - Icônes
- [date-fns](https://date-fns.org/) - Manipulation de dates

## 📝 Structure du projet

```
compta/
├── app/                           # App Router Next.js (Frontend)
│   ├── (auth)/                    # Routes d'authentification
│   │   └── login/                 # Page de login
│   ├── (dashboard)/               # Routes de l'application
│   │   ├── dashboard/
│   │   ├── sales/
│   │   ├── invoices/              ✅ Gestion factures
│   │   ├── purchases/
│   │   ├── customers/             ✅ Gestion clients
│   │   ├── suppliers/             ✅ Gestion fournisseurs
│   │   ├── bank/
│   │   ├── ledger/
│   │   ├── financial-statements/  ✅ États CGNC
│   │   ├── tax/
│   │   ├── payroll/
│   │   └── settings/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Page d'accueil
├── backend/                       # ✅ NEW - Backend Spring Boot + Kotlin
│   ├── src/
│   │   ├── main/
│   │   │   ├── kotlin/ma/mizanpro/backend/
│   │   │   │   ├── config/        # SecurityConfig, OAuth2Config
│   │   │   │   ├── controller/    # REST Controllers (Auth, Integrations)
│   │   │   │   ├── dto/           # Request/Response DTOs
│   │   │   │   ├── entity/        # JPA Entities (User, RefreshToken)
│   │   │   │   ├── repository/    # Spring Data Repositories
│   │   │   │   ├── security/      # JWT, Filters, UserDetailsService
│   │   │   │   └── service/       # Business Logic Services
│   │   │   └── resources/
│   │   │       └── application.yml # Configuration Spring
│   │   └── test/                  # Tests (à implémenter)
│   ├── build.gradle.kts           # Configuration Gradle
│   ├── Dockerfile                 # Image Docker
│   ├── docker-compose.yml         # PostgreSQL + Redis + Backend
│   └── README.md                  # Documentation backend
├── components/                    # Composants réutilisables
│   ├── ui/                        # Composants UI de base
│   ├── auth/                      # Composants authentification
│   ├── invoicing/                 ✅ Composants facturation
│   │   ├── ThirdPartyForm.tsx
│   │   ├── ThirdPartyList.tsx
│   │   ├── InvoiceForm.tsx
│   │   ├── InvoiceList.tsx
│   │   └── InvoicePDFTemplate.tsx
│   └── Sidebar.tsx
├── lib/                           # Utilitaires
│   ├── api/                       # ✅ NEW - API Client
│   │   └── client.ts              # Client TypeScript pour backend
│   ├── accounting/
│   │   └── validation.ts          # Validation ICE, etc.
│   └── i18n/                      # Internationalisation (FR/AR/EN)
├── store/                         # État global Zustand
│   ├── auth.ts                    # Store auth (legacy, à migrer vers API)
│   └── invoicing.ts               # Store facturation (40+ actions)
├── types/                         # Types TypeScript
│   ├── accounting.ts
│   ├── auth.ts                    # Types authentification
│   └── invoicing.ts
├── docs/                          # Documentation
│   └── *.md                       # Guides et documentation
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions (frontend)
├── .env.local.example             # ✅ NEW - Template configuration
├── GETTING_STARTED.md             # ✅ NEW - Guide de démarrage
└── public/                        # Fichiers statiques
```

## 🎯 Fonctionnalités

### ✅ Implémentées

- [x] **Gestion des clients** — CRUD complet avec validation ICE
- [x] **Gestion des fournisseurs** — Identifiants légaux marocains
- [x] **Création de factures** — Formulaire multi-lignes avec calculs automatiques
- [x] **Calculs TVA** — Support des taux marocains (20%, 14%, 10%, 7%, 0%)
- [x] **Remises** — Remises par ligne et remise globale
- [x] **Numérotation automatique** — Format FA-2025-00001
- [x] **Template PDF** — Conforme aux normes CGNC (prêt pour impression)
- [x] **États de synthèse** — Bilan, CPC, ESG conformes CGNC
- [x] **Validation ICE** — Contrôle du format et checksum
- [x] **Suivi des paiements** — Enregistrement et timeline des paiements (Story F.4)
- [x] **Relances automatiques** — Système d'alertes et templates personnalisables (Story F.5)
- [x] **Intégration GL** — Génération automatique d'écritures comptables depuis factures et paiements (Story F.7)

### 📋 À venir
- [ ] Import de relevés bancaires
- [ ] Rapprochement automatique
- [ ] Déclarations TVA
- [ ] Exports comptables
- [ ] Génération PDF automatique (avec bibliothèque tierce)
- [ ] Support bilingue FR/AR
- [ ] Mode hors ligne avec LocalStorage
- [ ] Analytics et tableaux de bord

## 📄 Licence

POC à usage de démonstration. Non destiné à la production.

---

**Note** : Ceci est une refonte complète de l'application avec une stack moderne et un design inspiré de Claude Code. L'ancienne version (Alpine.js) est archivée dans le dossier `_old/`.
