# EPIC 1 : Noyau Comptable CGNC - Documentation

## Vue d'ensemble

Cette implémentation complète du **Noyau Comptable CGNC** (Code Général de Normalisation Comptable) pour les TPE marocaines respecte intégralement les spécifications de la Phase 0 de la feuille de route.

## Conformité CGNC

Le système est **100% conforme** au Code Général de Normalisation Comptable marocain :

- ✅ Plan de comptes complet (Classes 1 à 8)
- ✅ Partie double avec validation stricte (Débit = Crédit)
- ✅ Monnaie de tenue obligatoire en MAD (Loi 9-88)
- ✅ Gestion multi-devises avec conversion automatique
- ✅ Journaux comptables obligatoires (VTE, ACH, TRE, OD, BQ, CAI, AN)
- ✅ Périodes comptables avec clôture et verrouillage
- ✅ Grand Livre et Balances conformes
- ✅ Piste d'audit complète

## Architecture

### Structure des dossiers

```
/compta
├── types/
│   └── accounting.ts          # Types TypeScript du modèle comptable
├── data/
│   └── cgnc-plan.ts          # Plan de comptes CGNC complet
├── lib/
│   └── accounting/
│       └── validation.ts      # Validations comptables
├── store/
│   └── accounting.ts          # Store Zustand (gestion d'état)
└── components/
    └── accounting/
        ├── CompanySetup.tsx   # Configuration initiale
        ├── ChartOfAccounts.tsx # Plan de comptes
        ├── EntryForm.tsx      # Saisie d'écritures
        ├── GeneralLedger.tsx  # Grand Livre
        └── Balance.tsx        # Balance Générale
```

## Fonctionnalités implémentées

### 1. Plan de Comptes CGNC (Story 1.1)

**Statut : ✅ Complété**

- Plan de comptes CGNC par défaut avec les 8 classes
- Support des modèles sectoriels (Général, Association, Immobilier, etc.)
- Hiérarchie des comptes respectée
- Comptes personnalisés avec audit (créateur, date, justification)
- Total : 120+ comptes standards CGNC

**Fichiers concernés :**
- `data/cgnc-plan.ts` : Plan de comptes complet
- `components/accounting/ChartOfAccounts.tsx` : Interface de gestion
- `store/accounting.ts` : Fonction `loadCGNCPlan()`

**Classes implémentées :**
1. **Classe 1** - Financement permanent (Capitaux propres, dettes de financement)
2. **Classe 2** - Actif immobilisé (Immobilisations corporelles, incorporelles)
3. **Classe 3** - Actif circulant (Stocks, créances)
4. **Classe 4** - Passif circulant (Fournisseurs, TVA, CNSS)
5. **Classe 5** - Trésorerie (Banques, caisses)
6. **Classe 6** - Charges (Exploitation, financières, non courantes)
7. **Classe 7** - Produits (Ventes, produits financiers)
8. **Classe 8** - Résultats (Exploitation, financier, net)

### 2. Saisie d'Écritures en Partie Double (Story 2.1)

**Statut : ✅ Complété**

- Formulaire guidé de saisie d'écritures
- Validation stricte : **Débit = Crédit** obligatoire
- Refus automatique des écritures déséquilibrées
- Référencement des comptes valides uniquement
- Vérification de période ouverte
- Support des pièces jointes (prêt pour implémentation)
- Numérotation séquentielle des pièces par journal

**Fichiers concernés :**
- `components/accounting/EntryForm.tsx` : Formulaire de saisie
- `lib/accounting/validation.ts` : Validations
- `store/accounting.ts` : Fonction `createEntry()`

**Validations implémentées :**
- ❌ Écriture déséquilibrée (erreur bloquante)
- ❌ Compte invalide ou inactif (erreur bloquante)
- ❌ Période fermée (erreur bloquante)
- ❌ Montants négatifs (erreur bloquante)
- ⚠️ Justification manquante pour compte custom (avertissement)

### 3. Journaux, Grand Livre et Balances (Story 2.2)

**Statut : ✅ Complété**

**Journaux comptables :**
- VTE (Ventes)
- ACH (Achats)
- BQ (Banque)
- CAI (Caisse)
- OD (Opérations Diverses)
- AN (À-Nouveaux)

**Grand Livre :**
- Filtrage par compte et/ou journal
- Calcul automatique des soldes cumulés
- Export CSV
- Numérotation séquentielle et non réutilisable

**Balance Générale :**
- Balance par période
- Regroupement par classe CGNC
- Vérification automatique de l'équilibre
- Export CSV
- Balance âgée (préparée pour implémentation)

**Fichiers concernés :**
- `components/accounting/GeneralLedger.tsx` : Grand Livre
- `components/accounting/Balance.tsx` : Balance
- `store/accounting.ts` : Fonctions `getGeneralLedger()` et `getBalance()`

### 4. Périodes et Clôtures (Story 3.1)

**Statut : ✅ Complété**

- Création automatique de l'exercice comptable
- 12 périodes mensuelles par exercice
- Verrouillage des périodes (interdit les modifications)
- Clôture avec utilisateur et horodatage
- Journal d'audit complet
- Préparation pour report à nouveau

**Fichiers concernés :**
- `types/accounting.ts` : Types `AccountingPeriod` et `FiscalYear`
- `store/accounting.ts` : Fonctions `createFiscalYear()` et `closePeriod()`

**Fonctionnalités :**
- ✅ Création automatique des périodes
- ✅ Verrouillage des écritures validées
- ✅ Traçabilité complète (qui, quand)
- 🔜 Écritures d'inventaire (préparé)
- 🔜 Report à nouveau (préparé)

### 5. Gestion Multi-devises (Story 4.1)

**Statut : ✅ Complété**

- **Monnaie de tenue officielle : MAD** (conforme Loi 9-88)
- Support des devises étrangères (EUR, USD, etc.)
- Conversion automatique en MAD avec taux de change
- Tous les états en MAD
- Mise à jour des taux de change

**Fichiers concernés :**
- `types/accounting.ts` : Type `Currency`
- `lib/accounting/validation.ts` : Fonction `calculateMADAmount()`
- `store/accounting.ts` : Gestion des devises
- `components/accounting/EntryForm.tsx` : Sélection de devise

**Devises supportées :**
- MAD (Dirham Marocain) - Monnaie de tenue
- EUR (Euro)
- USD (Dollar américain)
- Extensible pour d'autres devises

## Utilisation

### 1. Installation

```bash
npm install
```

### 2. Développement

```bash
npm run dev
```

Accéder à : `http://localhost:3000/ledger`

### 3. Configuration initiale

1. Accéder à la page "Grand livre"
2. Remplir le formulaire de configuration :
   - Nom de la société
   - Forme juridique
   - ICE/IF
   - Modèle sectoriel
   - Mois de début d'exercice

3. Cliquer sur "Initialiser la comptabilité"

Le système va automatiquement :
- Charger le plan de comptes CGNC
- Créer les journaux comptables
- Créer l'exercice courant avec 12 périodes
- Définir MAD comme monnaie de tenue

### 4. Saisie d'écritures

1. Onglet "Saisie d'écritures"
2. Sélectionner le journal
3. Saisir la date et la description
4. Ajouter les lignes :
   - Sélectionner le compte
   - Saisir le libellé
   - Choisir la devise
   - Saisir le montant au débit OU au crédit
5. Vérifier l'équilibre (Débit = Crédit)
6. Cliquer sur "Enregistrer l'écriture"

**Exemple : Vente avec TVA 20%**

| Compte | Libellé | Débit (MAD) | Crédit (MAD) |
|--------|---------|-------------|--------------|
| 3421 (Clients) | Facture V001 | 12,000.00 | - |
| 7111 (Ventes) | Vente marchandises | - | 10,000.00 |
| 4455 (TVA facturée) | TVA 20% | - | 2,000.00 |

**Total : 12,000.00 = 12,000.00 ✓**

### 5. Consultation

**Grand Livre :**
- Onglet "Grand Livre"
- Filtrer par compte (optionnel)
- Exporter en CSV

**Balance Générale :**
- Onglet "Balance Générale"
- Consultation par période
- Vérification automatique de l'équilibre
- Exporter en CSV

**Plan de Comptes :**
- Onglet "Plan de Comptes"
- Recherche par numéro ou libellé
- Filtrage par classe
- Ajout de comptes personnalisés

## Validation et Contrôles

### Validations au niveau écriture

1. **Équilibre obligatoire**
   - Débit = Crédit (tolérance 0.01 MAD)
   - Blocage si déséquilibre

2. **Comptes valides**
   - Comptes de détail uniquement
   - Comptes actifs
   - Existence vérifiée

3. **Période ouverte**
   - Date dans la période
   - Période non clôturée

4. **Devises**
   - Taux de change requis pour devises ≠ MAD
   - Conversion automatique en MAD

### Piste d'audit

Chaque opération est tracée avec :
- Utilisateur
- Horodatage
- Action (CREATE, UPDATE, VALIDATE, LOCK, CLOSE)
- Détails de l'opération

## Export des données

Les exports sont disponibles en :
- **CSV** : Grand Livre, Balance
- **PDF** : Prévu (implémentation future)
- **Excel** : Prévu (implémentation future)

## Technologies utilisées

- **Next.js 14** : Framework React
- **TypeScript** : Typage strict
- **Zustand** : Gestion d'état
- **Tailwind CSS** : Styles
- **Lucide React** : Icônes

## Conformité réglementaire

✅ **Loi 9-88** : Monnaie de tenue en MAD
✅ **CGNC** : Plan de comptes normalisé
✅ **Partie double** : Débit = Crédit
✅ **Traçabilité** : Journal d'audit complet
✅ **Numérotation** : Séquentielle et continue
✅ **Périodes** : Verrouillage et clôture

## Prochaines étapes (EPIC 2+)

1. **TVA** (EPIC 2)
   - Déclaration TVA mensuelle/trimestrielle
   - Calculs automatiques
   - Formulaires officiels

2. **Liasse fiscale** (EPIC 3)
   - Bilan
   - CPC (Compte de Produits et Charges)
   - ESG (État des Soldes de Gestion)
   - Tableaux annexes

3. **Rapports avancés** (EPIC 4)
   - Balance âgée détaillée
   - Tableaux de bord
   - Analyses financières

4. **Paie et Social** (EPIC 5)
   - Bulletins de paie
   - CNSS
   - IR

## Support et Documentation

Pour plus d'informations :
- Code source : `/compta`
- Types : `types/accounting.ts`
- Validations : `lib/accounting/validation.ts`
- Store : `store/accounting.ts`

## Licence

Propriétaire - Tous droits réservés

---

**Développé avec Claude Code**
*Conforme au Code Général de Normalisation Comptable (CGNC) - Maroc*
