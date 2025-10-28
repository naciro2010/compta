/**
 * Types pour le Noyau Comptable CGNC (Code Général de Normalisation Comptable)
 * Phase 0 - EPIC 1: Noyau comptable CGNC
 */

// Classes de comptes CGNC (1 à 8)
export type AccountClass = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Types de comptes
export type AccountType =
  | 'ASSET'           // Actif
  | 'LIABILITY'       // Passif
  | 'EQUITY'          // Capitaux propres
  | 'REVENUE'         // Produits
  | 'EXPENSE'         // Charges
  | 'SPECIAL';        // Comptes spéciaux

// Compte du plan comptable CGNC
export interface Account {
  id: string;                    // Code du compte (ex: "512100")
  number: string;                // Numéro du compte (même que id)
  label: string;                 // Libellé du compte
  class: AccountClass;           // Classe CGNC (1-8)
  type: AccountType;             // Type de compte
  parentId?: string;             // Compte parent (pour hiérarchie)
  isDetailAccount: boolean;      // Compte de détail (peut recevoir des écritures)
  isMandatory: boolean;          // Compte obligatoire CGNC
  isActive: boolean;             // Compte actif
  currency: string;              // Devise (MAD par défaut)
  isCustom: boolean;             // Compte personnalisé (ajouté par l'utilisateur)
  createdBy?: string;            // Utilisateur créateur (pour comptes custom)
  createdAt?: Date;              // Date de création
  justification?: string;        // Justification (pour comptes custom)
}

// Types de journaux comptables
export type JournalType =
  | 'VTE'   // Ventes
  | 'ACH'   // Achats
  | 'TRE'   // Trésorerie
  | 'OD'    // Opérations Diverses
  | 'BQ'    // Banque
  | 'CAI'   // Caisse
  | 'AN';   // À-nouveaux

// Journal comptable
export interface Journal {
  id: string;
  code: JournalType;
  label: string;
  description?: string;
  isActive: boolean;
  lastEntryNumber: number;       // Dernier numéro de pièce utilisé
  createdAt: Date;
}

// Ligne d'écriture comptable
export interface EntryLine {
  id: string;
  accountId: string;             // Référence au compte
  account?: Account;             // Compte (pour affichage)
  label: string;                 // Libellé de la ligne
  debit: number;                 // Montant au débit (0 si crédit)
  credit: number;                // Montant au crédit (0 si débit)
  currency: string;              // Devise de la transaction
  exchangeRate?: number;         // Taux de change (si devise != MAD)
  debitMAD: number;              // Montant débit en MAD
  creditMAD: number;             // Montant crédit en MAD
  auxiliaryAccount?: string;     // Compte auxiliaire (tiers)
  analyticalAccount?: string;    // Compte analytique
  establishmentId?: string;      // EPIC 2: Établissement de rattachement
}

// Écriture comptable
export interface Entry {
  id: string;
  entryNumber: string;           // Numéro de pièce (séquentiel par journal)
  journalId: string;             // Référence au journal
  journal?: Journal;             // Journal (pour affichage)
  date: Date;                    // Date de l'écriture
  periodId: string;              // Référence à la période comptable
  establishmentId?: string;      // EPIC 2: Établissement (optionnel)
  reference?: string;            // Référence externe (facture, etc.)
  description: string;           // Description de l'écriture
  lines: EntryLine[];            // Lignes de l'écriture
  totalDebit: number;            // Total débit (MAD)
  totalCredit: number;           // Total crédit (MAD)
  isBalanced: boolean;           // Écriture équilibrée (débit = crédit)
  isValidated: boolean;          // Écriture validée
  isLocked: boolean;             // Écriture verrouillée (période close)
  attachments: Attachment[];     // Pièces jointes
  createdBy: string;             // Utilisateur créateur
  createdAt: Date;               // Date de création
  validatedBy?: string;          // Utilisateur validateur
  validatedAt?: Date;            // Date de validation
  auditLog: AuditEntry[];        // Journal d'audit
}

// Pièce jointe
export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Entrée d'audit
export interface AuditEntry {
  id: string;
  action: string;               // Type d'action (CREATE, UPDATE, VALIDATE, LOCK, etc.)
  userId: string;               // Utilisateur
  timestamp: Date;              // Horodatage
  details?: Record<string, any>; // Détails de l'action
}

// ============================================================================
// EPIC 2: Système RBAC (Role-Based Access Control)
// ============================================================================

// Rôles utilisateur
export type UserRole =
  | 'ADMIN'                     // Administrateur (tous droits)
  | 'ACCOUNTANT'                // Comptable (saisie)
  | 'REVIEWER'                  // Réviseur (validation/clôture)
  | 'AUDITOR';                  // Auditeur (lecture seule)

// Permissions granulaires
export type Permission =
  // Gestion des comptes
  | 'accounts:read'
  | 'accounts:create'
  | 'accounts:update'
  | 'accounts:delete'
  // Gestion des écritures
  | 'entries:read'
  | 'entries:create'
  | 'entries:update'
  | 'entries:delete'
  | 'entries:validate'
  // Gestion des périodes
  | 'periods:read'
  | 'periods:create'
  | 'periods:close'
  // Gestion des journaux
  | 'journals:read'
  | 'journals:create'
  | 'journals:update'
  // Exports et rapports
  | 'reports:generate'
  | 'reports:export'
  // Configuration
  | 'settings:read'
  | 'settings:update'
  // Utilisateurs et rôles
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  // Audit
  | 'audit:read';

// Matrice des permissions par rôle
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'accounts:read', 'accounts:create', 'accounts:update', 'accounts:delete',
    'entries:read', 'entries:create', 'entries:update', 'entries:delete', 'entries:validate',
    'periods:read', 'periods:create', 'periods:close',
    'journals:read', 'journals:create', 'journals:update',
    'reports:generate', 'reports:export',
    'settings:read', 'settings:update',
    'users:read', 'users:create', 'users:update', 'users:delete',
    'audit:read',
  ],
  ACCOUNTANT: [
    'accounts:read',
    'entries:read', 'entries:create', 'entries:update',
    'periods:read',
    'journals:read',
    'reports:generate',
    'settings:read',
  ],
  REVIEWER: [
    'accounts:read',
    'entries:read', 'entries:validate',
    'periods:read', 'periods:close',
    'journals:read',
    'reports:generate', 'reports:export',
    'settings:read',
  ],
  AUDITOR: [
    'accounts:read',
    'entries:read',
    'periods:read',
    'journals:read',
    'reports:generate', 'reports:export',
    'settings:read',
    'audit:read',
  ],
};

// Utilisateur
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;                // Rôle principal
  isActive: boolean;             // Compte actif
  establishmentIds?: string[];   // Établissements autorisés (optionnel)
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}

// Action d'audit
export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'ENTRY_CREATE'
  | 'ENTRY_UPDATE'
  | 'ENTRY_DELETE'
  | 'ENTRY_VALIDATE'
  | 'PERIOD_CLOSE'
  | 'PERIOD_REOPEN'
  | 'ACCOUNT_CREATE'
  | 'ACCOUNT_UPDATE'
  | 'JOURNAL_CREATE'
  | 'REPORT_EXPORT'
  | 'SETTINGS_UPDATE'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE';

// Entrée du journal d'audit global (immuable)
export interface GlobalAuditEntry {
  id: string;
  action: AuditAction;           // Type d'action
  userId: string;                // Utilisateur ayant effectué l'action
  user?: User;                   // Détails utilisateur (pour affichage)
  entityType: string;            // Type d'entité (Entry, Period, Account, etc.)
  entityId: string;              // ID de l'entité affectée
  timestamp: Date;               // Horodatage
  ipAddress?: string;            // Adresse IP
  userAgent?: string;            // User agent
  metadata?: Record<string, any>; // Métadonnées additionnelles
  changes?: {                    // Changements effectués (pour les UPDATE)
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
}

// Période comptable
export interface AccountingPeriod {
  id: string;
  fiscalYearId: string;          // Référence à l'exercice
  periodNumber: number;          // Numéro de période (1-12 pour mois)
  startDate: Date;               // Date de début
  endDate: Date;                 // Date de fin
  label: string;                 // Libellé (ex: "Janvier 2024")
  type: 'MONTH' | 'QUARTER' | 'YEAR'; // Type de période
  isOpen: boolean;               // Période ouverte (permet saisie)
  isClosed: boolean;             // Période clôturée
  closedBy?: string;             // Utilisateur ayant clôturé
  closedAt?: Date;               // Date de clôture
}

// Exercice comptable
export interface FiscalYear {
  id: string;
  year: number;                  // Année (ex: 2024)
  startDate: Date;               // Date de début d'exercice
  endDate: Date;                 // Date de fin d'exercice
  label: string;                 // Libellé (ex: "Exercice 2024")
  isActive: boolean;             // Exercice actif
  isClosed: boolean;             // Exercice clôturé
  periods: AccountingPeriod[];   // Périodes de l'exercice
  createdAt: Date;
}

// Balance générale
export interface BalanceSheet {
  periodId: string;
  period?: AccountingPeriod;
  lines: BalanceLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  generatedAt: Date;
}

// Ligne de balance
export interface BalanceLine {
  accountId: string;
  account?: Account;
  openingDebit: number;          // Solde débiteur d'ouverture
  openingCredit: number;         // Solde créditeur d'ouverture
  periodDebit: number;           // Mouvements débit de la période
  periodCredit: number;          // Mouvements crédit de la période
  closingDebit: number;          // Solde débiteur de clôture
  closingCredit: number;         // Solde créditeur de clôture
  balance: number;               // Solde (positif = débiteur, négatif = créditeur)
}

// Balance âgée (pour les tiers)
export interface AgedBalance {
  accountId: string;
  account?: Account;
  thirdPartyId?: string;         // Identifiant du tiers
  thirdPartyName?: string;       // Nom du tiers
  current: number;               // Non échu
  days30: number;                // 1-30 jours
  days60: number;                // 31-60 jours
  days90: number;                // 61-90 jours
  over90: number;                // > 90 jours
  total: number;                 // Total
}

// Grand Livre
export interface GeneralLedger {
  periodId: string;
  period?: AccountingPeriod;
  accountId?: string;            // Filtrer par compte (optionnel)
  journalId?: string;            // Filtrer par journal (optionnel)
  entries: LedgerEntry[];
  generatedAt: Date;
}

// Entrée du Grand Livre
export interface LedgerEntry {
  date: Date;
  entryNumber: string;
  journalCode: string;
  accountId: string;
  accountLabel: string;
  description: string;
  reference?: string;
  debit: number;
  credit: number;
  balance: number;               // Solde cumulé
}

// Devise
export interface Currency {
  code: string;                  // Code ISO (MAD, EUR, USD, etc.)
  symbol: string;                // Symbole (DH, €, $, etc.)
  label: string;                 // Libellé
  isBaseCurrency: boolean;       // Monnaie de tenue (MAD)
  exchangeRate: number;          // Taux de change vs MAD
  updatedAt: Date;               // Date de mise à jour du taux
}

// Modèle sectoriel
export type SectorModel =
  | 'GENERAL'                    // Général
  | 'ASSOCIATION'                // Associations
  | 'REAL_ESTATE'                // Immobilier
  | 'COMMERCE'                   // Commerce
  | 'SERVICE'                    // Services
  | 'INDUSTRY';                  // Industrie

// Identifiants légaux marocains
export interface LegalIdentifiers {
  ice: string;                   // ICE - Identifiant Commun de l'Entreprise (15 chiffres: 9+4+2)
  if: string;                    // IF - Identifiant Fiscal
  rc?: string;                   // RC - Registre de Commerce
  cnss?: string;                 // CNSS - Numéro d'affiliation CNSS
  patente?: string;              // Numéro de Patente
}

// Régime de TVA
export type VATRegime =
  | 'STANDARD'                   // Régime standard
  | 'REDUCED'                    // Régime réduit
  | 'EXEMPT'                     // Exonéré
  | 'AUTO_ENTREPRENEUR';         // Auto-entrepreneur

// Établissement (lié à l'ICE)
export interface Establishment {
  id: string;
  companyId: string;             // Référence à la société mère
  code: string;                  // Code établissement (4 chiffres de l'ICE)
  name: string;                  // Nom de l'établissement
  address?: string;              // Adresse
  city?: string;                 // Ville
  postalCode?: string;           // Code postal
  phone?: string;                // Téléphone
  email?: string;                // Email
  isActive: boolean;             // Établissement actif
  isMainEstablishment: boolean;  // Établissement principal (siège)
  createdAt: Date;
  suspendedAt?: Date;            // Date de suspension
  suspendedBy?: string;          // Utilisateur ayant suspendu
}

// Configuration de la société
export interface CompanySettings {
  id: string;
  name: string;
  legalForm: string;             // Forme juridique
  legalIdentifiers: LegalIdentifiers; // Identifiants légaux marocains
  baseCurrency: string;          // Monnaie de tenue (MAD)
  sectorModel: SectorModel;      // Modèle sectoriel
  fiscalYearStart: number;       // Mois de début d'exercice (1-12)

  // Informations de contact
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;

  // Paramètres fiscaux
  vatRegime: VATRegime;          // Régime de TVA
  vatNumber?: string;            // Numéro de TVA
  vatRate?: number;              // Taux de TVA par défaut

  // Multi-établissements
  establishments: Establishment[]; // Liste des établissements

  createdAt: Date;
  updatedAt?: Date;

  // Backward compatibility
  /** @deprecated Use legalIdentifiers.ice instead */
  taxId?: string;
}

// Validation d'écriture
export interface EntryValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  lineIndex?: number;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
}

// Export formats
export type ExportFormat = 'PDF' | 'CSV' | 'XLS' | 'JSON';

// Rapport comptable
export interface AccountingReport {
  id: string;
  type: 'BALANCE' | 'LEDGER' | 'TRIAL_BALANCE' | 'AGED_BALANCE';
  periodId: string;
  format: ExportFormat;
  generatedAt: Date;
  generatedBy: string;
  url?: string;
}
