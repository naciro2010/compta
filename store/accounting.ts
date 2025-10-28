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
  User,
  Establishment,
  GlobalAuditEntry,
  AuditAction,
  LegalIdentifiers,
  VATRegime,
} from '@/types/accounting';
import { CGNC_ACCOUNTS } from '@/data/cgnc-plan';
import {
  validateEntry,
  validateBalance,
  calculateMADAmount,
  validateCompanySettings,
  extractEstablishmentCode,
} from '@/lib/accounting/validation';
import { createAuditEntry } from '@/lib/accounting/audit';
import { hasPermission } from '@/lib/accounting/permissions';

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

  // EPIC 2: Utilisateurs et RBAC
  users: User[];
  currentUser: User | null;

  // EPIC 2: Établissements
  establishments: Establishment[];
  currentEstablishment: Establishment | null;

  // EPIC 2: Journal d'audit global (immuable)
  globalAuditLog: GlobalAuditEntry[];

  // Actions - Configuration
  initializeCompany: (settings: Omit<CompanySettings, 'id' | 'createdAt' | 'establishments' | 'updatedAt'>) => void;
  updateCompanySettings: (updates: Partial<CompanySettings>) => void;

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

  // EPIC 2: Actions - Utilisateurs
  createUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setCurrentUser: (user: User | null) => void;

  // EPIC 2: Actions - Établissements
  createEstablishment: (establishment: Omit<Establishment, 'id' | 'createdAt'>) => void;
  updateEstablishment: (id: string, updates: Partial<Establishment>) => void;
  suspendEstablishment: (id: string, userId: string) => void;
  setCurrentEstablishment: (establishment: Establishment | null) => void;

  // EPIC 2: Actions - Audit
  addAuditEntry: (action: AuditAction, entityType: string, entityId: string, metadata?: Record<string, any>) => void;
  getAuditEntries: (filters?: { userId?: string; action?: AuditAction; entityType?: string; startDate?: Date; endDate?: Date }) => GlobalAuditEntry[];

  // Requêtes - Rapports
  getBalance: (periodId: string, establishmentId?: string) => BalanceSheet | null;
  getGeneralLedger: (periodId: string, accountId?: string, establishmentId?: string) => GeneralLedger | null;
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
  // EPIC 2: État initial
  users: [],
  currentUser: null,
  establishments: [],
  currentEstablishment: null,
  globalAuditLog: [],

  // ============================================================================
  // Configuration
  // ============================================================================

  initializeCompany: (settings) => {
    // EPIC 2: Créer l'établissement principal à partir de l'ICE
    const establishmentCode = extractEstablishmentCode(settings.legalIdentifiers.ice);
    const mainEstablishment: Establishment = {
      id: crypto.randomUUID(),
      companyId: '', // Will be set after company creation
      code: establishmentCode,
      name: `${settings.name} - Siège`,
      address: settings.address,
      city: settings.city,
      postalCode: settings.postalCode,
      phone: settings.phone,
      email: settings.email,
      isActive: true,
      isMainEstablishment: true,
      createdAt: new Date(),
    };

    const companyId = crypto.randomUUID();
    mainEstablishment.companyId = companyId;

    const companySettings: CompanySettings = {
      id: companyId,
      ...settings,
      establishments: [mainEstablishment],
      createdAt: new Date(),
      // Backward compatibility
      taxId: settings.legalIdentifiers.ice,
    };

    set({
      companySettings,
      establishments: [mainEstablishment],
      currentEstablishment: mainEstablishment,
    });

    // EPIC 2: Créer un utilisateur administrateur par défaut
    const adminUser: User = {
      id: crypto.randomUUID(),
      email: settings.email || 'admin@example.com',
      firstName: 'Administrateur',
      lastName: 'Système',
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date(),
    };

    set({
      users: [adminUser],
      currentUser: adminUser,
    });

    // EPIC 2: Ajouter une entrée d'audit
    get().addAuditEntry('SETTINGS_UPDATE', 'Company', companyId, {
      action: 'Company initialized',
      name: settings.name,
    });

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

  updateCompanySettings: (updates) => {
    const { companySettings, currentUser } = get();
    if (!companySettings) return;

    const updatedSettings: CompanySettings = {
      ...companySettings,
      ...updates,
      updatedAt: new Date(),
    };

    set({ companySettings: updatedSettings });

    // Ajouter une entrée d'audit
    if (currentUser) {
      get().addAuditEntry('SETTINGS_UPDATE', 'Company', companySettings.id, {
        updates: Object.keys(updates),
      });
    }
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
  // EPIC 2: Utilisateurs
  // ============================================================================

  createUser: (userData) => {
    const { currentUser } = get();

    // Vérifier la permission
    if (currentUser && !hasPermission(currentUser, 'users:create')) {
      console.error('Permission refusée: users:create');
      return;
    }

    const user: User = {
      id: crypto.randomUUID(),
      ...userData,
      createdAt: new Date(),
    };

    set((state) => ({
      users: [...state.users, user],
    }));

    // Ajouter une entrée d'audit
    if (currentUser) {
      get().addAuditEntry('USER_CREATE', 'User', user.id, {
        email: user.email,
        role: user.role,
      });
    }
  },

  updateUser: (id, updates) => {
    const { currentUser } = get();

    // Vérifier la permission
    if (currentUser && !hasPermission(currentUser, 'users:update')) {
      console.error('Permission refusée: users:update');
      return;
    }

    set((state) => ({
      users: state.users.map(user =>
        user.id === id ? { ...user, ...updates, updatedAt: new Date() } : user
      ),
    }));

    // Ajouter une entrée d'audit
    if (currentUser) {
      get().addAuditEntry('USER_UPDATE', 'User', id, {
        updates: Object.keys(updates),
      });
    }
  },

  deleteUser: (id) => {
    const { currentUser } = get();

    // Vérifier la permission
    if (currentUser && !hasPermission(currentUser, 'users:delete')) {
      console.error('Permission refusée: users:delete');
      return;
    }

    set((state) => ({
      users: state.users.filter(user => user.id !== id),
    }));

    // Ajouter une entrée d'audit
    if (currentUser) {
      get().addAuditEntry('USER_DELETE', 'User', id);
    }
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });

    if (user) {
      get().addAuditEntry('USER_LOGIN', 'User', user.id, {
        email: user.email,
      });
    }
  },

  // ============================================================================
  // EPIC 2: Établissements
  // ============================================================================

  createEstablishment: (establishmentData) => {
    const { companySettings, currentUser } = get();
    if (!companySettings) return;

    const establishment: Establishment = {
      id: crypto.randomUUID(),
      ...establishmentData,
      createdAt: new Date(),
    };

    set((state) => ({
      establishments: [...state.establishments, establishment],
      companySettings: state.companySettings
        ? {
            ...state.companySettings,
            establishments: [...state.companySettings.establishments, establishment],
            updatedAt: new Date(),
          }
        : null,
    }));

    // Ajouter une entrée d'audit
    if (currentUser) {
      get().addAuditEntry('SETTINGS_UPDATE', 'Establishment', establishment.id, {
        action: 'Establishment created',
        name: establishment.name,
        code: establishment.code,
      });
    }
  },

  updateEstablishment: (id, updates) => {
    const { currentUser } = get();

    set((state) => {
      const updatedEstablishments = state.establishments.map(est =>
        est.id === id ? { ...est, ...updates } : est
      );

      return {
        establishments: updatedEstablishments,
        companySettings: state.companySettings
          ? {
              ...state.companySettings,
              establishments: updatedEstablishments,
              updatedAt: new Date(),
            }
          : null,
      };
    });

    // Ajouter une entrée d'audit
    if (currentUser) {
      get().addAuditEntry('SETTINGS_UPDATE', 'Establishment', id, {
        action: 'Establishment updated',
        updates: Object.keys(updates),
      });
    }
  },

  suspendEstablishment: (id, userId) => {
    get().updateEstablishment(id, {
      isActive: false,
      suspendedAt: new Date(),
      suspendedBy: userId,
    });
  },

  setCurrentEstablishment: (establishment) => {
    set({ currentEstablishment: establishment });
  },

  // ============================================================================
  // EPIC 2: Audit
  // ============================================================================

  addAuditEntry: (action, entityType, entityId, metadata?) => {
    const { currentUser, globalAuditLog } = get();

    const auditEntry = createAuditEntry({
      action,
      userId: currentUser?.id || 'system',
      entityType,
      entityId,
      metadata,
    });

    set({
      globalAuditLog: [...globalAuditLog, auditEntry],
    });
  },

  getAuditEntries: (filters?) => {
    const { globalAuditLog } = get();

    if (!filters) {
      return globalAuditLog;
    }

    return globalAuditLog.filter(entry => {
      if (filters.userId && entry.userId !== filters.userId) return false;
      if (filters.action && entry.action !== filters.action) return false;
      if (filters.entityType && entry.entityType !== filters.entityType) return false;
      if (filters.startDate && entry.timestamp < filters.startDate) return false;
      if (filters.endDate && entry.timestamp > filters.endDate) return false;
      return true;
    });
  },

  // ============================================================================
  // Rapports
  // ============================================================================

  getBalance: (periodId, establishmentId?) => {
    const { accounts, entries } = get();

    // EPIC 2: Filtrer par établissement si spécifié
    let periodEntries = entries.filter(e => e.periodId === periodId && e.isValidated);

    if (establishmentId) {
      periodEntries = periodEntries.filter(e => e.establishmentId === establishmentId);
    }

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

  getGeneralLedger: (periodId, accountId?, establishmentId?) => {
    const { entries } = get();

    // EPIC 2: Filtrer par établissement si spécifié
    let periodEntries = entries.filter(
      e => e.periodId === periodId && e.isValidated
    );

    if (establishmentId) {
      periodEntries = periodEntries.filter(e => e.establishmentId === establishmentId);
    }

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
