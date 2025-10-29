/**
 * Store Zustand pour le module de Facturation
 * EPIC Facturation - Story F.1
 */

import { create } from 'zustand';
import {
  ThirdParty,
  ThirdPartyType,
  Invoice,
  InvoiceType,
  InvoiceStatus,
  InvoiceLine,
  Payment,
  PaymentMethod,
  InvoiceReminder,
  InvoiceNumberingConfig,
  InvoiceTemplate,
  InvoicingStats,
} from '@/types/invoicing';
import { JournalEntry, JournalCode } from '@/types/accounting';

interface InvoicingStore {
  // ============================================================================
  // STATE
  // ============================================================================

  // Tiers
  thirdParties: ThirdParty[];
  currentThirdParty: ThirdParty | null;

  // Factures & Devis
  invoices: Invoice[];
  currentInvoice: Invoice | null;

  // Paiements
  payments: Payment[];

  // Configuration
  numberingConfigs: InvoiceNumberingConfig[];
  templates: InvoiceTemplate[];
  activeTemplate: InvoiceTemplate | null;

  // UI State
  isLoading: boolean;
  error: string | null;

  // ============================================================================
  // ACTIONS - TIERS
  // ============================================================================

  // Créer un tiers
  createThirdParty: (thirdParty: Omit<ThirdParty, 'id' | 'createdAt' | 'createdBy'>) => ThirdParty;

  // Mettre à jour un tiers
  updateThirdParty: (id: string, updates: Partial<ThirdParty>) => void;

  // Supprimer un tiers (soft delete)
  deleteThirdParty: (id: string) => void;

  // Récupérer un tiers
  getThirdParty: (id: string) => ThirdParty | undefined;

  // Rechercher des tiers
  searchThirdParties: (query: string, type?: ThirdPartyType) => ThirdParty[];

  // Obtenir tous les clients
  getCustomers: () => ThirdParty[];

  // Obtenir tous les fournisseurs
  getSuppliers: () => ThirdParty[];

  // Sélectionner un tiers actif
  setCurrentThirdParty: (thirdParty: ThirdParty | null) => void;

  // Générer code tiers automatique
  generateThirdPartyCode: (type: ThirdPartyType) => string;

  // ============================================================================
  // ACTIONS - FACTURES
  // ============================================================================

  // Créer une facture/devis
  createInvoice: (invoice: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'createdBy' | 'totalHT' | 'totalVAT' | 'totalTTC' | 'amountPaid' | 'amountDue'>) => Invoice;

  // Mettre à jour une facture
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;

  // Supprimer une facture
  deleteInvoice: (id: string) => void;

  // Récupérer une facture
  getInvoice: (id: string) => Invoice | undefined;

  // Obtenir toutes les factures
  getInvoices: (filters?: {
    type?: InvoiceType;
    status?: InvoiceStatus;
    thirdPartyId?: string;
    startDate?: Date;
    endDate?: Date;
  }) => Invoice[];

  // Sélectionner une facture active
  setCurrentInvoice: (invoice: Invoice | null) => void;

  // Calculer les totaux d'une facture
  calculateInvoiceTotals: (lines: InvoiceLine[], globalDiscountRate?: number) => {
    subtotalHT: number;
    totalHT: number;
    totalVAT: number;
    totalTTC: number;
    vatBreakdown: { rate: number; base: number; amount: number }[];
  };

  // Ajouter une ligne à la facture
  addInvoiceLine: (invoiceId: string, line: Omit<InvoiceLine, 'id'>) => void;

  // Mettre à jour une ligne
  updateInvoiceLine: (invoiceId: string, lineId: string, updates: Partial<InvoiceLine>) => void;

  // Supprimer une ligne
  deleteInvoiceLine: (invoiceId: string, lineId: string) => void;

  // Changer le statut d'une facture
  changeInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;

  // Convertir un devis en facture
  convertQuoteToInvoice: (quoteId: string) => Invoice;

  // Générer un avoir
  createCreditNote: (invoiceId: string, lines?: InvoiceLine[]) => Invoice;

  // Dupliquer une facture
  duplicateInvoice: (invoiceId: string) => Invoice;

  // ============================================================================
  // ACTIONS - PAIEMENTS
  // ============================================================================

  // Enregistrer un paiement
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'createdBy'>) => void;

  // Supprimer un paiement
  deletePayment: (paymentId: string) => void;

  // Obtenir les paiements d'une facture
  getInvoicePayments: (invoiceId: string) => Payment[];

  // ============================================================================
  // ACTIONS - RELANCES
  // ============================================================================

  // Envoyer une relance
  sendReminder: (invoiceId: string, reminder: Omit<InvoiceReminder, 'id' | 'sentAt'>) => void;

  // Obtenir les factures en retard
  getOverdueInvoices: () => Invoice[];

  // ============================================================================
  // ACTIONS - NUMÉROTATION
  // ============================================================================

  // Générer le prochain numéro
  generateInvoiceNumber: (type: InvoiceType, companyId: string) => string;

  // Configurer la numérotation
  setNumberingConfig: (config: InvoiceNumberingConfig) => void;

  // ============================================================================
  // ACTIONS - COMPTABILITÉ
  // ============================================================================

  // Générer l'écriture comptable depuis une facture
  generateJournalEntry: (invoiceId: string) => JournalEntry | null;

  // ============================================================================
  // ACTIONS - STATISTIQUES
  // ============================================================================

  // Obtenir les statistiques
  getStats: (startDate: Date, endDate: Date) => InvoicingStats;

  // Calculer le CA
  getTotalSales: (startDate?: Date, endDate?: Date) => number;

  // Calculer les encours clients
  getOutstandingAmount: () => number;

  // ============================================================================
  // ACTIONS - UTILITAIRES
  // ============================================================================

  // Charger les données initiales
  loadData: () => void;

  // Réinitialiser le store
  reset: () => void;
}

// Store initial state
const initialState = {
  thirdParties: [],
  currentThirdParty: null,
  invoices: [],
  currentInvoice: null,
  payments: [],
  numberingConfigs: [],
  templates: [],
  activeTemplate: null,
  isLoading: false,
  error: null,
};

export const useInvoicingStore = create<InvoicingStore>((set, get) => ({
  ...initialState,

  // ============================================================================
  // TIERS
  // ============================================================================

  createThirdParty: (thirdPartyData) => {
    const newThirdParty: ThirdParty = {
      ...thirdPartyData,
      id: `tp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      createdBy: 'current-user', // TODO: Récupérer depuis auth store
    };

    set((state) => ({
      thirdParties: [...state.thirdParties, newThirdParty],
    }));

    return newThirdParty;
  },

  updateThirdParty: (id, updates) => {
    set((state) => ({
      thirdParties: state.thirdParties.map((tp) =>
        tp.id === id
          ? { ...tp, ...updates, updatedAt: new Date(), updatedBy: 'current-user' }
          : tp
      ),
    }));
  },

  deleteThirdParty: (id) => {
    set((state) => ({
      thirdParties: state.thirdParties.map((tp) =>
        tp.id === id ? { ...tp, isActive: false } : tp
      ),
    }));
  },

  getThirdParty: (id) => {
    return get().thirdParties.find((tp) => tp.id === id);
  },

  searchThirdParties: (query, type) => {
    const { thirdParties } = get();
    const lowerQuery = query.toLowerCase();

    return thirdParties.filter((tp) => {
      const matchesType = !type || tp.type === type || tp.type === 'BOTH';
      const matchesQuery =
        tp.name.toLowerCase().includes(lowerQuery) ||
        tp.code.toLowerCase().includes(lowerQuery) ||
        tp.ice?.includes(query) ||
        tp.email?.toLowerCase().includes(lowerQuery);

      return matchesType && matchesQuery && tp.isActive;
    });
  },

  getCustomers: () => {
    return get().thirdParties.filter(
      (tp) => (tp.type === 'CLIENT' || tp.type === 'BOTH') && tp.isActive
    );
  },

  getSuppliers: () => {
    return get().thirdParties.filter(
      (tp) => (tp.type === 'SUPPLIER' || tp.type === 'BOTH') && tp.isActive
    );
  },

  setCurrentThirdParty: (thirdParty) => {
    set({ currentThirdParty: thirdParty });
  },

  generateThirdPartyCode: (type) => {
    const { thirdParties } = get();
    const prefix = type === 'CLIENT' ? 'CLI' : type === 'SUPPLIER' ? 'FRS' : 'TP';
    const existing = thirdParties.filter((tp) => tp.code.startsWith(prefix));
    const nextNumber = existing.length + 1;
    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  },

  // ============================================================================
  // FACTURES
  // ============================================================================

  createInvoice: (invoiceData) => {
    const { calculateInvoiceTotals, generateInvoiceNumber } = get();

    // Calculer les totaux
    const totals = calculateInvoiceTotals(
      invoiceData.lines,
      invoiceData.globalDiscountRate
    );

    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      number: generateInvoiceNumber(invoiceData.type, invoiceData.companyId),
      ...totals,
      payments: [],
      amountPaid: 0,
      amountDue: totals.totalTTC,
      reminders: [],
      createdAt: new Date(),
      createdBy: 'current-user',
    };

    set((state) => ({
      invoices: [...state.invoices, newInvoice],
    }));

    return newInvoice;
  },

  updateInvoice: (id, updates) => {
    set((state) => ({
      invoices: state.invoices.map((inv) => {
        if (inv.id === id) {
          const updated = { ...inv, ...updates, updatedAt: new Date(), updatedBy: 'current-user' };

          // Recalculer les totaux si les lignes ont changé
          if (updates.lines) {
            const totals = get().calculateInvoiceTotals(
              updates.lines,
              updated.globalDiscountRate
            );
            Object.assign(updated, totals);
            updated.amountDue = totals.totalTTC - updated.amountPaid;
          }

          return updated;
        }
        return inv;
      }),
    }));
  },

  deleteInvoice: (id) => {
    set((state) => ({
      invoices: state.invoices.filter((inv) => inv.id !== id),
    }));
  },

  getInvoice: (id) => {
    return get().invoices.find((inv) => inv.id === id);
  },

  getInvoices: (filters) => {
    let { invoices } = get();

    if (filters) {
      if (filters.type) {
        invoices = invoices.filter((inv) => inv.type === filters.type);
      }
      if (filters.status) {
        invoices = invoices.filter((inv) => inv.status === filters.status);
      }
      if (filters.thirdPartyId) {
        invoices = invoices.filter((inv) => inv.thirdPartyId === filters.thirdPartyId);
      }
      if (filters.startDate) {
        invoices = invoices.filter((inv) => inv.issueDate >= filters.startDate!);
      }
      if (filters.endDate) {
        invoices = invoices.filter((inv) => inv.issueDate <= filters.endDate!);
      }
    }

    return invoices.sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());
  },

  setCurrentInvoice: (invoice) => {
    set({ currentInvoice: invoice });
  },

  calculateInvoiceTotals: (lines, globalDiscountRate = 0) => {
    // Calculer sous-total HT
    const subtotalHT = lines.reduce((sum, line) => sum + line.subtotal, 0);

    // Appliquer remise globale
    const globalDiscountAmount = subtotalHT * (globalDiscountRate / 100);
    const totalHT = subtotalHT - globalDiscountAmount;

    // Calculer TVA par taux
    const vatByRate = new Map<number, { base: number; amount: number }>();

    lines.forEach((line) => {
      const lineBaseAfterGlobalDiscount =
        line.subtotal * (1 - globalDiscountRate / 100);
      const lineVAT = lineBaseAfterGlobalDiscount * (line.vatRate / 100);

      const existing = vatByRate.get(line.vatRate) || { base: 0, amount: 0 };
      vatByRate.set(line.vatRate, {
        base: existing.base + lineBaseAfterGlobalDiscount,
        amount: existing.amount + lineVAT,
      });
    });

    const vatBreakdown = Array.from(vatByRate.entries()).map(([rate, data]) => ({
      rate,
      base: data.base,
      amount: data.amount,
    }));

    const totalVAT = vatBreakdown.reduce((sum, vat) => sum + vat.amount, 0);
    const totalTTC = totalHT + totalVAT;

    return {
      subtotalHT,
      totalHT,
      totalVAT,
      totalTTC,
      vatBreakdown,
    };
  },

  addInvoiceLine: (invoiceId, lineData) => {
    const invoice = get().getInvoice(invoiceId);
    if (!invoice) return;

    const newLine: InvoiceLine = {
      ...lineData,
      id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    get().updateInvoice(invoiceId, {
      lines: [...invoice.lines, newLine],
    });
  },

  updateInvoiceLine: (invoiceId, lineId, updates) => {
    const invoice = get().getInvoice(invoiceId);
    if (!invoice) return;

    const updatedLines = invoice.lines.map((line) =>
      line.id === lineId ? { ...line, ...updates } : line
    );

    get().updateInvoice(invoiceId, { lines: updatedLines });
  },

  deleteInvoiceLine: (invoiceId, lineId) => {
    const invoice = get().getInvoice(invoiceId);
    if (!invoice) return;

    const updatedLines = invoice.lines.filter((line) => line.id !== lineId);
    get().updateInvoice(invoiceId, { lines: updatedLines });
  },

  changeInvoiceStatus: (invoiceId, status) => {
    const updates: Partial<Invoice> = { status };

    if (status === 'SENT') {
      updates.sentAt = new Date();
      updates.sentBy = 'current-user';
    } else if (status === 'PAID') {
      updates.paidAt = new Date();
    }

    get().updateInvoice(invoiceId, updates);
  },

  convertQuoteToInvoice: (quoteId) => {
    const quote = get().getInvoice(quoteId);
    if (!quote || quote.type !== 'QUOTE') {
      throw new Error('Invoice not found or not a quote');
    }

    // Créer une nouvelle facture basée sur le devis
    const invoice = get().createInvoice({
      ...quote,
      type: 'INVOICE',
      status: 'DRAFT',
      parentInvoiceId: quoteId,
      lines: quote.lines,
    });

    // Marquer le devis comme converti
    get().updateInvoice(quoteId, {
      status: 'CONVERTED',
    });

    return invoice;
  },

  createCreditNote: (invoiceId, lines) => {
    const invoice = get().getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Créer un avoir avec les lignes en négatif
    const creditNoteLines = (lines || invoice.lines).map((line) => ({
      ...line,
      id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      quantity: -Math.abs(line.quantity),
      subtotal: -Math.abs(line.subtotal),
      total: -Math.abs(line.total),
    }));

    const creditNote = get().createInvoice({
      ...invoice,
      type: 'CREDIT_NOTE',
      status: 'DRAFT',
      parentInvoiceId: invoiceId,
      lines: creditNoteLines,
    });

    // Associer l'avoir à la facture
    get().updateInvoice(invoiceId, {
      creditNoteIds: [...(invoice.creditNoteIds || []), creditNote.id],
    });

    return creditNote;
  },

  duplicateInvoice: (invoiceId) => {
    const invoice = get().getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return get().createInvoice({
      ...invoice,
      status: 'DRAFT',
      issueDate: new Date(),
      dueDate: undefined,
      lines: invoice.lines.map((line) => ({
        ...line,
        id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    });
  },

  // ============================================================================
  // PAIEMENTS
  // ============================================================================

  addPayment: (paymentData) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      createdBy: 'current-user',
    };

    set((state) => ({
      payments: [...state.payments, newPayment],
    }));

    // Mettre à jour la facture
    const invoice = get().getInvoice(paymentData.invoiceId);
    if (invoice) {
      const newAmountPaid = invoice.amountPaid + paymentData.amount;
      const newAmountDue = invoice.totalTTC - newAmountPaid;

      let newStatus: InvoiceStatus = invoice.status;
      if (newAmountDue <= 0) {
        newStatus = 'PAID';
      } else if (newAmountPaid > 0) {
        newStatus = 'PARTIALLY_PAID';
      }

      get().updateInvoice(paymentData.invoiceId, {
        payments: [...invoice.payments, newPayment],
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        status: newStatus,
      });
    }
  },

  deletePayment: (paymentId) => {
    const payment = get().payments.find((p) => p.id === paymentId);
    if (!payment) return;

    set((state) => ({
      payments: state.payments.filter((p) => p.id !== paymentId),
    }));

    // Mettre à jour la facture
    const invoice = get().getInvoice(payment.invoiceId);
    if (invoice) {
      const newAmountPaid = invoice.amountPaid - payment.amount;
      const newAmountDue = invoice.totalTTC - newAmountPaid;

      let newStatus: InvoiceStatus = 'SENT';
      if (newAmountPaid > 0) {
        newStatus = 'PARTIALLY_PAID';
      }

      get().updateInvoice(payment.invoiceId, {
        payments: invoice.payments.filter((p) => p.id !== paymentId),
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        status: newStatus,
      });
    }
  },

  getInvoicePayments: (invoiceId) => {
    return get().payments.filter((p) => p.invoiceId === invoiceId);
  },

  // ============================================================================
  // RELANCES
  // ============================================================================

  sendReminder: (invoiceId, reminderData) => {
    const invoice = get().getInvoice(invoiceId);
    if (!invoice) return;

    const newReminder: InvoiceReminder = {
      ...reminderData,
      id: `rem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sentAt: new Date(),
    };

    get().updateInvoice(invoiceId, {
      reminders: [...invoice.reminders, newReminder],
      lastReminderSent: new Date(),
    });
  },

  getOverdueInvoices: () => {
    const now = new Date();
    return get().invoices.filter(
      (inv) =>
        inv.dueDate &&
        inv.dueDate < now &&
        inv.status !== 'PAID' &&
        inv.status !== 'CANCELLED'
    );
  },

  // ============================================================================
  // NUMÉROTATION
  // ============================================================================

  generateInvoiceNumber: (type, companyId) => {
    const { numberingConfigs } = get();
    let config = numberingConfigs.find(
      (c) => c.companyId === companyId && c.type === type
    );

    // Créer une config par défaut si elle n'existe pas
    if (!config) {
      const prefixes: Record<InvoiceType, string> = {
        INVOICE: 'FA',
        CREDIT_NOTE: 'AV',
        QUOTE: 'DEV',
        PROFORMA: 'PRO',
        PURCHASE_INVOICE: 'FACH',
        DELIVERY_NOTE: 'BL',
      };

      config = {
        id: `config-${type}-${companyId}`,
        companyId,
        type,
        prefix: prefixes[type],
        includeYear: true,
        counterDigits: 5,
        separator: '-',
        currentCounter: 0,
        resetOnNewYear: true,
      };

      set((state) => ({
        numberingConfigs: [...state.numberingConfigs, config!],
      }));
    }

    // Incrémenter le compteur
    const newCounter = config.currentCounter + 1;
    const year = new Date().getFullYear();
    const counterStr = String(newCounter).padStart(config.counterDigits, '0');

    let number = config.prefix;
    if (config.includeYear) {
      number += `${config.separator}${year}`;
    }
    number += `${config.separator}${counterStr}`;

    // Mettre à jour le compteur
    set((state) => ({
      numberingConfigs: state.numberingConfigs.map((c) =>
        c.id === config!.id ? { ...c, currentCounter: newCounter } : c
      ),
    }));

    return number;
  },

  setNumberingConfig: (config) => {
    set((state) => ({
      numberingConfigs: state.numberingConfigs.some((c) => c.id === config.id)
        ? state.numberingConfigs.map((c) => (c.id === config.id ? config : c))
        : [...state.numberingConfigs, config],
    }));
  },

  // ============================================================================
  // COMPTABILITÉ
  // ============================================================================

  generateJournalEntry: (invoiceId) => {
    // TODO: Implémenter la génération d'écriture comptable
    // Sera implémenté dans Story F.7
    return null;
  },

  // ============================================================================
  // STATISTIQUES
  // ============================================================================

  getStats: (startDate, endDate) => {
    const { invoices } = get();
    const filteredInvoices = invoices.filter(
      (inv) =>
        inv.type === 'INVOICE' &&
        inv.issueDate >= startDate &&
        inv.issueDate <= endDate
    );

    const byStatus: Record<InvoiceStatus, { count: number; amount: number }> = {
      DRAFT: { count: 0, amount: 0 },
      SENT: { count: 0, amount: 0 },
      VIEWED: { count: 0, amount: 0 },
      PARTIALLY_PAID: { count: 0, amount: 0 },
      PAID: { count: 0, amount: 0 },
      OVERDUE: { count: 0, amount: 0 },
      CANCELLED: { count: 0, amount: 0 },
      CONVERTED: { count: 0, amount: 0 },
    };

    filteredInvoices.forEach((inv) => {
      byStatus[inv.status].count++;
      byStatus[inv.status].amount += inv.totalTTC;
    });

    return {
      period: { start: startDate, end: endDate },
      totalInvoices: filteredInvoices.length,
      totalAmount: filteredInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0),
      totalPaid: filteredInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
      totalOutstanding: filteredInvoices.reduce((sum, inv) => sum + inv.amountDue, 0),
      byStatus,
      averagePaymentDelay: 0, // TODO: Calculer
      overdueCount: get().getOverdueInvoices().length,
      overdueAmount: get()
        .getOverdueInvoices()
        .reduce((sum, inv) => sum + inv.amountDue, 0),
      topCustomers: [], // TODO: Calculer
    };
  },

  getTotalSales: (startDate, endDate) => {
    const { invoices } = get();
    return invoices
      .filter(
        (inv) =>
          inv.type === 'INVOICE' &&
          inv.status === 'PAID' &&
          (!startDate || inv.issueDate >= startDate) &&
          (!endDate || inv.issueDate <= endDate)
      )
      .reduce((sum, inv) => sum + inv.totalTTC, 0);
  },

  getOutstandingAmount: () => {
    const { invoices } = get();
    return invoices
      .filter((inv) => inv.type === 'INVOICE' && inv.status !== 'PAID' && inv.status !== 'CANCELLED')
      .reduce((sum, inv) => sum + inv.amountDue, 0);
  },

  // ============================================================================
  // UTILITAIRES
  // ============================================================================

  loadData: () => {
    // TODO: Charger depuis localStorage ou API
    set({ isLoading: false });
  },

  reset: () => {
    set(initialState);
  },
}));
