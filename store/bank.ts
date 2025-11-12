/**
 * Store Zustand pour la gestion bancaire
 * Gère les comptes bancaires, transactions et rapprochement bancaire
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  iban?: string;
  swift?: string;
  currency: string;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  date: Date;
  valueDate?: Date;
  description: string;
  reference?: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  balance?: number;
  isReconciled: boolean;
  reconciledAt?: Date;
  reconciledBy?: string;
  accountingEntryId?: string; // Lien vers l'écriture comptable
  category?: string;
  notes?: string;
  importedAt?: Date;
  createdAt: Date;
}

export interface BankReconciliation {
  id: string;
  accountId: string;
  startDate: Date;
  endDate: Date;
  startBalance: number;
  endBalance: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'VALIDATED';
  reconciledTransactionsCount: number;
  unreconciledTransactionsCount: number;
  discrepancy: number;
  completedBy?: string;
  completedAt?: Date;
  validatedBy?: string;
  validatedAt?: Date;
  notes?: string;
  createdAt: Date;
}

interface BankStore {
  // État
  accounts: BankAccount[];
  transactions: BankTransaction[];
  reconciliations: BankReconciliation[];
  selectedAccountId: string | null;

  // Actions - Comptes bancaires
  createAccount: (account: Omit<BankAccount, 'id' | 'createdAt'>) => BankAccount;
  updateAccount: (id: string, updates: Partial<BankAccount>) => void;
  deleteAccount: (id: string) => void;
  getAccount: (id: string) => BankAccount | undefined;
  getAccounts: () => BankAccount[];
  selectAccount: (id: string | null) => void;

  // Actions - Transactions
  createTransaction: (transaction: Omit<BankTransaction, 'id' | 'createdAt'>) => BankTransaction;
  updateTransaction: (id: string, updates: Partial<BankTransaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransaction: (id: string) => BankTransaction | undefined;
  getTransactionsByAccount: (accountId: string) => BankTransaction[];
  getUnreconciledTransactions: (accountId: string) => BankTransaction[];

  // Actions - Rapprochement
  reconcileTransaction: (transactionId: string, accountingEntryId?: string) => void;
  unreconcileTransaction: (transactionId: string) => void;
  startReconciliation: (accountId: string, startDate: Date, endDate: Date, startBalance: number) => BankReconciliation;
  completeReconciliation: (reconciliationId: string) => void;
  validateReconciliation: (reconciliationId: string) => void;

  // Actions - Import
  importTransactions: (accountId: string, transactions: Array<Omit<BankTransaction, 'id' | 'accountId' | 'createdAt' | 'importedAt'>>) => void;

  // Helpers
  calculateAccountBalance: (accountId: string) => number;
  getReconciliationStats: (accountId: string, startDate?: Date, endDate?: Date) => {
    totalTransactions: number;
    reconciledCount: number;
    unreconciledCount: number;
    reconciledAmount: number;
    unreconciledAmount: number;
  };
}

export const useBankStore = create<BankStore>()(
  persist(
    (set, get) => ({
      // État initial
      accounts: [],
      transactions: [],
      reconciliations: [],
      selectedAccountId: null,

      // ========================================================================
      // Gestion des comptes bancaires
      // ========================================================================

      createAccount: (accountData) => {
        const account: BankAccount = {
          ...accountData,
          id: `bank-account-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
        };

        set((state) => ({
          accounts: [...state.accounts, account],
        }));

        return account;
      },

      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.id === id ? { ...acc, ...updates, updatedAt: new Date() } : acc
          ),
        }));
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((acc) => acc.id !== id),
          transactions: state.transactions.filter((tx) => tx.accountId !== id),
          reconciliations: state.reconciliations.filter((rec) => rec.accountId !== id),
        }));
      },

      getAccount: (id) => {
        return get().accounts.find((acc) => acc.id === id);
      },

      getAccounts: () => {
        return get().accounts.filter((acc) => acc.isActive);
      },

      selectAccount: (id) => {
        set({ selectedAccountId: id });
      },

      // ========================================================================
      // Gestion des transactions
      // ========================================================================

      createTransaction: (transactionData) => {
        const transaction: BankTransaction = {
          ...transactionData,
          id: `bank-tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
        };

        set((state) => ({
          transactions: [...state.transactions, transaction],
        }));

        return transaction;
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));
      },

      getTransaction: (id) => {
        return get().transactions.find((tx) => tx.id === id);
      },

      getTransactionsByAccount: (accountId) => {
        return get().transactions
          .filter((tx) => tx.accountId === accountId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getUnreconciledTransactions: (accountId) => {
        return get().transactions
          .filter((tx) => tx.accountId === accountId && !tx.isReconciled)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      // ========================================================================
      // Rapprochement bancaire
      // ========================================================================

      reconcileTransaction: (transactionId, accountingEntryId) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === transactionId
              ? {
                  ...tx,
                  isReconciled: true,
                  reconciledAt: new Date(),
                  accountingEntryId,
                }
              : tx
          ),
        }));
      },

      unreconcileTransaction: (transactionId) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === transactionId
              ? {
                  ...tx,
                  isReconciled: false,
                  reconciledAt: undefined,
                  accountingEntryId: undefined,
                }
              : tx
          ),
        }));
      },

      startReconciliation: (accountId, startDate, endDate, startBalance) => {
        const transactions = get().getTransactionsByAccount(accountId)
          .filter(tx => {
            const txDate = new Date(tx.date);
            return txDate >= startDate && txDate <= endDate;
          });

        const reconciledCount = transactions.filter(tx => tx.isReconciled).length;
        const unreconciledCount = transactions.length - reconciledCount;

        const endBalance = transactions.reduce((balance, tx) => {
          return balance + (tx.type === 'CREDIT' ? tx.amount : -tx.amount);
        }, startBalance);

        const reconciliation: BankReconciliation = {
          id: `bank-rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          accountId,
          startDate,
          endDate,
          startBalance,
          endBalance,
          status: 'IN_PROGRESS',
          reconciledTransactionsCount: reconciledCount,
          unreconciledTransactionsCount: unreconciledCount,
          discrepancy: 0,
          createdAt: new Date(),
        };

        set((state) => ({
          reconciliations: [...state.reconciliations, reconciliation],
        }));

        return reconciliation;
      },

      completeReconciliation: (reconciliationId) => {
        set((state) => ({
          reconciliations: state.reconciliations.map((rec) =>
            rec.id === reconciliationId
              ? {
                  ...rec,
                  status: 'COMPLETED' as const,
                  completedAt: new Date(),
                }
              : rec
          ),
        }));
      },

      validateReconciliation: (reconciliationId) => {
        set((state) => ({
          reconciliations: state.reconciliations.map((rec) =>
            rec.id === reconciliationId
              ? {
                  ...rec,
                  status: 'VALIDATED' as const,
                  validatedAt: new Date(),
                }
              : rec
          ),
        }));
      },

      // ========================================================================
      // Import de transactions
      // ========================================================================

      importTransactions: (accountId, transactionsData) => {
        const now = new Date();
        const newTransactions: BankTransaction[] = transactionsData.map((txData) => ({
          ...txData,
          id: `bank-tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          accountId,
          isReconciled: false,
          importedAt: now,
          createdAt: now,
        }));

        set((state) => ({
          transactions: [...state.transactions, ...newTransactions],
        }));
      },

      // ========================================================================
      // Helpers
      // ========================================================================

      calculateAccountBalance: (accountId) => {
        const transactions = get().getTransactionsByAccount(accountId);
        const account = get().getAccount(accountId);

        if (!account) return 0;

        return transactions.reduce((balance, tx) => {
          return balance + (tx.type === 'CREDIT' ? tx.amount : -tx.amount);
        }, account.balance);
      },

      getReconciliationStats: (accountId, startDate, endDate) => {
        let transactions = get().getTransactionsByAccount(accountId);

        if (startDate || endDate) {
          transactions = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            if (startDate && txDate < startDate) return false;
            if (endDate && txDate > endDate) return false;
            return true;
          });
        }

        const reconciledTransactions = transactions.filter(tx => tx.isReconciled);
        const unreconciledTransactions = transactions.filter(tx => !tx.isReconciled);

        const reconciledAmount = reconciledTransactions.reduce((sum, tx) => {
          return sum + (tx.type === 'CREDIT' ? tx.amount : -tx.amount);
        }, 0);

        const unreconciledAmount = unreconciledTransactions.reduce((sum, tx) => {
          return sum + (tx.type === 'CREDIT' ? tx.amount : -tx.amount);
        }, 0);

        return {
          totalTransactions: transactions.length,
          reconciledCount: reconciledTransactions.length,
          unreconciledCount: unreconciledTransactions.length,
          reconciledAmount,
          unreconciledAmount,
        };
      },
    }),
    {
      name: 'mizanpro-bank-storage',
    }
  )
);
