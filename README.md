# CGNC Flow — Application de comptabilité marocaine moderne

Application Next.js de comptabilité générale conforme au plan comptable marocain (CGNC), avec un design inspiré de Claude Code.

## ✨ Caractéristiques

- **Next.js 14** avec App Router et TypeScript
- **Export statique** pour déploiement sur GitHub Pages
- **Design moderne** inspiré de Claude Code
- **Tailwind CSS** pour le styling
- **Zustand** pour la gestion d'état
- **Lucide Icons** pour les icônes

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

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
```

L'application sera accessible sur `http://localhost:3000`

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
/
├── app/                    # App Router Next.js
│   ├── (dashboard)/       # Routes de l'application
│   │   ├── dashboard/
│   │   ├── sales/
│   │   ├── invoices/      ✅ NEW - Gestion factures
│   │   ├── purchases/
│   │   ├── customers/     ✅ NEW - Gestion clients
│   │   ├── suppliers/     ✅ NEW - Gestion fournisseurs
│   │   ├── bank/
│   │   ├── ledger/
│   │   ├── financial-statements/ ✅ NEW - États CGNC
│   │   ├── tax/
│   │   ├── payroll/
│   │   └── settings/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           # Page d'accueil
├── components/            # Composants réutilisables
│   ├── ui/               # Composants UI de base
│   ├── invoicing/        ✅ NEW - Composants facturation
│   │   ├── ThirdPartyForm.tsx
│   │   ├── ThirdPartyList.tsx
│   │   ├── InvoiceForm.tsx
│   │   ├── InvoiceList.tsx
│   │   └── InvoicePDFTemplate.tsx
│   └── Sidebar.tsx
├── store/                 ✅ NEW - État global Zustand
│   └── invoicing.ts       # Store facturation (40+ actions)
├── types/                 ✅ NEW - Types TypeScript
│   ├── accounting.ts
│   └── invoicing.ts
├── lib/                   # Utilitaires
│   └── accounting/
│       └── validation.ts  # Validation ICE, etc.
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions
└── public/               # Fichiers statiques
```

## 🎯 Fonctionnalités

### ✅ Implémentées (Story F.1 & F.2)

- [x] **Gestion des clients** — CRUD complet avec validation ICE
- [x] **Gestion des fournisseurs** — Identifiants légaux marocains
- [x] **Création de factures** — Formulaire multi-lignes avec calculs automatiques
- [x] **Calculs TVA** — Support des taux marocains (20%, 14%, 10%, 7%, 0%)
- [x] **Remises** — Remises par ligne et remise globale
- [x] **Numérotation automatique** — Format FA-2025-00001
- [x] **Template PDF** — Conforme aux normes CGNC (prêt pour impression)
- [x] **États de synthèse** — Bilan, CPC, ESG conformes CGNC
- [x] **Validation ICE** — Contrôle du format et checksum

### 📋 À venir

- [ ] Gestion des devis (Story F.3)
- [ ] Suivi des paiements (Story F.4)
- [ ] Relances automatiques (Story F.5)
- [ ] Intégration comptable automatique (Story F.7)
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
