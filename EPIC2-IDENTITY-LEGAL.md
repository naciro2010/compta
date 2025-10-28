# EPIC 2 : Identité légale & Multi-entités

## Objectif

Modéliser l'identité marocaine (notamment l'ICE à 15 chiffres) et supporter la gestion des multi-entités/établissements afin d'assurer la conformité légale et d'établir les bases du reporting sectoriel.

**Priorité :** Élevée (High)

**Phase :** 0 — Foundations

---

## Résumé des Stories Techniques

| # | Story | Status |
|---|-------|--------|
| 1 | Modéliser l'ICE et les identifiants légaux | ✅ Complété |
| 2 | Gérer multi-établissements par société | ✅ Complété |
| 3 | Rôles et autorisations (RBAC) | ✅ Complété |

---

## Story 1 : Modéliser l'ICE et les identifiants légaux

### Implémentation

#### Types et Interfaces (`types/accounting.ts`)

```typescript
// Identifiants légaux marocains
export interface LegalIdentifiers {
  ice: string;    // ICE - 15 chiffres (9+4+2)
  if: string;     // IF - Identifiant Fiscal (8 chiffres)
  rc?: string;    // RC - Registre de Commerce
  cnss?: string;  // CNSS - Numéro d'affiliation
  patente?: string; // Numéro de Patente
}

// Régime de TVA
export type VATRegime = 'STANDARD' | 'REDUCED' | 'EXEMPT' | 'AUTO_ENTREPRENEUR';

// CompanySettings étendu
export interface CompanySettings {
  // ... existant
  legalIdentifiers: LegalIdentifiers;
  vatRegime: VATRegime;
  vatNumber?: string;
  vatRate?: number;
  // Informations de contact
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
}
```

#### Validation ICE (`lib/accounting/validation.ts`)

**Fonction principale :**
```typescript
validateICE(ice: string): {
  isValid: boolean;
  error?: string;
  parts?: { enterprise: string; establishment: string; checksum: string; };
}
```

**Algorithme :**
1. Vérification de la longueur (15 chiffres)
2. Vérification du format (chiffres uniquement)
3. Extraction des parties : 9 (entreprise) + 4 (établissement) + 2 (clé)
4. Validation de la clé de contrôle (algorithme Luhn modifié)

**Fonctions utilitaires :**
- `formatICE(ice: string)` : Formate pour affichage (XXX XXX XXX XXXX XX)
- `extractEstablishmentCode(ice: string)` : Extrait le code établissement (4 chiffres)
- `validateIF(ifNumber: string)` : Valide l'IF (8 chiffres)
- `validateLegalIdentifiers(identifiers: LegalIdentifiers)` : Validation complète
- `validateCompanySettings(settings: Partial<CompanySettings>)` : Validation société

#### Composant UI (`components/accounting/CompanySetup.tsx`)

**Améliorations :**
- Formulaire structuré en sections :
  - Informations de base
  - Identifiants légaux marocains (ICE, IF, RC, CNSS, Patente)
  - Coordonnées
  - Paramètres comptables
- Validation en temps réel de l'ICE et de l'IF
- Affichage des erreurs et avertissements
- Affichage formaté de l'ICE dans la vue configurée
- Désactivation du bouton si erreurs de validation

---

## Story 2 : Gérer multi-établissements par société

### Implémentation

#### Type Establishment (`types/accounting.ts`)

```typescript
export interface Establishment {
  id: string;
  companyId: string;
  code: string;              // Code établissement (4 chiffres de l'ICE)
  name: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  isMainEstablishment: boolean;  // Siège
  createdAt: Date;
  suspendedAt?: Date;
  suspendedBy?: string;
}
```

#### Extension des écritures

**EntryLine et Entry :**
```typescript
export interface EntryLine {
  // ... existant
  establishmentId?: string;  // Établissement de rattachement
}

export interface Entry {
  // ... existant
  establishmentId?: string;  // Établissement (optionnel)
}
```

#### Store Zustand (`store/accounting.ts`)

**État :**
```typescript
establishments: Establishment[];
currentEstablishment: Establishment | null;
```

**Actions :**
- `createEstablishment(data)` : Créer un établissement
- `updateEstablishment(id, updates)` : Mettre à jour un établissement
- `suspendEstablishment(id, userId)` : Suspendre un établissement
- `setCurrentEstablishment(establishment)` : Sélectionner l'établissement actif

**Création automatique :**
Lors de `initializeCompany()`, un établissement principal est créé automatiquement à partir du code établissement de l'ICE (4 chiffres).

#### Filtrage des rapports

**Fonctions étendues :**
- `getBalance(periodId, establishmentId?)` : Balance par établissement
- `getGeneralLedger(periodId, accountId?, establishmentId?)` : Grand livre par établissement

---

## Story 3 : Rôles et autorisations (RBAC)

### Implémentation

#### Types et Permissions (`types/accounting.ts`)

**Rôles :**
```typescript
export type UserRole = 'ADMIN' | 'ACCOUNTANT' | 'REVIEWER' | 'AUDITOR';
```

**Permissions granulaires :**
```typescript
export type Permission =
  | 'accounts:read' | 'accounts:create' | 'accounts:update' | 'accounts:delete'
  | 'entries:read' | 'entries:create' | 'entries:update' | 'entries:delete' | 'entries:validate'
  | 'periods:read' | 'periods:create' | 'periods:close'
  | 'journals:read' | 'journals:create' | 'journals:update'
  | 'reports:generate' | 'reports:export'
  | 'settings:read' | 'settings:update'
  | 'users:read' | 'users:create' | 'users:update' | 'users:delete'
  | 'audit:read';
```

**Matrice des permissions :**
```typescript
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [...],      // Tous droits
  ACCOUNTANT: [...], // Saisie et consultation
  REVIEWER: [...],   // Validation et clôture
  AUDITOR: [...],    // Lecture seule et audit
};
```

**Utilisateur :**
```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  establishmentIds?: string[];  // Établissements autorisés
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}
```

#### Système de permissions (`lib/accounting/permissions.ts`)

**Fonctions principales :**
- `hasPermission(user, permission)` : Vérifie une permission
- `hasAllPermissions(user, permissions)` : Vérifie toutes les permissions
- `hasAnyPermission(user, permissions)` : Vérifie au moins une permission
- `isAdmin(user)` : Vérifie si administrateur
- `canAccessEstablishment(user, establishmentId)` : Vérifie l'accès à un établissement
- `filterAccessibleEstablishments(user, establishments)` : Filtre les établissements accessibles
- `requirePermission(user, permission)` : Lance une erreur si permission refusée

**Fonctions utilitaires :**
- `getRoleLabel(role)` : Label d'un rôle pour affichage
- `getRoleDescription(role)` : Description d'un rôle
- `getPermissionLabel(permission)` : Label d'une permission
- `groupPermissionsByCategory()` : Groupe les permissions par catégorie

#### Store Zustand - Gestion utilisateurs

**État :**
```typescript
users: User[];
currentUser: User | null;
```

**Actions :**
- `createUser(userData)` : Créer un utilisateur (avec vérification permission)
- `updateUser(id, updates)` : Mettre à jour un utilisateur
- `deleteUser(id)` : Supprimer un utilisateur
- `setCurrentUser(user)` : Définir l'utilisateur actuel

**Création automatique :**
Lors de `initializeCompany()`, un utilisateur ADMIN est créé automatiquement.

#### Journal d'audit global (`lib/accounting/audit.ts`)

**Type GlobalAuditEntry :**
```typescript
export interface GlobalAuditEntry {
  id: string;
  action: AuditAction;
  userId: string;
  user?: User;
  entityType: string;
  entityId: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
}
```

**Actions d'audit :**
```typescript
export type AuditAction =
  | 'USER_LOGIN' | 'USER_LOGOUT'
  | 'ENTRY_CREATE' | 'ENTRY_UPDATE' | 'ENTRY_DELETE' | 'ENTRY_VALIDATE'
  | 'PERIOD_CLOSE' | 'PERIOD_REOPEN'
  | 'ACCOUNT_CREATE' | 'ACCOUNT_UPDATE'
  | 'JOURNAL_CREATE'
  | 'REPORT_EXPORT'
  | 'SETTINGS_UPDATE'
  | 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE';
```

**Fonctions principales :**
- `createAuditEntry(params)` : Créer une entrée d'audit (append-only)
- `getAuditActionLabel(action)` : Label d'une action
- `getAuditActionColor(action)` : Couleur associée pour UI
- `getAuditActionIcon(action)` : Icône associée pour UI
- `formatAuditEntry(entry)` : Formate pour affichage
- `filterAuditEntries(entries, criteria)` : Filtre les entrées
- `exportAuditToCSV(entries)` : Export CSV
- `detectSuspiciousActivities(entries, timeWindow)` : Détecte activités suspectes
- `calculateAuditStatistics(entries)` : Calcule des statistiques

**Store Zustand - Audit :**
```typescript
globalAuditLog: GlobalAuditEntry[];

addAuditEntry(action, entityType, entityId, metadata?): void;
getAuditEntries(filters?): GlobalAuditEntry[];
```

**Enregistrement automatique :**
Toutes les actions sensibles sont automatiquement enregistrées dans le journal d'audit :
- Connexion/déconnexion utilisateur
- Création/modification/suppression d'écritures
- Clôture de périodes
- Création/modification de comptes
- Modification des paramètres
- Gestion des utilisateurs
- Export de rapports

---

## Architecture et Flux de données

### Initialisation de la société

```
CompanySetup (UI)
  │
  ├─> validateCompanySettings() ─> validateLegalIdentifiers() ─> validateICE()
  │
  └─> initializeCompany(settings)
        │
        ├─> Création Establishment principal (code ICE)
        ├─> Création User ADMIN par défaut
        ├─> addAuditEntry('SETTINGS_UPDATE', ...)
        ├─> loadCGNCPlan()
        ├─> Création journaux de base
        └─> createFiscalYear()
```

### Vérification des permissions

```
Action utilisateur
  │
  ├─> hasPermission(currentUser, permission)
  │     │
  │     └─> ROLE_PERMISSIONS[user.role].includes(permission)
  │
  ├─> Si autorisé : exécuter l'action
  │     └─> addAuditEntry(action, ...)
  │
  └─> Si refusé : afficher erreur
```

### Filtrage par établissement

```
getBalance(periodId, establishmentId?)
  │
  ├─> Filtrer entries par periodId
  │
  ├─> Si establishmentId fourni :
  │     └─> Filtrer entries par establishmentId
  │
  └─> Calculer balance
```

---

## Tests et validation

### Build
```bash
npm run build
```
✅ Build réussi sans erreurs TypeScript

### Validation ICE - Exemples

```typescript
// Valide
validateICE('002345678000012')
// ✅ isValid: true, parts: { enterprise: '002345678', establishment: '0000', checksum: '12' }

// Invalide - longueur
validateICE('12345')
// ❌ isValid: false, error: "L'ICE doit contenir exactement 15 chiffres (5 fournis)"

// Invalide - format
validateICE('00234567800001A')
// ❌ isValid: false, error: "L'ICE ne doit contenir que des chiffres"

// Invalide - clé de contrôle
validateICE('002345678000099')
// ❌ isValid: false, error: "Clé de contrôle invalide (attendu: 12, reçu: 99)"
```

---

## Fichiers créés/modifiés

### Nouveaux fichiers
- `lib/accounting/permissions.ts` - Système RBAC
- `lib/accounting/audit.ts` - Journal d'audit immuable
- `EPIC2-IDENTITY-LEGAL.md` - Documentation

### Fichiers modifiés
- `types/accounting.ts` - Types étendus (LegalIdentifiers, Establishment, User, etc.)
- `lib/accounting/validation.ts` - Validation ICE, IF, identifiants légaux
- `store/accounting.ts` - Gestion utilisateurs, établissements, audit
- `components/accounting/CompanySetup.tsx` - Formulaire étendu avec validation

---

## Prochaines étapes (hors scope EPIC 2)

### Composants UI à créer
1. **Gestion des utilisateurs** (`components/users/UserManagement.tsx`)
   - Liste des utilisateurs
   - Création/modification d'utilisateurs
   - Attribution des rôles
   - Gestion des établissements autorisés

2. **Gestion des établissements** (`components/establishments/EstablishmentManagement.tsx`)
   - Liste des établissements
   - Création/modification d'établissements
   - Suspension/réactivation

3. **Journal d'audit** (`components/audit/AuditLog.tsx`)
   - Affichage du journal d'audit
   - Filtrage par utilisateur, action, date
   - Export CSV
   - Détection d'activités suspectes
   - Statistiques

4. **Matrice de permissions** (`components/users/PermissionMatrix.tsx`)
   - Visualisation des permissions par rôle
   - Export pour conformité

### Intégration future
- Authentification réelle (actuellement mock)
- Persistance des données (actuellement en mémoire)
- API backend pour la gestion des utilisateurs
- Notifications pour les actions sensibles
- Logs système (en plus de l'audit applicatif)

---

## Conformité

### ✅ Respect des spécifications EPIC 2

- [x] **Story 1** : Modélisation ICE et identifiants légaux marocains
  - [x] Structure de données société complète
  - [x] Validation ICE (9+4+2) avec algorithme de clé de contrôle
  - [x] Gestion des erreurs de validation
  - [x] Champs obligatoires vérifiés
  - [x] Affichage officiel formaté

- [x] **Story 2** : Multi-établissements par société
  - [x] Modélisation établissements (lié à ICE 4 chiffres)
  - [x] Cycle de vie (création, édition, suspension)
  - [x] Périmètre comptable/analytique (filtrage par établissement)
  - [x] Filtrage des états comptables
  - [x] Support exportation distincte

- [x] **Story 3** : Rôles et autorisations (RBAC)
  - [x] Définition des profils (ADMIN, ACCOUNTANT, REVIEWER, AUDITOR)
  - [x] Gestion des droits granulaires
  - [x] Contrôle d'accès
  - [x] Journal d'audit immuable (append-only)
  - [x] Documentation des rôles (fonctions utilitaires)

---

## Résumé technique

**Lignes de code ajoutées :** ~2000+ lignes
**Nouveaux types/interfaces :** 15+
**Nouvelles fonctions :** 50+
**Tests de build :** ✅ Réussi

**Technologies utilisées :**
- TypeScript (types stricts)
- Zustand (state management)
- Next.js 14 (App Router)
- React hooks

**Principes appliqués :**
- Type safety (TypeScript strict)
- Immutabilité (audit log append-only)
- Separation of concerns (validation, permissions, audit)
- DRY (Don't Repeat Yourself)
- Validation en couches (UI + logique métier)
- Documentation inline (JSDoc)

---

**Date de complétion :** 2025-10-28
**Status :** ✅ EPIC 2 complété avec succès
