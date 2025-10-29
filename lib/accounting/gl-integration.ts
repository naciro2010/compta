/**
 * GL Integration Library
 * Story F.7: Automatic journal entry generation from invoices and payments
 *
 * This library handles:
 * - Invoice → Journal Entry mapping
 * - Payment → Journal Entry (lettrage)
 * - Account code assignment
 * - Balance synchronization
 */

import {
  Entry,
  EntryLine,
  Journal,
  Account,
  AccountingPeriod,
} from '@/types/accounting';
import {
  Invoice,
  InvoiceType,
  Payment,
  PaymentMethod,
  ThirdParty,
} from '@/types/invoicing';

// ============================================================================
// ACCOUNT MAPPING CONFIGURATION
// ============================================================================

/**
 * Default account codes for GL integration
 * Based on CGNC (Plan Comptable Marocain)
 */
export const DEFAULT_ACCOUNT_CODES = {
  // Clients (411xxx)
  CUSTOMER_BASE: '411000',

  // Fournisseurs (441xxx)
  SUPPLIER_BASE: '441000',

  // Ventes de marchandises (711xxx)
  SALES_GOODS: '711100',

  // Ventes de services (714xxx)
  SALES_SERVICES: '714100',

  // Achats de marchandises (611xxx)
  PURCHASES_GOODS: '611100',

  // Achats de services (614xxx)
  PURCHASES_SERVICES: '614100',

  // TVA collectée (4455)
  VAT_COLLECTED: '445510',

  // TVA déductible (3455)
  VAT_DEDUCTIBLE: '345510',

  // Banque (512xxx)
  BANK: '512100',

  // Caisse (516xxx)
  CASH: '516100',

  // Remises accordées (713)
  SALES_DISCOUNTS: '713000',

  // Remises obtenues (613)
  PURCHASE_DISCOUNTS: '613000',

  // Avoirs sur ventes (7119)
  SALES_CREDIT_NOTES: '711900',

  // Avoirs sur achats (6119)
  PURCHASE_CREDIT_NOTES: '611900',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get or create customer account code
 */
export function getCustomerAccountCode(thirdParty: ThirdParty): string {
  if (thirdParty.customerAccountCode) {
    return thirdParty.customerAccountCode;
  }

  // Generate a unique customer account code
  // Format: 411 + last 3 digits of code (e.g., CLI-0001 → 411001)
  const codeMatch = thirdParty.code.match(/\d+$/);
  const suffix = codeMatch ? codeMatch[0].padStart(3, '0').slice(-3) : '000';
  return `411${suffix}`;
}

/**
 * Get or create supplier account code
 */
export function getSupplierAccountCode(thirdParty: ThirdParty): string {
  if (thirdParty.supplierAccountCode) {
    return thirdParty.supplierAccountCode;
  }

  // Generate a unique supplier account code
  // Format: 441 + last 3 digits of code (e.g., FRS-0001 → 441001)
  const codeMatch = thirdParty.code.match(/\d+$/);
  const suffix = codeMatch ? codeMatch[0].padStart(3, '0').slice(-3) : '000';
  return `441${suffix}`;
}

/**
 * Get bank/cash account based on payment method
 */
export function getBankAccountCode(paymentMethod: PaymentMethod, bankAccount?: string): string {
  if (bankAccount) return bankAccount;

  switch (paymentMethod) {
    case 'CASH':
      return DEFAULT_ACCOUNT_CODES.CASH;
    case 'CHECK':
    case 'BANK_TRANSFER':
    case 'CARD':
    case 'DIRECT_DEBIT':
    case 'MOBILE_PAYMENT':
      return DEFAULT_ACCOUNT_CODES.BANK;
    default:
      return DEFAULT_ACCOUNT_CODES.BANK;
  }
}

/**
 * Get sales account code based on invoice line
 */
export function getSalesAccountCode(line: { accountCode?: string }): string {
  if (line.accountCode) return line.accountCode;
  return DEFAULT_ACCOUNT_CODES.SALES_GOODS;
}

/**
 * Get purchase account code based on invoice line
 */
export function getPurchaseAccountCode(line: { accountCode?: string }): string {
  if (line.accountCode) return line.accountCode;
  return DEFAULT_ACCOUNT_CODES.PURCHASES_GOODS;
}

// ============================================================================
// JOURNAL ENTRY GENERATION
// ============================================================================

/**
 * Generate journal entry from a sales invoice
 *
 * Accounting logic for sales invoice:
 * - Debit: Customer account (411xxx) - Total TTC
 * - Credit: Sales account (711xxx/714xxx) - Total HT
 * - Credit: VAT collected (4455) - Total VAT
 */
export function generateInvoiceJournalEntry(
  invoice: Invoice,
  thirdParty: ThirdParty,
  salesJournal: Journal,
  currentPeriod: AccountingPeriod,
  currentUserId: string
): Entry {
  const lines: EntryLine[] = [];

  const customerAccountCode = getCustomerAccountCode(thirdParty);

  // Debit: Customer account with total TTC
  lines.push({
    id: crypto.randomUUID(),
    accountId: customerAccountCode,
    label: `Facture ${invoice.number} - ${thirdParty.name}`,
    debit: invoice.totalTTC,
    credit: 0,
    currency: invoice.currency,
    exchangeRate: invoice.exchangeRate || 1,
    debitMAD: invoice.totalTTC * (invoice.exchangeRate || 1),
    creditMAD: 0,
    auxiliaryAccount: thirdParty.id,
  });

  // Credit: Sales accounts by line (HT after all discounts)
  invoice.lines.forEach((line) => {
    const salesAccountCode = getSalesAccountCode(line);
    const lineAmountHT = line.subtotal * (1 - (invoice.globalDiscountRate || 0) / 100);

    lines.push({
      id: crypto.randomUUID(),
      accountId: salesAccountCode,
      label: line.description,
      debit: 0,
      credit: lineAmountHT,
      currency: invoice.currency,
      exchangeRate: invoice.exchangeRate || 1,
      debitMAD: 0,
      creditMAD: lineAmountHT * (invoice.exchangeRate || 1),
    });
  });

  // Credit: VAT collected by rate
  invoice.vatBreakdown.forEach((vat) => {
    if (vat.amount > 0) {
      lines.push({
        id: crypto.randomUUID(),
        accountId: DEFAULT_ACCOUNT_CODES.VAT_COLLECTED,
        label: `TVA ${vat.rate}% - Facture ${invoice.number}`,
        debit: 0,
        credit: vat.amount,
        currency: invoice.currency,
        exchangeRate: invoice.exchangeRate || 1,
        debitMAD: 0,
        creditMAD: vat.amount * (invoice.exchangeRate || 1),
      });
    }
  });

  // Calculate totals
  const totalDebit = lines.reduce((sum, line) => sum + line.debitMAD, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.creditMAD, 0);

  const entry: Entry = {
    id: crypto.randomUUID(),
    entryNumber: '', // Will be generated by accounting store
    journalId: salesJournal.id,
    journal: salesJournal,
    date: invoice.issueDate,
    periodId: currentPeriod.id,
    reference: invoice.number,
    description: `Facture de vente ${invoice.number} - ${thirdParty.name}`,
    lines,
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    isValidated: false,
    isLocked: false,
    attachments: [],
    createdBy: currentUserId,
    createdAt: new Date(),
    auditLog: [
      {
        id: crypto.randomUUID(),
        action: 'CREATE',
        userId: currentUserId,
        timestamp: new Date(),
        details: {
          source: 'invoice',
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
        },
      },
    ],
  };

  return entry;
}

/**
 * Generate journal entry from a credit note
 *
 * Credit notes reverse the original invoice entries:
 * - Credit: Customer account (411xxx)
 * - Debit: Sales return account (7119)
 * - Debit: VAT collected (4455) with negative amount
 */
export function generateCreditNoteJournalEntry(
  creditNote: Invoice,
  thirdParty: ThirdParty,
  salesJournal: Journal,
  currentPeriod: AccountingPeriod,
  currentUserId: string
): Entry {
  const lines: EntryLine[] = [];

  const customerAccountCode = getCustomerAccountCode(thirdParty);

  // Credit: Customer account (reverse of invoice)
  lines.push({
    id: crypto.randomUUID(),
    accountId: customerAccountCode,
    label: `Avoir ${creditNote.number} - ${thirdParty.name}`,
    debit: 0,
    credit: Math.abs(creditNote.totalTTC),
    currency: creditNote.currency,
    exchangeRate: creditNote.exchangeRate || 1,
    debitMAD: 0,
    creditMAD: Math.abs(creditNote.totalTTC) * (creditNote.exchangeRate || 1),
    auxiliaryAccount: thirdParty.id,
  });

  // Debit: Sales return accounts
  creditNote.lines.forEach((line) => {
    const lineAmountHT = Math.abs(line.subtotal) * (1 - (creditNote.globalDiscountRate || 0) / 100);

    lines.push({
      id: crypto.randomUUID(),
      accountId: DEFAULT_ACCOUNT_CODES.SALES_CREDIT_NOTES,
      label: line.description,
      debit: lineAmountHT,
      credit: 0,
      currency: creditNote.currency,
      exchangeRate: creditNote.exchangeRate || 1,
      debitMAD: lineAmountHT * (creditNote.exchangeRate || 1),
      creditMAD: 0,
    });
  });

  // Debit: VAT collected (reverse)
  creditNote.vatBreakdown.forEach((vat) => {
    if (vat.amount !== 0) {
      const vatAmount = Math.abs(vat.amount);
      lines.push({
        id: crypto.randomUUID(),
        accountId: DEFAULT_ACCOUNT_CODES.VAT_COLLECTED,
        label: `TVA ${vat.rate}% - Avoir ${creditNote.number}`,
        debit: vatAmount,
        credit: 0,
        currency: creditNote.currency,
        exchangeRate: creditNote.exchangeRate || 1,
        debitMAD: vatAmount * (creditNote.exchangeRate || 1),
        creditMAD: 0,
      });
    }
  });

  const totalDebit = lines.reduce((sum, line) => sum + line.debitMAD, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.creditMAD, 0);

  const entry: Entry = {
    id: crypto.randomUUID(),
    entryNumber: '',
    journalId: salesJournal.id,
    journal: salesJournal,
    date: creditNote.issueDate,
    periodId: currentPeriod.id,
    reference: creditNote.number,
    description: `Avoir sur vente ${creditNote.number} - ${thirdParty.name}`,
    lines,
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    isValidated: false,
    isLocked: false,
    attachments: [],
    createdBy: currentUserId,
    createdAt: new Date(),
    auditLog: [
      {
        id: crypto.randomUUID(),
        action: 'CREATE',
        userId: currentUserId,
        timestamp: new Date(),
        details: {
          source: 'credit_note',
          invoiceId: creditNote.id,
          invoiceNumber: creditNote.number,
        },
      },
    ],
  };

  return entry;
}

/**
 * Generate journal entry from a purchase invoice
 *
 * Accounting logic for purchase invoice:
 * - Debit: Purchase account (611xxx/614xxx) - Total HT
 * - Debit: VAT deductible (3455) - Total VAT
 * - Credit: Supplier account (441xxx) - Total TTC
 */
export function generatePurchaseInvoiceJournalEntry(
  invoice: Invoice,
  thirdParty: ThirdParty,
  purchaseJournal: Journal,
  currentPeriod: AccountingPeriod,
  currentUserId: string
): Entry {
  const lines: EntryLine[] = [];

  const supplierAccountCode = getSupplierAccountCode(thirdParty);

  // Debit: Purchase accounts by line
  invoice.lines.forEach((line) => {
    const purchaseAccountCode = getPurchaseAccountCode(line);
    const lineAmountHT = line.subtotal * (1 - (invoice.globalDiscountRate || 0) / 100);

    lines.push({
      id: crypto.randomUUID(),
      accountId: purchaseAccountCode,
      label: line.description,
      debit: lineAmountHT,
      credit: 0,
      currency: invoice.currency,
      exchangeRate: invoice.exchangeRate || 1,
      debitMAD: lineAmountHT * (invoice.exchangeRate || 1),
      creditMAD: 0,
    });
  });

  // Debit: VAT deductible by rate
  invoice.vatBreakdown.forEach((vat) => {
    if (vat.amount > 0) {
      lines.push({
        id: crypto.randomUUID(),
        accountId: DEFAULT_ACCOUNT_CODES.VAT_DEDUCTIBLE,
        label: `TVA déductible ${vat.rate}% - Facture ${invoice.number}`,
        debit: vat.amount,
        credit: 0,
        currency: invoice.currency,
        exchangeRate: invoice.exchangeRate || 1,
        debitMAD: vat.amount * (invoice.exchangeRate || 1),
        creditMAD: 0,
      });
    }
  });

  // Credit: Supplier account with total TTC
  lines.push({
    id: crypto.randomUUID(),
    accountId: supplierAccountCode,
    label: `Facture ${invoice.reference || invoice.number} - ${thirdParty.name}`,
    debit: 0,
    credit: invoice.totalTTC,
    currency: invoice.currency,
    exchangeRate: invoice.exchangeRate || 1,
    debitMAD: 0,
    creditMAD: invoice.totalTTC * (invoice.exchangeRate || 1),
    auxiliaryAccount: thirdParty.id,
  });

  const totalDebit = lines.reduce((sum, line) => sum + line.debitMAD, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.creditMAD, 0);

  const entry: Entry = {
    id: crypto.randomUUID(),
    entryNumber: '',
    journalId: purchaseJournal.id,
    journal: purchaseJournal,
    date: invoice.issueDate,
    periodId: currentPeriod.id,
    reference: invoice.reference || invoice.number,
    description: `Facture d'achat ${invoice.reference || invoice.number} - ${thirdParty.name}`,
    lines,
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    isValidated: false,
    isLocked: false,
    attachments: [],
    createdBy: currentUserId,
    createdAt: new Date(),
    auditLog: [
      {
        id: crypto.randomUUID(),
        action: 'CREATE',
        userId: currentUserId,
        timestamp: new Date(),
        details: {
          source: 'purchase_invoice',
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
        },
      },
    ],
  };

  return entry;
}

/**
 * Generate journal entry from a payment (customer payment - lettrage)
 *
 * Accounting logic for customer payment:
 * - Debit: Bank/Cash account (512xxx/516xxx)
 * - Credit: Customer account (411xxx) - This creates the "lettrage" (matching)
 */
export function generatePaymentJournalEntry(
  payment: Payment,
  invoice: Invoice,
  thirdParty: ThirdParty,
  bankJournal: Journal,
  currentPeriod: AccountingPeriod,
  currentUserId: string
): Entry {
  const lines: EntryLine[] = [];

  const bankAccountCode = getBankAccountCode(payment.method, payment.bankAccount);
  const customerAccountCode = getCustomerAccountCode(thirdParty);

  // Debit: Bank or Cash account
  lines.push({
    id: crypto.randomUUID(),
    accountId: bankAccountCode,
    label: `Règlement ${invoice.number} - ${thirdParty.name}`,
    debit: payment.amount,
    credit: 0,
    currency: payment.currency,
    exchangeRate: invoice.exchangeRate || 1,
    debitMAD: payment.amount * (invoice.exchangeRate || 1),
    creditMAD: 0,
  });

  // Credit: Customer account (lettrage - links to invoice)
  lines.push({
    id: crypto.randomUUID(),
    accountId: customerAccountCode,
    label: `Règlement ${invoice.number} - ${getPaymentMethodLabel(payment.method)}${payment.reference ? ' - ' + payment.reference : ''}`,
    debit: 0,
    credit: payment.amount,
    currency: payment.currency,
    exchangeRate: invoice.exchangeRate || 1,
    debitMAD: 0,
    creditMAD: payment.amount * (invoice.exchangeRate || 1),
    auxiliaryAccount: thirdParty.id,
  });

  const totalDebit = lines.reduce((sum, line) => sum + line.debitMAD, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.creditMAD, 0);

  const entry: Entry = {
    id: crypto.randomUUID(),
    entryNumber: '',
    journalId: bankJournal.id,
    journal: bankJournal,
    date: payment.date,
    periodId: currentPeriod.id,
    reference: payment.reference || invoice.number,
    description: `Règlement ${getPaymentMethodLabel(payment.method)} - ${invoice.number} - ${thirdParty.name}`,
    lines,
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    isValidated: false,
    isLocked: false,
    attachments: [],
    createdBy: currentUserId,
    createdAt: new Date(),
    auditLog: [
      {
        id: crypto.randomUUID(),
        action: 'CREATE',
        userId: currentUserId,
        timestamp: new Date(),
        details: {
          source: 'payment',
          paymentId: payment.id,
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          paymentMethod: payment.method,
        },
      },
    ],
  };

  return entry;
}

/**
 * Generate journal entry from a supplier payment
 *
 * Accounting logic for supplier payment:
 * - Debit: Supplier account (441xxx)
 * - Credit: Bank/Cash account (512xxx/516xxx)
 */
export function generateSupplierPaymentJournalEntry(
  payment: Payment,
  invoice: Invoice,
  thirdParty: ThirdParty,
  bankJournal: Journal,
  currentPeriod: AccountingPeriod,
  currentUserId: string
): Entry {
  const lines: EntryLine[] = [];

  const bankAccountCode = getBankAccountCode(payment.method, payment.bankAccount);
  const supplierAccountCode = getSupplierAccountCode(thirdParty);

  // Debit: Supplier account
  lines.push({
    id: crypto.randomUUID(),
    accountId: supplierAccountCode,
    label: `Paiement ${invoice.reference || invoice.number} - ${thirdParty.name}`,
    debit: payment.amount,
    credit: 0,
    currency: payment.currency,
    exchangeRate: invoice.exchangeRate || 1,
    debitMAD: payment.amount * (invoice.exchangeRate || 1),
    creditMAD: 0,
    auxiliaryAccount: thirdParty.id,
  });

  // Credit: Bank or Cash account
  lines.push({
    id: crypto.randomUUID(),
    accountId: bankAccountCode,
    label: `Paiement ${invoice.reference || invoice.number} - ${getPaymentMethodLabel(payment.method)}${payment.reference ? ' - ' + payment.reference : ''}`,
    debit: 0,
    credit: payment.amount,
    currency: payment.currency,
    exchangeRate: invoice.exchangeRate || 1,
    debitMAD: 0,
    creditMAD: payment.amount * (invoice.exchangeRate || 1),
  });

  const totalDebit = lines.reduce((sum, line) => sum + line.debitMAD, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.creditMAD, 0);

  const entry: Entry = {
    id: crypto.randomUUID(),
    entryNumber: '',
    journalId: bankJournal.id,
    journal: bankJournal,
    date: payment.date,
    periodId: currentPeriod.id,
    reference: payment.reference || invoice.reference || invoice.number,
    description: `Paiement fournisseur ${getPaymentMethodLabel(payment.method)} - ${invoice.reference || invoice.number} - ${thirdParty.name}`,
    lines,
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    isValidated: false,
    isLocked: false,
    attachments: [],
    createdBy: currentUserId,
    createdAt: new Date(),
    auditLog: [
      {
        id: crypto.randomUUID(),
        action: 'CREATE',
        userId: currentUserId,
        timestamp: new Date(),
        details: {
          source: 'supplier_payment',
          paymentId: payment.id,
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          paymentMethod: payment.method,
        },
      },
    ],
  };

  return entry;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get payment method label in French
 */
function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    CASH: 'Espèces',
    CHECK: 'Chèque',
    BANK_TRANSFER: 'Virement',
    CARD: 'Carte',
    DIRECT_DEBIT: 'Prélèvement',
    MOBILE_PAYMENT: 'Paiement mobile',
    OTHER: 'Autre',
  };

  return labels[method];
}

/**
 * Determine which journal to use based on invoice type
 */
export function getJournalForInvoiceType(
  invoiceType: InvoiceType,
  journals: Journal[]
): Journal | null {
  let journalCode: string;

  switch (invoiceType) {
    case 'INVOICE':
    case 'CREDIT_NOTE':
    case 'QUOTE':
    case 'PROFORMA':
    case 'DELIVERY_NOTE':
      journalCode = 'VTE'; // Sales journal
      break;
    case 'PURCHASE_INVOICE':
      journalCode = 'ACH'; // Purchase journal
      break;
    default:
      return null;
  }

  return journals.find(j => j.code === journalCode) || null;
}

/**
 * Get bank journal for payments
 */
export function getBankJournal(
  paymentMethod: PaymentMethod,
  journals: Journal[]
): Journal | null {
  const journalCode = paymentMethod === 'CASH' ? 'CAI' : 'BQ';
  return journals.find(j => j.code === journalCode) || null;
}

/**
 * Validate that a journal entry is balanced
 */
export function validateJournalEntry(entry: Entry): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if entry has lines
  if (!entry.lines || entry.lines.length === 0) {
    errors.push('L\'écriture doit contenir au moins une ligne');
  }

  // Check if entry is balanced
  if (!entry.isBalanced) {
    errors.push(`L\'écriture n'est pas équilibrée: Débit ${entry.totalDebit.toFixed(2)} ≠ Crédit ${entry.totalCredit.toFixed(2)}`);
  }

  // Check that at least one debit and one credit exist
  const hasDebit = entry.lines.some(line => line.debitMAD > 0);
  const hasCredit = entry.lines.some(line => line.creditMAD > 0);

  if (!hasDebit) {
    errors.push('L\'écriture doit contenir au moins une ligne au débit');
  }

  if (!hasCredit) {
    errors.push('L\'écriture doit contenir au moins une ligne au crédit');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
