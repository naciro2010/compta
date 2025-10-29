# EPIC Facturation & Gestion Tiers

## Vue d'ensemble

L'EPIC Facturation est un module essentiel du MVP permettant aux TPE/PME marocaines de gérer le cycle commercial complet : Devis → Factures → Paiements, ainsi que la gestion des clients et fournisseurs.

**Status:** Story F.1 (Gestion Tiers) - ✅ Complétée

**Priorité:** 🔴 CRITIQUE - Bloquant MVP

---

## Architecture Technique

### Structure des Fichiers

```
/types/invoicing.ts                          (✅ Créé)
  - Types complets pour facturation
  - ThirdParty, Invoice, Payment, etc.

/store/invoicing.ts                          (✅ Créé)
  - Store Zustand avec 40+ actions
  - State management complet

/components/invoicing/
  ├── ThirdPartyForm.tsx                     (✅ Créé)
  ├── ThirdPartyList.tsx                     (✅ Créé)
  ├── InvoiceForm.tsx                        (❌ À créer - Story F.2)
  ├── InvoiceList.tsx                        (❌ À créer - Story F.2)
  └── PaymentForm.tsx                        (❌ À créer - Story F.4)

/app/(dashboard)/
  ├── customers/page.tsx                     (✅ Créé)
  ├── suppliers/page.tsx                     (✅ Créé)
  └── sales/page.tsx                         (⚠️ Existant - À migrer)
```

---

## Story F.1 : Gestion Tiers (✅ COMPLÉTÉE)

### Objectif
Permettre la création, modification et gestion complète des clients et fournisseurs avec tous les identifiants légaux marocains (ICE, IF, RC, CNSS).

### Fonctionnalités Implémentées

#### 1. Types TypeScript (`types/invoicing.ts`)

**Types Principaux:**
- `ThirdParty` - Client/Fournisseur complet
- `ThirdPartyType` - CLIENT | SUPPLIER | BOTH
- `PaymentTerms` - Conditions de paiement
- `Invoice` - Facture complète
- `InvoiceLine` - Ligne de facture
- `Payment` - Paiement
- `InvoiceReminder` - Relance

**Validation:**
- ICE 15 chiffres (intégration `validateICE()`)
- Champs obligatoires
- Formats emails/téléphones

#### 2. Store Zustand (`store/invoicing.ts`)

**State:**
```typescript
{
  thirdParties: ThirdParty[]
  currentThirdParty: ThirdParty | null
  invoices: Invoice[]
  currentInvoice: Invoice | null
  payments: Payment[]
  numberingConfigs: InvoiceNumberingConfig[]
  templates: InvoiceTemplate[]
  activeTemplate: InvoiceTemplate | null
  isLoading: boolean
  error: string | null
}
```

**Actions Tiers (10 actions):**
- `createThirdParty()` - Créer un tiers
- `updateThirdParty()` - Mettre à jour
- `deleteThirdParty()` - Soft delete
- `getThirdParty()` - Récupérer par ID
- `searchThirdParties()` - Recherche texte
- `getCustomers()` - Filtrer clients
- `getSuppliers()` - Filtrer fournisseurs
- `setCurrentThirdParty()` - Sélection
- `generateThirdPartyCode()` - Auto-génération code (CLI-0001, FRS-0001)

**Actions Factures (15 actions):**
- CRUD complet factures/devis
- Calculs automatiques (HT, TVA, TTC)
- Gestion des lignes
- Changement de statut
- Conversion devis → facture
- Génération avoirs
- Duplication

**Actions Paiements (3 actions):**
- Enregistrement paiements
- Mise à jour soldes
- Historique

**Actions Utilitaires:**
- Numérotation automatique
- Statistiques et KPIs
- Recherche et filtres

#### 3. Composants UI

##### ThirdPartyForm.tsx
**Fonctionnalités:**
- Formulaire complet multi-sections
- Validation temps réel (ICE, emails)
- Support création/édition
- Champs conditionnels (type CLIENT vs SUPPLIER)
- Auto-génération code tiers

**Sections:**
1. **Informations générales** - Type, Code, Raison sociale
2. **Identifiants légaux** - ICE, IF, RC, CNSS, Patente
3. **Coordonnées** - Adresse, Ville, Téléphones, Emails
4. **Contact principal** - Nom, Fonction, Contacts
5. **Paramètres commerciaux** (clients) - Conditions paiement, Encours, Remise
6. **Paramètres fiscaux** - Régime TVA, Taux, Devise
7. **Notes internes** - Zone de texte libre

**Validation:**
- Raison sociale obligatoire
- Code unique obligatoire
- ICE validé si fourni (15 chiffres + checksum)
- Email format valide

##### ThirdPartyList.tsx
**Fonctionnalités:**
- Liste complète avec recherche
- Filtres par type (CLIENT/SUPPLIER/BOTH)
- Statistiques en tête (Total, CA, Encours)
- Tableau responsive
- Actions par ligne (Modifier, Supprimer)
- Tri et pagination (prévu)

**Colonnes:**
- Code
- Raison sociale / Nom commercial
- Type (badge coloré)
- ICE
- Ville
- Contacts (email, téléphone)
- Encours (clients) / Total achats (fournisseurs)
- Actions

**Recherche:**
- Nom, Code, ICE, Email
- Filtre actif/inactif

#### 4. Pages

##### /customers (Clients)
- Liste clients avec statistiques
- Bouton "Nouveau client"
- Formulaire création/édition
- Message d'aide si liste vide
- Actions CRUD complètes

##### /suppliers (Fournisseurs)
- Identique à clients mais pour fournisseurs
- Statistiques adaptées (total achats)
- Workflow similaire

#### 5. Navigation (Sidebar)

**Ajouts:**
- 🧑 **Clients** - Icône UserCheck
- 🚚 **Fournisseurs** - Icône Truck

**Position:** Après Ventes/Achats, avant Banque

---

## Données de Test

### Exemple Client

```typescript
{
  type: 'CLIENT',
  code: 'CLI-0001',
  name: 'ABC Distribution SARL',
  commercialName: 'ABC Maroc',
  ice: '001234567000012',
  if: 'IF12345678',
  rc: 'RC123456',
  address: '123 Bd Mohammed V',
  city: 'Casablanca',
  postalCode: '20000',
  country: 'Maroc',
  phone: '+212 522 123 456',
  email: 'contact@abc.ma',
  paymentTerms: 'NET_30',
  vatRegime: 'STANDARD',
  vatRate: 20,
  currency: 'MAD',
  isActive: true,
}
```

### Exemple Fournisseur

```typescript
{
  type: 'SUPPLIER',
  code: 'FRS-0001',
  name: 'Matériaux XYZ SA',
  ice: '002345678000023',
  address: '456 Zone Industrielle',
  city: 'Tanger',
  phone: '+212 539 987 654',
  email: 'info@xyz.ma',
  paymentTerms: 'NET_60',
  vatRegime: 'STANDARD',
  vatRate: 20,
  currency: 'MAD',
  isActive: true,
}
```

---

## Tests à Effectuer

### Tests Manuels

#### Création Client
1. ✅ Naviguer vers `/customers`
2. ✅ Cliquer "Nouveau client"
3. ✅ Remplir formulaire complet
4. ✅ Saisir ICE invalide → Vérifier erreur
5. ✅ Saisir ICE valide → Pas d'erreur
6. ✅ Sauvegarder
7. ✅ Vérifier apparition dans la liste

#### Modification Client
1. ✅ Cliquer "Modifier" sur un client
2. ✅ Modifier plusieurs champs
3. ✅ Sauvegarder
4. ✅ Vérifier modifications dans la liste

#### Suppression Client
1. ✅ Cliquer "Supprimer"
2. ✅ Confirmer
3. ✅ Vérifier disparition (soft delete)

#### Recherche
1. ✅ Saisir nom dans barre de recherche
2. ✅ Vérifier filtrage
3. ✅ Saisir ICE
4. ✅ Vérifier recherche par ICE

### Tests Automatisés (À créer)

```typescript
describe('ThirdParty Store', () => {
  test('createThirdParty generates unique ID', () => {
    // Test...
  });

  test('generateThirdPartyCode increments correctly', () => {
    // Test...
  });

  test('searchThirdParties filters by name and ICE', () => {
    // Test...
  });
});

describe('ThirdPartyForm', () => {
  test('validates ICE format', () => {
    // Test...
  });

  test('displays errors for required fields', () => {
    // Test...
  });
});
```

---

## Intégration avec Modules Existants

### Avec EPIC 1 (Noyau Comptable)
- Utilise `validateICE()` de `/lib/accounting/validation.ts`
- Génération écritures comptables (Story F.7)
- Comptes clients (411xxx) et fournisseurs (441xxx)

### Avec EPIC 2 (Identité Légale)
- Réutilise types `LegalIdentifiers`
- Conformité structure ICE (9+4+2)
- Validation identifiants légaux

---

## Prochaines Stories

### Story F.2 : Création Factures (5 jours)
**À implémenter:**
- `InvoiceForm.tsx` - Formulaire facture multi-lignes
- Calcul automatique TVA par ligne
- Gestion des remises (ligne + globale)
- Génération PDF template CGNC
- Numérotation automatique (FA-2025-00001)

**Dépendances:** Story F.1 ✅

### Story F.3 : Gestion Devis (3 jours)
**À implémenter:**
- Formulaire devis (similaire facture)
- Conversion devis → facture
- Statuts (Brouillon, Envoyé, Accepté, Refusé, Converti)
- Template PDF devis

**Dépendances:** Story F.2

### Story F.4 : Suivi Paiements (2 jours)
**À implémenter:**
- Enregistrement paiements
- Statuts factures (Brouillon, Envoyée, Payée, Retard)
- Timeline paiements
- Calcul soldes automatique

**Dépendances:** Story F.2

### Story F.5 : Relances Auto (2 jours)
**À implémenter:**
- Système d'alertes J+30, J+60
- Templates emails relances
- Historique relances par facture
- Dashboard factures en retard

**Dépendances:** Story F.4

### Story F.6 : Numérotation (1 jour)
**À implémenter:**
- Configuration numérotation par type
- Format personnalisable
- Réinitialisation annuelle
- UI paramètres

**Dépendances:** Story F.2

### Story F.7 : Intégration GL (3 jours)
**À implémenter:**
- Génération auto écritures depuis factures
- Mapping facture → écriture comptable
- Lettrage paiements
- Synchronisation soldes

**Dépendances:** Story F.2, F.4, EPIC 1

---

## Métriques de Succès

### Story F.1 (Actuel)
- [x] Types TypeScript complets (400+ lignes)
- [x] Store Zustand fonctionnel (40+ actions)
- [x] Formulaire CRUD complet
- [x] Validation ICE intégrée
- [x] Pages Clients/Fournisseurs fonctionnelles
- [x] Navigation intégrée

### EPIC Complet (Cible)
- [ ] Création facture < 2 minutes
- [ ] PDF conforme CGNC généré
- [ ] 100% des factures avec ICE valide (B2B)
- [ ] 0 erreur de calcul TVA
- [ ] Taux de relances automatiques > 80%
- [ ] Temps de création client < 1 minute

---

## Notes Techniques

### Performance
- Store Zustand : O(1) pour accès par ID
- Recherche : O(n) - Optimiser avec index si > 1000 tiers
- Calculs TVA : Memoization recommandée

### Sécurité
- Validation côté client ET serveur (à ajouter)
- Sanitization des inputs (XSS)
- RBAC pour actions sensibles (suppression)

### UX
- Auto-save brouillons (à ajouter)
- Indicateurs de progression
- Messages de succès/erreur clairs
- Keyboard shortcuts (à ajouter)

---

## Changelog

### v1.0.0 - Story F.1 (2025-01-XX)
- ✅ Création types complets
- ✅ Implémentation store Zustand
- ✅ Composants CRUD tiers
- ✅ Pages Clients/Fournisseurs
- ✅ Intégration navigation

---

## Ressources

### Documentation CGNC
- Plan comptable clients : 411xxx
- Plan comptable fournisseurs : 441xxx
- Taux TVA Maroc : 20%, 14%, 10%, 7%, 0%

### Standards Marocains
- ICE : 15 chiffres (9+4+2)
- Format facture : [Mentions légales obligatoires](https://www.tax.gov.ma)

### Bibliothèques Utilisées
- `zustand` - State management
- `lucide-react` - Icônes
- `clsx` - Classes CSS conditionnelles

---

## Support

Pour questions ou problèmes :
1. Vérifier cette documentation
2. Consulter `/types/invoicing.ts` pour types
3. Consulter `/store/invoicing.ts` pour logique business
4. Tester avec données de test ci-dessus
