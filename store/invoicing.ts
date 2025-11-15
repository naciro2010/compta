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
  ReminderTemplate,
  ReminderLevel,
  OverdueInvoiceSummary,
} from '@/types/invoicing';
import { Entry } from '@/types/accounting';

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

  // Relances
  reminderTemplates: ReminderTemplate[];

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

  // Story F.7: Générer l'écriture comptable pour un paiement (lettrage)
  generatePaymentJournalEntry: (paymentId: string) => Entry | null;

  // ============================================================================
  // ACTIONS - RELANCES
  // ============================================================================

  // Envoyer une relance
  sendReminder: (invoiceId: string, reminder: Omit<InvoiceReminder, 'id' | 'sentAt'>) => void;

  // Obtenir les factures en retard
  getOverdueInvoices: () => Invoice[];

  // Obtenir le résumé des factures en retard
  getOverdueSummary: () => OverdueInvoiceSummary;

  // Obtenir les factures en retard par niveau
  getOverdueInvoicesByLevel: (level: 'recent' | 'moderate' | 'severe') => Invoice[];

  // Calculer le nombre de jours de retard
  getDaysOverdue: (invoiceId: string) => number;

  // Obtenir les relances d'une facture
  getInvoiceReminders: (invoiceId: string) => InvoiceReminder[];

  // Créer un template de relance
  createReminderTemplate: (template: Omit<ReminderTemplate, 'id' | 'createdAt'>) => ReminderTemplate;

  // Mettre à jour un template de relance
  updateReminderTemplate: (id: string, updates: Partial<ReminderTemplate>) => void;

  // Supprimer un template de relance
  deleteReminderTemplate: (id: string) => void;

  // Obtenir un template de relance par niveau
  getReminderTemplateByLevel: (level: ReminderLevel) => ReminderTemplate | undefined;

  // Générer un message depuis un template
  generateReminderFromTemplate: (invoiceId: string, templateId: string) => Omit<InvoiceReminder, 'id' | 'sentAt'>;

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
  generateJournalEntry: (invoiceId: string) => Entry | null;

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
  reminderTemplates: [],
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

  // Story F.7: Generate journal entry for payment (lettrage)
  generatePaymentJournalEntry: (paymentId: string) => {
    const payment = get().payments.find(p => p.id === paymentId);
    if (!payment) {
      console.error('Payment not found:', paymentId);
      return null;
    }

    const invoice = get().getInvoice(payment.invoiceId);
    if (!invoice) {
      console.error('Invoice not found for payment:', payment.invoiceId);
      return null;
    }

    // Import accounting store dynamically to avoid circular dependency
    const { useAccountingStore } = require('@/store/accounting');
    const accountingStore = useAccountingStore.getState();

    const { journals, currentPeriod, currentUser } = accountingStore;

    if (!currentPeriod) {
      console.error('No current period selected');
      return null;
    }

    if (!currentUser) {
      console.error('No current user');
      return null;
    }

    // Get the third party
    const thirdParty = invoice.thirdParty || get().getThirdParty(invoice.thirdPartyId);
    if (!thirdParty) {
      console.error('Third party not found:', invoice.thirdPartyId);
      return null;
    }

    // Import GL integration functions
    const {
      generatePaymentJournalEntry,
      generateSupplierPaymentJournalEntry,
      getBankJournal,
      validateJournalEntry,
    } = require('@/lib/accounting/gl-integration');

    // Get the appropriate bank/cash journal
    const journal = getBankJournal(payment.method, journals);
    if (!journal) {
      console.error('No bank/cash journal found for payment method:', payment.method);
      return null;
    }

    // Generate entry based on invoice type (customer or supplier)
    let entry;
    try {
      if (invoice.type === 'PURCHASE_INVOICE') {
        // Supplier payment
        entry = generateSupplierPaymentJournalEntry(
          payment,
          invoice,
          thirdParty,
          journal,
          currentPeriod,
          currentUser.id
        );
      } else {
        // Customer payment
        entry = generatePaymentJournalEntry(
          payment,
          invoice,
          thirdParty,
          journal,
          currentPeriod,
          currentUser.id
        );
      }

      // Validate the entry
      const validation = validateJournalEntry(entry);
      if (!validation.isValid) {
        console.error('Invalid journal entry:', validation.errors);
        return null;
      }

      // Create the entry in the accounting store
      accountingStore.createEntry(entry);

      // Link the entry to the payment
      const updatedPayment: Payment = {
        ...payment,
        journalEntryId: entry.id,
      };

      set((state) => ({
        payments: state.payments.map(p =>
          p.id === paymentId ? updatedPayment : p
        ),
      }));

      // Update the payment in the invoice as well
      get().updateInvoice(invoice.id, {
        payments: invoice.payments.map(p =>
          p.id === paymentId ? updatedPayment : p
        ),
      });

      return entry;
    } catch (error) {
      console.error('Error generating payment journal entry:', error);
      return null;
    }
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

  getOverdueSummary: () => {
    const overdueInvoices = get().getOverdueInvoices();
    const now = new Date();

    const summary: OverdueInvoiceSummary = {
      total: overdueInvoices.length,
      totalAmount: overdueInvoices.reduce((sum, inv) => sum + inv.amountDue, 0),
      recent: { count: 0, amount: 0 },
      moderate: { count: 0, amount: 0 },
      severe: { count: 0, amount: 0 },
    };

    overdueInvoices.forEach((invoice) => {
      if (!invoice.dueDate) return;

      const daysOverdue = Math.floor(
        (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysOverdue < 30) {
        summary.recent.count++;
        summary.recent.amount += invoice.amountDue;
      } else if (daysOverdue < 60) {
        summary.moderate.count++;
        summary.moderate.amount += invoice.amountDue;
      } else {
        summary.severe.count++;
        summary.severe.amount += invoice.amountDue;
      }
    });

    return summary;
  },

  getOverdueInvoicesByLevel: (level) => {
    const overdueInvoices = get().getOverdueInvoices();
    const now = new Date();

    return overdueInvoices.filter((invoice) => {
      if (!invoice.dueDate) return false;

      const daysOverdue = Math.floor(
        (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (level === 'recent') return daysOverdue < 30;
      if (level === 'moderate') return daysOverdue >= 30 && daysOverdue < 60;
      if (level === 'severe') return daysOverdue >= 60;
      return false;
    });
  },

  getDaysOverdue: (invoiceId) => {
    const invoice = get().getInvoice(invoiceId);
    if (!invoice || !invoice.dueDate) return 0;

    const now = new Date();
    const daysOverdue = Math.floor(
      (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysOverdue > 0 ? daysOverdue : 0;
  },

  getInvoiceReminders: (invoiceId) => {
    const invoice = get().getInvoice(invoiceId);
    return invoice?.reminders || [];
  },

  createReminderTemplate: (templateData) => {
    const newTemplate: ReminderTemplate = {
      ...templateData,
      id: `remt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    set((state) => ({
      reminderTemplates: [...state.reminderTemplates, newTemplate],
    }));

    return newTemplate;
  },

  updateReminderTemplate: (id, updates) => {
    set((state) => ({
      reminderTemplates: state.reminderTemplates.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
      ),
    }));
  },

  deleteReminderTemplate: (id) => {
    set((state) => ({
      reminderTemplates: state.reminderTemplates.filter((t) => t.id !== id),
    }));
  },

  getReminderTemplateByLevel: (level) => {
    const { reminderTemplates } = get();
    return reminderTemplates.find((t) => t.level === level && t.isActive && t.isDefault);
  },

  generateReminderFromTemplate: (invoiceId, templateId) => {
    const invoice = get().getInvoice(invoiceId);
    const template = get().reminderTemplates.find((t) => t.id === templateId);

    if (!invoice || !template) {
      throw new Error('Invoice or template not found');
    }

    const thirdParty = invoice.thirdParty || get().getThirdParty(invoice.thirdPartyId);
    const daysOverdue = get().getDaysOverdue(invoiceId);

    // Variables pour le template
    const variables: Record<string, string> = {
      invoice_number: invoice.number,
      customer_name: thirdParty?.name || '',
      amount_due: invoice.amountDue.toFixed(2),
      currency: invoice.currency,
      due_date: invoice.dueDate?.toLocaleDateString('fr-MA') || '',
      days_overdue: daysOverdue.toString(),
      invoice_total: invoice.totalTTC.toFixed(2),
    };

    // Remplacer les variables dans le sujet et le message
    let subject = template.subject;
    let message = template.message;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    const reminder: Omit<InvoiceReminder, 'id' | 'sentAt'> = {
      invoiceId: invoice.id,
      type: 'AUTOMATIC',
      level: template.level,
      subject,
      message,
      sentTo: thirdParty?.email ? [thirdParty.email] : [],
      daysOverdue,
    };

    return reminder;
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
  // COMPTABILITÉ - Story F.7: GL Integration
  // ============================================================================

  generateJournalEntry: (invoiceId) => {
    const invoice = get().getInvoice(invoiceId);
    if (!invoice) {
      console.error('Invoice not found:', invoiceId);
      return null;
    }

    // Import accounting store dynamically to avoid circular dependency
    // In a real app, this would be handled via dependency injection or context
    const { useAccountingStore } = require('@/store/accounting');
    const accountingStore = useAccountingStore.getState();

    const { journals, currentPeriod, currentUser } = accountingStore;

    if (!currentPeriod) {
      console.error('No current period selected');
      return null;
    }

    if (!currentUser) {
      console.error('No current user');
      return null;
    }

    // Get the third party
    const thirdParty = invoice.thirdParty || get().getThirdParty(invoice.thirdPartyId);
    if (!thirdParty) {
      console.error('Third party not found:', invoice.thirdPartyId);
      return null;
    }

    // Import GL integration functions
    const {
      generateInvoiceJournalEntry,
      generateCreditNoteJournalEntry,
      generatePurchaseInvoiceJournalEntry,
      getJournalForInvoiceType,
      validateJournalEntry,
    } = require('@/lib/accounting/gl-integration');

    // Get the appropriate journal
    const journal = getJournalForInvoiceType(invoice.type, journals);
    if (!journal) {
      console.error('No journal found for invoice type:', invoice.type);
      return null;
    }

    // Generate entry based on invoice type
    let entry;
    try {
      switch (invoice.type) {
        case 'INVOICE':
        case 'PROFORMA':
        case 'QUOTE':
        case 'DELIVERY_NOTE':
          entry = generateInvoiceJournalEntry(
            invoice,
            thirdParty,
            journal,
            currentPeriod,
            currentUser.id
          );
          break;

        case 'CREDIT_NOTE':
          entry = generateCreditNoteJournalEntry(
            invoice,
            thirdParty,
            journal,
            currentPeriod,
            currentUser.id
          );
          break;

        case 'PURCHASE_INVOICE':
          entry = generatePurchaseInvoiceJournalEntry(
            invoice,
            thirdParty,
            journal,
            currentPeriod,
            currentUser.id
          );
          break;

        default:
          console.error('Unsupported invoice type for journal entry:', invoice.type);
          return null;
      }

      // Validate the entry
      const validation = validateJournalEntry(entry);
      if (!validation.isValid) {
        console.error('Invalid journal entry:', validation.errors);
        return null;
      }

      // Create the entry in the accounting store
      accountingStore.createEntry(entry);

      // Link the entry to the invoice
      get().updateInvoice(invoiceId, {
        relatedJournalEntryId: entry.id,
      });

      return entry;
    } catch (error) {
      console.error('Error generating journal entry:', error);
      return null;
    }
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

    // Créer des templates de relance par défaut si aucun n'existe
    const { reminderTemplates } = get();
    if (reminderTemplates.length === 0) {
      const defaultTemplates: Omit<ReminderTemplate, 'id' | 'createdAt'>[] = [
        {
          name: 'Première relance (J+7)',
          level: 'FIRST',
          subject: 'Rappel : Facture {invoice_number} en attente de paiement',
          message: `Bonjour {customer_name},

Nous vous rappelons que la facture {invoice_number} d'un montant de {amount_due} {currency}, échue le {due_date}, reste impayée.

Merci de procéder au règlement dans les plus brefs délais.

Cordialement,
L'équipe comptable`,
          daysOverdue: 7,
          isActive: true,
          isDefault: true,
        },
        {
          name: 'Relance modérée (J+30)',
          level: 'SECOND',
          subject: 'Rappel urgent : Facture {invoice_number} en retard de {days_overdue} jours',
          message: `Bonjour {customer_name},

Nous constatons que la facture {invoice_number} d'un montant de {amount_due} {currency} n'a toujours pas été réglée malgré notre précédent rappel.

Cette facture est maintenant en retard de {days_overdue} jours. Nous vous demandons de bien vouloir régulariser votre situation au plus vite.

En cas de problème, n'hésitez pas à nous contacter.

Cordialement,
L'équipe comptable`,
          daysOverdue: 30,
          isActive: true,
          isDefault: true,
        },
        {
          name: 'Relance sévère (J+60)',
          level: 'THIRD',
          subject: 'Dernier rappel : Facture {invoice_number} - {days_overdue} jours de retard',
          message: `Bonjour {customer_name},

Malgré nos précédents rappels, la facture {invoice_number} d'un montant de {amount_due} {currency} demeure impayée depuis {days_overdue} jours.

Nous vous demandons de procéder au règlement immédiat de cette facture. À défaut, nous nous verrons contraints de prendre les mesures nécessaires pour recouvrer cette créance.

Nous restons à votre disposition pour tout arrangement.

Cordialement,
L'équipe comptable`,
          daysOverdue: 60,
          isActive: true,
          isDefault: true,
        },
        {
          name: 'Mise en demeure finale (J+90)',
          level: 'FINAL',
          subject: 'MISE EN DEMEURE - Facture {invoice_number}',
          message: `Madame, Monsieur,

Par la présente, nous vous mettons formellement en demeure de régler la facture {invoice_number} d'un montant de {amount_due} {currency}, en retard de {days_overdue} jours.

En l'absence de règlement sous 15 jours, nous engagerons une procédure de recouvrement contentieux sans autre préavis.

Cette démarche pourra entraîner des frais supplémentaires à votre charge.

Cordialement,
La Direction`,
          daysOverdue: 90,
          isActive: true,
          isDefault: true,
        },
      ];

      defaultTemplates.forEach((template) => {
        get().createReminderTemplate(template);
      });
    }

    set({ isLoading: false });
  },

  reset: () => {
    set(initialState);
  },
}));
