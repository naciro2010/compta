/**
 * Store Zustand pour la Trésorerie
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BankAccount,
  BankStatement,
  BankStatementLine,
  ReconciliationRule,
  ReconciliationMatch,
  CSVImportConfig,
  CashPosition,
} from '@/types/treasury';

interface TreasuryState {
  bankAccounts: BankAccount[];
  statements: BankStatement[];
  reconciliationRules: ReconciliationRule[];
  reconciliationMatches: ReconciliationMatch[];
  csvConfigs: CSVImportConfig[];

  // Actions - Comptes bancaires
  addBankAccount: (account: Omit<BankAccount, 'id' | 'createdAt'>) => BankAccount;
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;
  getBankAccount: (id: string) => BankAccount | undefined;

  // Actions - Relevés
  addBankStatement: (statement: Omit<BankStatement, 'id'>) => BankStatement;
  importCSV: (bankAccountId: string, csvContent: string, config: CSVImportConfig) => BankStatement;

  // Actions - Rapprochement
  addReconciliationRule: (rule: Omit<ReconciliationRule, 'id'>) => ReconciliationRule;
  reconcileLine: (bankLineId: string, entryId: string, manual: boolean) => ReconciliationMatch;
  unreconcileLine: (bankLineId: string) => void;
  autoReconcile: (statementId: string) => number; // Retourne nombre de lignes rapprochées

  // Actions - Statistiques
  getCashPosition: () => CashPosition;
  getReconciliationRate: (statementId: string) => number;

  clearAll: () => void;
}

export const useTreasuryStore = create<TreasuryState>()(
  persist(
    (set, get) => ({
      bankAccounts: [],
      statements: [],
      reconciliationRules: [],
      reconciliationMatches: [],
      csvConfigs: [],

      // === COMPTES BANCAIRES ===
      addBankAccount: (accountData) => {
        const newAccount: BankAccount = {
          ...accountData,
          id: `bank-${Date.now()}`,
          createdAt: new Date(),
        };

        set((state) => ({
          bankAccounts: [...state.bankAccounts, newAccount],
        }));

        return newAccount;
      },

      updateBankAccount: (id, updates) => {
        set((state) => ({
          bankAccounts: state.bankAccounts.map((acc) =>
            acc.id === id ? { ...acc, ...updates } : acc
          ),
        }));
      },

      deleteBankAccount: (id) => {
        set((state) => ({
          bankAccounts: state.bankAccounts.filter((acc) => acc.id !== id),
        }));
      },

      getBankAccount: (id) => {
        return get().bankAccounts.find((acc) => acc.id === id);
      },

      // === RELEVÉS ===
      addBankStatement: (statementData) => {
        const newStatement: BankStatement = {
          ...statementData,
          id: `stmt-${Date.now()}`,
        };

        set((state) => ({
          statements: [...state.statements, newStatement],
        }));

        return newStatement;
      },

      importCSV: (bankAccountId, csvContent, config) => {
        // Parser CSV simple (à améliorer avec bibliothèque comme papaparse)
        const lines = csvContent.split('\n');
        const dataLines = config.hasHeader ? lines.slice(1) : lines;

        const statementLines: BankStatementLine[] = dataLines
          .filter((line) => line.trim())
          .map((line, index) => {
            const cols = line.split(config.delimiter);

            const dateStr = cols[config.dateColumn]?.trim() || '';
            const description = cols[config.descriptionColumn]?.trim() || '';
            const amountStr = cols[config.amountColumn]?.trim().replace(',', '.') || '0';
            const amount = parseFloat(amountStr);

            return {
              id: `line-${Date.now()}-${index}`,
              date: new Date(dateStr),
              valueDate: new Date(dateStr),
              description,
              type: amount < 0 ? 'DEBIT' as const : 'CREDIT' as const,
              amount: Math.abs(amount),
              balance: 0, // À calculer
              isReconciled: false,
            };
          });

        // Calculer soldes
        let runningBalance = 0;
        statementLines.forEach((line) => {
          runningBalance += line.type === 'CREDIT' ? line.amount : -line.amount;
          line.balance = runningBalance;
        });

        const statement: BankStatement = {
          id: `stmt-${Date.now()}`,
          bankAccountId,
          startDate: statementLines[0]?.date || new Date(),
          endDate: statementLines[statementLines.length - 1]?.date || new Date(),
          openingBalance: 0,
          closingBalance: runningBalance,
          lines: statementLines,
          importedAt: new Date(),
          importedBy: 'current-user',
          importSource: 'CSV',
          isComplete: false,
          reconciliationRate: 0,
        };

        set((state) => ({
          statements: [...state.statements, statement],
        }));

        return statement;
      },

      // === RAPPROCHEMENT ===
      addReconciliationRule: (ruleData) => {
        const newRule: ReconciliationRule = {
          ...ruleData,
          id: `rule-${Date.now()}`,
        };

        set((state) => ({
          reconciliationRules: [...state.reconciliationRules, newRule],
        }));

        return newRule;
      },

      reconcileLine: (bankLineId, entryId, manual) => {
        const match: ReconciliationMatch = {
          id: `match-${Date.now()}`,
          bankLineId,
          entryId,
          matchScore: manual ? 100 : 80,
          matchType: manual ? 'MANUAL' : 'AUTO',
          matchedAt: new Date(),
          matchedBy: 'current-user',
        };

        set((state) => ({
          reconciliationMatches: [...state.reconciliationMatches, match],
          statements: state.statements.map((stmt) => ({
            ...stmt,
            lines: stmt.lines.map((line) =>
              line.id === bankLineId
                ? {
                    ...line,
                    isReconciled: true,
                    reconciledWith: entryId,
                    reconciledAt: new Date(),
                    reconciledBy: 'current-user',
                  }
                : line
            ),
          })),
        }));

        return match;
      },

      unreconcileLine: (bankLineId) => {
        set((state) => ({
          reconciliationMatches: state.reconciliationMatches.filter(
            (m) => m.bankLineId !== bankLineId
          ),
          statements: state.statements.map((stmt) => ({
            ...stmt,
            lines: stmt.lines.map((line) =>
              line.id === bankLineId
                ? {
                    ...line,
                    isReconciled: false,
                    reconciledWith: undefined,
                    reconciledAt: undefined,
                    reconciledBy: undefined,
                  }
                : line
            ),
          })),
        }));
      },

      autoReconcile: (statementId) => {
        // Logique simple d'auto-rapprochement
        // En production: implémenter algorithme sophistiqué
        let reconciledCount = 0;

        // TODO: Implémenter matching automatique

        return reconciledCount;
      },

      // === STATISTIQUES ===
      getCashPosition: () => {
        const { bankAccounts } = get();

        const accountPositions = bankAccounts.map((acc) => ({
          accountId: acc.id,
          accountName: acc.name,
          balance: acc.currentBalance,
        }));

        const totalCash = accountPositions.reduce((sum, acc) => sum + acc.balance, 0);

        return {
          date: new Date(),
          bankAccounts: accountPositions,
          totalCash,
          forecast7Days: totalCash, // TODO: calculer prévisions
          forecast30Days: totalCash,
        };
      },

      getReconciliationRate: (statementId) => {
        const statement = get().statements.find((s) => s.id === statementId);
        if (!statement || statement.lines.length === 0) return 0;

        const reconciledCount = statement.lines.filter((l) => l.isReconciled).length;
        return (reconciledCount / statement.lines.length) * 100;
      },

      clearAll: () => {
        set({
          bankAccounts: [],
          statements: [],
          reconciliationRules: [],
          reconciliationMatches: [],
          csvConfigs: [],
        });
      },
    }),
    {
      name: 'treasury-storage',
    }
  )
);
