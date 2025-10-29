/**
 * Types pour l'EPIC Trésorerie
 * Gestion bancaire, rapprochement, import CSV
 */

// ============================================================================
// COMPTES BANCAIRES
// ============================================================================

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  iban?: string;
  swift?: string;
  currency: string;
  currentBalance: number;
  accountingAccount: string; // 516xxx
  isActive: boolean;
  createdAt: Date;
}

// ============================================================================
// RELEVÉS BANCAIRES
// ============================================================================

export type BankStatementLineType = 'DEBIT' | 'CREDIT';

export interface BankStatementLine {
  id: string;
  date: Date;
  valueDate: Date;
  description: string;
  type: BankStatementLineType;
  amount: number;
  balance: number;
  reference?: string;

  // Rapprochement
  isReconciled: boolean;
  reconciledWith?: string; // ID écriture comptable
  reconciledAt?: Date;
  reconciledBy?: string;
}

export interface BankStatement {
  id: string;
  bankAccountId: string;
  startDate: Date;
  endDate: Date;
  openingBalance: number;
  closingBalance: number;
  lines: BankStatementLine[];

  // Import
  importedAt: Date;
  importedBy: string;
  importSource: 'CSV' | 'MANUAL' | 'API';

  // Statut
  isComplete: boolean;
  reconciliationRate: number; // % lignes rapprochées
}

// ============================================================================
// RAPPROCHEMENT BANCAIRE
// ============================================================================

export type ReconciliationStatus = 'PENDING' | 'MATCHED' | 'PARTIAL' | 'MANUAL';

export interface ReconciliationRule {
  id: string;
  name: string;
  description?: string;

  // Critères de matching
  amountTolerance: number; // Tolérance en MAD
  dateTolerance: number; // Jours de tolérance
  descriptionKeywords?: string[]; // Mots-clés à chercher

  // Mapping automatique
  autoReconcile: boolean;
  accountMapping?: Record<string, string>;

  isActive: boolean;
  priority: number; // Ordre d'application
}

export interface ReconciliationMatch {
  id: string;
  bankLineId: string;
  entryId: string;
  matchScore: number; // 0-100%
  matchType: 'AUTO' | 'MANUAL' | 'SUGGESTED';
  matchedAt: Date;
  matchedBy: string;
}

// ============================================================================
// IMPORT CSV
// ============================================================================

export interface CSVImportConfig {
  id: string;
  bankAccountId: string;
  name: string;

  // Format CSV
  delimiter: ',' | ';' | '\t';
  hasHeader: boolean;
  encoding: 'UTF-8' | 'ISO-8859-1' | 'Windows-1252';

  // Mapping colonnes
  dateColumn: number;
  descriptionColumn: number;
  amountColumn: number;
  balanceColumn?: number;
  typeColumn?: number; // Colonne indiquant débit/crédit

  // Format date
  dateFormat: string; // Ex: 'DD/MM/YYYY', 'YYYY-MM-DD'

  // Règles
  debitIndicator?: string; // Valeur indiquant un débit
  creditIndicator?: string;

  isDefault: boolean;
  createdAt: Date;
}

// ============================================================================
// TRÉSORERIE / CASH FLOW
// ============================================================================

export interface CashFlowForecast {
  id: string;
  date: Date;

  // Prévisions
  expectedInflows: number;
  expectedOutflows: number;
  expectedBalance: number;

  // Réel
  actualInflows?: number;
  actualOutflows?: number;
  actualBalance?: number;

  // Notes
  notes?: string;
}

export interface CashPosition {
  date: Date;
  bankAccounts: {
    accountId: string;
    accountName: string;
    balance: number;
  }[];
  totalCash: number;
  forecast7Days: number;
  forecast30Days: number;
}
