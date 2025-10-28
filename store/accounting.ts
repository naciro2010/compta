/**
 * Store Zustand pour le Noyau Comptable CGNC
 * Gestion d'état centralisée pour toutes les fonctionnalités comptables
 */

import { create } from 'zustand';
import {
  Account,
  Entry,
  EntryLine,
  Journal,
  AccountingPeriod,
  FiscalYear,
  Currency,
  BalanceSheet,
  GeneralLedger,
  AuditEntry,
  CompanySettings,
  SectorModel,
} from '@/types/accounting';
import { CGNC_ACCOUNTS } from '@/data/cgnc-plan';
import { validateEntry, validateBalance, calculateMADAmount } from '@/lib/accounting/validation';

interface AccountingState {
  // Configuration
  companySettings: CompanySettings | null;

  // Comptes
  accounts: Account[];

  // Journaux
  journals: Journal[];

  // Écritures
  entries: Entry[];
  currentEntry: Partial<Entry> | null;

  // Périodes et exercices
  fiscalYears: FiscalYear[];
  currentPeriod: AccountingPeriod | null;

  // Devises
  currencies: Currency[];

  // Actions - Configuration
  initializeCompany: (settings: Omit<CompanySettings, 'id' | 'createdAt'>) => void;

  // Actions - Comptes
  loadCGNCPlan: (sectorModel?: SectorModel) => void;
  addCustomAccount: (account: Omit<Account, 'id' | 'createdAt' | 'isCustom'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;

  // Actions - Journaux
  createJournal: (journal: Omit<Journal, 'id' | 'createdAt' | 'lastEntryNumber'>) => void;

  // Actions - Écritures
  createEntry: (entry: Omit<Entry, 'id' | 'createdAt' | 'totalDebit' | 'totalCredit' | 'isBalanced' | 'entryNumber' | 'isValidated' | 'isLocked' | 'attachments' | 'auditLog' | 'validatedBy' | 'validatedAt'>) => void;
  updateEntry: (id: string, updates: Partial<Entry>) => void;
  validateAndSaveEntry: (entry: Partial<Entry>) => boolean;
  deleteEntry: (id: string) => void;

  // Actions - Ligne d'écriture
  setCurrentEntry: (entry: Partial<Entry> | null) => void;
  addEntryLine: (line: Omit<EntryLine, 'id'>) => void;
  updateEntryLine: (lineId: string, updates: Partial<EntryLine>) => void;
  removeEntryLine: (lineId: string) => void;

  // Actions - Périodes
  createFiscalYear: (year: number, startMonth?: number) => void;
  createPeriod: (period: Omit<AccountingPeriod, 'id'>) => void;
  closePeriod: (periodId: string, userId: string) => void;
  setCurrentPeriod: (period: AccountingPeriod) => void;

  // Actions - Devises
  addCurrency: (currency: Currency) => void;
  updateExchangeRate: (currencyCode: string, rate: number) => void;

  // Requêtes - Rapports
  getBalance: (periodId: string) => BalanceSheet | null;
  getGeneralLedger: (periodId: string, accountId?: string) => GeneralLedger | null;
  getAccountBalance: (accountId: string, periodId: string) => number;
}

export const useAccountingStore = create<AccountingState>((set, get) => ({
  // État initial
  companySettings: null,
  accounts: [],
  journals: [],
  entries: [],
  currentEntry: null,
  fiscalYears: [],
  currentPeriod: null,
  currencies: [
    {
      code: 'MAD',
      symbol: 'DH',
      label: 'Dirham Marocain',
      isBaseCurrency: true,
      exchangeRate: 1,
      updatedAt: new Date(),
    },
  ],

  // ============================================================================
  // Configuration
  // ============================================================================

  initializeCompany: (settings) => {
    const companySettings: CompanySettings = {
      id: crypto.randomUUID(),
      ...settings,
      createdAt: new Date(),
    };

    set({ companySettings });

    // Charger le plan de comptes
    get().loadCGNCPlan(settings.sectorModel);

    // Créer les journaux de base
    const defaultJournals: Journal[] = [
      {
        id: crypto.randomUUID(),
        code: 'VTE',
        label: 'Journal des Ventes',
        isActive: true,
        lastEntryNumber: 0,
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: 'ACH',
        label: 'Journal des Achats',
        isActive: true,
        lastEntryNumber: 0,
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: 'BQ',
        label: 'Journal de Banque',
        isActive: true,
        lastEntryNumber: 0,
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: 'CAI',
        label: 'Journal de Caisse',
        isActive: true,
        lastEntryNumber: 0,
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: 'OD',
        label: 'Journal des Opérations Diverses',
        isActive: true,
        lastEntryNumber: 0,
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: 'AN',
        label: 'Journal des À-Nouveaux',
        isActive: true,
        lastEntryNumber: 0,
        createdAt: new Date(),
      },
    ];

    set({ journals: defaultJournals });

    // Créer l'exercice courant
    const currentYear = new Date().getFullYear();
    get().createFiscalYear(currentYear, settings.fiscalYearStart);
  },

  // ============================================================================
  // Comptes
  // ============================================================================

  loadCGNCPlan: (sectorModel = 'GENERAL') => {
    const accounts: Account[] = CGNC_ACCOUNTS.map(account => ({
      ...account,
      createdAt: new Date(),
    }));

    set({ accounts });
  },

  addCustomAccount: (accountData) => {
    const account: Account = {
      id: crypto.randomUUID(),
      ...accountData,
      isCustom: true,
      createdAt: new Date(),
    };

    set((state) => ({
      accounts: [...state.accounts, account],
    }));
  },

  updateAccount: (id, updates) => {
    set((state) => ({
      accounts: state.accounts.map(account =>
        account.id === id ? { ...account, ...updates } : account
      ),
    }));
  },

  // ============================================================================
  // Journaux
  // ============================================================================

  createJournal: (journalData) => {
    const journal: Journal = {
      id: crypto.randomUUID(),
      ...journalData,
      lastEntryNumber: 0,
      createdAt: new Date(),
    };

    set((state) => ({
      journals: [...state.journals, journal],
    }));
  },

  // ============================================================================
  // Écritures
  // ============================================================================

  createEntry: (entryData) => {
    const { lines } = entryData;

    // Calculer les totaux
    const totalDebit = lines.reduce((sum, line) => sum + line.debitMAD, 0);
    const totalCredit = lines.reduce((sum, line) => sum + line.creditMAD, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    // Générer le numéro de pièce
    const journal = get().journals.find(j => j.id === entryData.journalId);
    if (!journal) throw new Error('Journal introuvable');

    const entryNumber = `${journal.code}${String(journal.lastEntryNumber + 1).padStart(6, '0')}`;

    const auditLog: AuditEntry[] = [
      {
        id: crypto.randomUUID(),
        action: 'CREATE',
        userId: entryData.createdBy,
        timestamp: new Date(),
      },
    ];

    const entry: Entry = {
      id: crypto.randomUUID(),
      ...entryData,
      entryNumber,
      totalDebit,
      totalCredit,
      isBalanced,
      isValidated: false,
      isLocked: false,
      attachments: [],
      auditLog,
      createdAt: new Date(),
    };

    // Incrémenter le compteur du journal
    set((state) => ({
      entries: [...state.entries, entry],
      journals: state.journals.map(j =>
        j.id === journal.id
          ? { ...j, lastEntryNumber: j.lastEntryNumber + 1 }
          : j
      ),
    }));
  },

  updateEntry: (id, updates) => {
    set((state) => ({
      entries: state.entries.map(entry => {
        if (entry.id !== id) return entry;

        const updated = { ...entry, ...updates };

        // Recalculer les totaux si les lignes ont changé
        if (updates.lines) {
          const totalDebit = updates.lines.reduce((sum, line) => sum + line.debitMAD, 0);
          const totalCredit = updates.lines.reduce((sum, line) => sum + line.creditMAD, 0);
          updated.totalDebit = totalDebit;
          updated.totalCredit = totalCredit;
          updated.isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
        }

        return updated;
      }),
    }));
  },

  validateAndSaveEntry: (entry) => {
    const { accounts, currentPeriod } = get();

    const validation = validateEntry(entry, accounts, currentPeriod || undefined);

    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      return false;
    }

    if (entry.id) {
      get().updateEntry(entry.id, {
        ...entry,
        isValidated: true,
        validatedAt: new Date(),
      });
    }

    return true;
  },

  deleteEntry: (id) => {
    set((state) => ({
      entries: state.entries.filter(entry => entry.id !== id),
    }));
  },

  // ============================================================================
  // Ligne d'écriture
  // ============================================================================

  setCurrentEntry: (entry) => {
    set({ currentEntry: entry });
  },

  addEntryLine: (lineData) => {
    const { currentEntry } = get();
    if (!currentEntry) return;

    const line: EntryLine = {
      id: crypto.randomUUID(),
      ...lineData,
    };

    const lines = [...(currentEntry.lines || []), line];

    set({
      currentEntry: {
        ...currentEntry,
        lines,
      },
    });
  },

  updateEntryLine: (lineId, updates) => {
    const { currentEntry } = get();
    if (!currentEntry || !currentEntry.lines) return;

    const lines = currentEntry.lines.map(line =>
      line.id === lineId ? { ...line, ...updates } : line
    );

    set({
      currentEntry: {
        ...currentEntry,
        lines,
      },
    });
  },

  removeEntryLine: (lineId) => {
    const { currentEntry } = get();
    if (!currentEntry || !currentEntry.lines) return;

    const lines = currentEntry.lines.filter(line => line.id !== lineId);

    set({
      currentEntry: {
        ...currentEntry,
        lines,
      },
    });
  },

  // ============================================================================
  // Périodes
  // ============================================================================

  createFiscalYear: (year, startMonth = 1) => {
    const startDate = new Date(year, startMonth - 1, 1);
    const endDate = new Date(year + 1, startMonth - 1, 0);

    const periods: AccountingPeriod[] = [];
    for (let i = 0; i < 12; i++) {
      const periodStart = new Date(year, (startMonth - 1 + i) % 12, 1);
      const periodEnd = new Date(year, (startMonth + i) % 12, 0);

      periods.push({
        id: crypto.randomUUID(),
        fiscalYearId: '',
        periodNumber: i + 1,
        startDate: periodStart,
        endDate: periodEnd,
        label: periodStart.toLocaleDateString('fr-MA', { month: 'long', year: 'numeric' }),
        type: 'MONTH',
        isOpen: true,
        isClosed: false,
      });
    }

    const fiscalYear: FiscalYear = {
      id: crypto.randomUUID(),
      year,
      startDate,
      endDate,
      label: `Exercice ${year}`,
      isActive: true,
      isClosed: false,
      periods: periods.map(p => ({ ...p, fiscalYearId: '' })),
      createdAt: new Date(),
    };

    // Mettre à jour les fiscalYearId des périodes
    fiscalYear.periods = fiscalYear.periods.map(p => ({
      ...p,
      fiscalYearId: fiscalYear.id,
    }));

    set((state) => ({
      fiscalYears: [...state.fiscalYears, fiscalYear],
      currentPeriod: state.currentPeriod || fiscalYear.periods[0],
    }));
  },

  createPeriod: (periodData) => {
    const period: AccountingPeriod = {
      id: crypto.randomUUID(),
      ...periodData,
    };

    set((state) => {
      const fiscalYears = state.fiscalYears.map(fy =>
        fy.id === periodData.fiscalYearId
          ? { ...fy, periods: [...fy.periods, period] }
          : fy
      );

      return { fiscalYears };
    });
  },

  closePeriod: (periodId, userId) => {
    set((state) => {
      const fiscalYears = state.fiscalYears.map(fy => ({
        ...fy,
        periods: fy.periods.map(p =>
          p.id === periodId
            ? {
                ...p,
                isOpen: false,
                isClosed: true,
                closedBy: userId,
                closedAt: new Date(),
              }
            : p
        ),
      }));

      return { fiscalYears };
    });
  },

  setCurrentPeriod: (period) => {
    set({ currentPeriod: period });
  },

  // ============================================================================
  // Devises
  // ============================================================================

  addCurrency: (currency) => {
    set((state) => ({
      currencies: [...state.currencies, currency],
    }));
  },

  updateExchangeRate: (currencyCode, rate) => {
    set((state) => ({
      currencies: state.currencies.map(c =>
        c.code === currencyCode
          ? { ...c, exchangeRate: rate, updatedAt: new Date() }
          : c
      ),
    }));
  },

  // ============================================================================
  // Rapports
  // ============================================================================

  getBalance: (periodId) => {
    const { accounts, entries } = get();

    const periodEntries = entries.filter(e => e.periodId === periodId && e.isValidated);

    const lines = accounts
      .filter(a => a.isDetailAccount)
      .map(account => {
        let periodDebit = 0;
        let periodCredit = 0;

        periodEntries.forEach(entry => {
          entry.lines.forEach(line => {
            if (line.accountId === account.id) {
              periodDebit += line.debitMAD;
              periodCredit += line.creditMAD;
            }
          });
        });

        const balance = periodDebit - periodCredit;
        const closingDebit = balance > 0 ? balance : 0;
        const closingCredit = balance < 0 ? Math.abs(balance) : 0;

        return {
          accountId: account.id,
          account,
          openingDebit: 0,
          openingCredit: 0,
          periodDebit,
          periodCredit,
          closingDebit,
          closingCredit,
          balance,
        };
      })
      .filter(line => line.periodDebit > 0 || line.periodCredit > 0);

    const totalDebit = lines.reduce((sum, line) => sum + line.closingDebit, 0);
    const totalCredit = lines.reduce((sum, line) => sum + line.closingCredit, 0);

    return {
      periodId,
      lines,
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      generatedAt: new Date(),
    };
  },

  getGeneralLedger: (periodId, accountId) => {
    const { entries } = get();

    let periodEntries = entries.filter(
      e => e.periodId === periodId && e.isValidated
    );

    if (accountId) {
      periodEntries = periodEntries.filter(e =>
        e.lines.some(l => l.accountId === accountId)
      );
    }

    const ledgerEntries = periodEntries
      .flatMap(entry =>
        entry.lines
          .filter(line => !accountId || line.accountId === accountId)
          .map(line => ({
            date: entry.date,
            entryNumber: entry.entryNumber,
            journalCode: entry.journal?.code || '',
            accountId: line.accountId,
            accountLabel: line.account?.label || '',
            description: line.label,
            reference: entry.reference,
            debit: line.debitMAD,
            credit: line.creditMAD,
            balance: 0,
          }))
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculer les soldes cumulés
    let balance = 0;
    ledgerEntries.forEach(entry => {
      balance += entry.debit - entry.credit;
      entry.balance = balance;
    });

    return {
      periodId,
      accountId,
      entries: ledgerEntries,
      generatedAt: new Date(),
    };
  },

  getAccountBalance: (accountId, periodId) => {
    const { entries } = get();

    const periodEntries = entries.filter(
      e => e.periodId === periodId && e.isValidated
    );

    let balance = 0;

    periodEntries.forEach(entry => {
      entry.lines.forEach(line => {
        if (line.accountId === accountId) {
          balance += line.debitMAD - line.creditMAD;
        }
      });
    });

    return balance;
  },
}));
