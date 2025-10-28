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
}

// Écriture comptable
export interface Entry {
  id: string;
  entryNumber: string;           // Numéro de pièce (séquentiel par journal)
  journalId: string;             // Référence au journal
  journal?: Journal;             // Journal (pour affichage)
  date: Date;                    // Date de l'écriture
  periodId: string;              // Référence à la période comptable
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

// Configuration de la société
export interface CompanySettings {
  id: string;
  name: string;
  legalForm: string;             // Forme juridique
  taxId: string;                 // ICE / IF
  baseCurrency: string;          // Monnaie de tenue (MAD)
  sectorModel: SectorModel;      // Modèle sectoriel
  fiscalYearStart: number;       // Mois de début d'exercice (1-12)
  createdAt: Date;
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
