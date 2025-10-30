/**
 * Types pour le module de Facturation & Gestion Tiers
 * EPIC Facturation - Story F.1
 */

// ============================================================================
// TIERS (Clients & Fournisseurs)
// ============================================================================

export type ThirdPartyType = 'CLIENT' | 'SUPPLIER' | 'BOTH';

export type PaymentTerms = 'IMMEDIATE' | 'NET_30' | 'NET_60' | 'NET_90' | 'CUSTOM';

export interface ThirdParty {
  id: string;
  type: ThirdPartyType;
  code: string;                    // Code unique (ex: CLI-001, FRS-001)

  // Informations principales
  name: string;                    // Raison sociale
  commercialName?: string;         // Nom commercial

  // Identifiants légaux marocains
  ice?: string;                    // ICE (15 chiffres) - obligatoire pour B2B
  if?: string;                     // Identifiant Fiscal
  rc?: string;                     // Registre de Commerce
  cnss?: string;                   // CNSS
  patente?: string;                // Patente

  // Coordonnées
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;                 // Défaut: "Maroc"
  phone?: string;
  mobile?: string;
  email?: string;
  website?: string;

  // Contact principal
  contactName?: string;
  contactTitle?: string;           // Fonction
  contactPhone?: string;
  contactEmail?: string;

  // Paramètres commerciaux (pour clients)
  paymentTerms: PaymentTerms;      // Conditions de paiement
  customPaymentDays?: number;      // Si CUSTOM
  creditLimit?: number;            // Limite d'encours (MAD)
  discountRate?: number;           // Remise par défaut (%)

  // Paramètres fiscaux
  vatRegime: 'STANDARD' | 'EXEMPT' | 'INTRACOMMUNITY' | 'EXPORT';
  vatRate?: number;                // Taux TVA par défaut
  currency: string;                // Devise (MAD par défaut)

  // Paramètres comptables
  customerAccountCode?: string;    // Compte client (411xxx)
  supplierAccountCode?: string;    // Compte fournisseur (441xxx)

  // Statut
  isActive: boolean;
  tags?: string[];                 // Tags/catégories
  notes?: string;                  // Notes internes

  // Statistiques (calculées)
  totalSales?: number;             // CA total client
  totalPurchases?: number;         // Total achats fournisseur
  outstandingBalance?: number;     // Solde dû
  lastTransactionDate?: Date;

  // Audit
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

// ============================================================================
// FACTURES & DEVIS
// ============================================================================

export type InvoiceType =
  | 'INVOICE'          // Facture
  | 'CREDIT_NOTE'      // Avoir
  | 'PROFORMA'         // Facture pro-forma
  | 'QUOTE'            // Devis
  | 'PURCHASE_INVOICE' // Facture d'achat
  | 'DELIVERY_NOTE';   // Bon de livraison

export type InvoiceStatus =
  | 'DRAFT'            // Brouillon
  | 'SENT'             // Envoyée
  | 'VIEWED'           // Vue par le client
  | 'PARTIALLY_PAID'   // Partiellement payée
  | 'PAID'             // Payée
  | 'OVERDUE'          // En retard
  | 'CANCELLED'        // Annulée
  | 'CONVERTED';       // Convertie (devis → facture)

export type PaymentMethod =
  | 'CASH'             // Espèces
  | 'CHECK'            // Chèque
  | 'BANK_TRANSFER'    // Virement bancaire
  | 'CARD'             // Carte bancaire
  | 'DIRECT_DEBIT'     // Prélèvement
  | 'MOBILE_PAYMENT'   // Paiement mobile (ex: CMI)
  | 'OTHER';           // Autre

export interface InvoiceLine {
  id: string;

  // Produit/Service
  description: string;             // Description de la ligne
  quantity: number;
  unitPrice: number;               // Prix unitaire HT

  // Remises
  discountRate?: number;           // Taux de remise (%)
  discountAmount?: number;         // Montant remise

  // TVA
  vatRate: number;                 // Taux de TVA (20, 14, 10, 7, 0)
  vatAmount: number;               // Montant TVA (calculé)

  // Totaux
  subtotal: number;                // Sous-total HT (après remise)
  total: number;                   // Total TTC

  // Comptabilité
  accountCode?: string;            // Compte de produit/charge

  // Référence
  productCode?: string;            // Code article/service
  unit?: string;                   // Unité (pièce, heure, kg, etc.)

  // Ordre
  order: number;                   // Ordre d'affichage
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  status: InvoiceStatus;

  // Numérotation
  number: string;                  // Numéro de facture (FA-2025-00001)
  reference?: string;              // Référence client/commande

  // Dates
  issueDate: Date;                 // Date d'émission
  dueDate?: Date;                  // Date d'échéance
  deliveryDate?: Date;             // Date de livraison

  // Parties
  companyId: string;               // Société émettrice
  thirdPartyId: string;            // Client ou fournisseur
  thirdParty?: ThirdParty;         // Données tiers (dénormalisé)

  // Lignes
  lines: InvoiceLine[];

  // Totaux
  subtotalHT: number;              // Sous-total HT (avant remise globale)
  globalDiscountRate?: number;     // Remise globale (%)
  globalDiscountAmount?: number;   // Montant remise globale
  totalHT: number;                 // Total HT (après remises)
  totalVAT: number;                // Total TVA
  totalTTC: number;                // Total TTC

  // TVA détaillée par taux
  vatBreakdown: {
    rate: number;
    base: number;                  // Base HT
    amount: number;                // Montant TVA
  }[];

  // Paiement
  paymentTerms: PaymentTerms;
  paymentMethod?: PaymentMethod;
  currency: string;                // Devise (MAD)
  exchangeRate?: number;           // Taux de change si devise étrangère

  // Paiements reçus/effectués
  payments: Payment[];
  amountPaid: number;              // Montant payé
  amountDue: number;               // Montant restant dû

  // Documents
  attachments?: string[];          // URLs des pièces jointes
  pdfUrl?: string;                 // URL du PDF généré

  // Notes
  publicNotes?: string;            // Notes visibles sur la facture
  privateNotes?: string;           // Notes internes

  // Relations
  parentInvoiceId?: string;        // Facture parent (ex: devis → facture)
  creditNoteIds?: string[];        // Avoirs associés
  relatedJournalEntryId?: string;  // Écriture comptable générée

  // Workflow
  sentAt?: Date;
  sentBy?: string;
  viewedAt?: Date;
  paidAt?: Date;

  // Rappels/Relances
  reminders: InvoiceReminder[];
  lastReminderSent?: Date;

  // Audit
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
}

// ============================================================================
// PAIEMENTS
// ============================================================================

export interface Payment {
  id: string;
  invoiceId: string;

  // Montant
  amount: number;
  currency: string;

  // Méthode
  method: PaymentMethod;

  // Dates
  date: Date;                      // Date du paiement
  valueDate?: Date;                // Date de valeur

  // Références
  reference?: string;              // Numéro de chèque, référence virement
  bankAccount?: string;            // Compte bancaire utilisé

  // Comptabilité
  journalEntryId?: string;         // Écriture comptable générée

  // Notes
  notes?: string;

  // Audit
  createdAt: Date;
  createdBy: string;
}

// ============================================================================
// RELANCES
// ============================================================================

export type ReminderType = 'AUTOMATIC' | 'MANUAL';

export type ReminderLevel = 'FIRST' | 'SECOND' | 'THIRD' | 'FINAL';

export interface InvoiceReminder {
  id: string;
  invoiceId: string;

  type: ReminderType;
  level?: ReminderLevel;           // Niveau de relance

  // Contenu
  subject: string;
  message: string;

  // Envoi
  sentAt: Date;
  sentBy?: string;                 // Si manuel
  sentTo: string[];                // Liste emails

  // Statistiques
  daysOverdue: number;             // Nombre de jours de retard au moment de l'envoi

  // Statut
  opened?: boolean;
  openedAt?: Date;
}

export interface ReminderTemplate {
  id: string;
  name: string;
  level: ReminderLevel;

  // Contenu
  subject: string;                 // Template avec variables: {invoice_number}, {customer_name}, etc.
  message: string;                 // Message avec variables

  // Timing
  daysOverdue: number;             // Envoyer après X jours de retard

  // Active
  isActive: boolean;
  isDefault: boolean;

  createdAt: Date;
  updatedAt?: Date;
}

export interface OverdueInvoiceSummary {
  total: number;
  totalAmount: number;

  // Par niveau de sévérité
  recent: {                        // < 30 jours
    count: number;
    amount: number;
  };
  moderate: {                      // 30-60 jours
    count: number;
    amount: number;
  };
  severe: {                        // > 60 jours
    count: number;
    amount: number;
  };
}

// ============================================================================
// CONFIGURATION NUMÉROTATION
// ============================================================================

export interface InvoiceNumberingConfig {
  id: string;
  companyId: string;
  type: InvoiceType;

  // Format: {prefix}-{year}-{counter}
  prefix: string;                  // Ex: FA, AV, DEV, BL
  includeYear: boolean;            // Inclure l'année
  counterDigits: number;           // Nombre de chiffres (ex: 5 → 00001)
  separator: string;               // Séparateur (-, _, /)

  // Compteur
  currentCounter: number;          // Compteur actuel
  resetOnNewYear: boolean;         // Réinitialiser chaque année

  // Exemple: FA-2025-00001
}

// ============================================================================
// TEMPLATES & CONFIGURATION
// ============================================================================

export interface InvoiceTemplate {
  id: string;
  name: string;
  companyId: string;

  // Design
  primaryColor: string;
  secondaryColor: string;
  logo?: string;                   // URL logo

  // Sections
  showLogo: boolean;
  showCompanyInfo: boolean;
  showPaymentTerms: boolean;
  showBankDetails: boolean;

  // Mentions légales
  legalMentions?: string;          // Mentions légales bas de page

  // Langue
  language: 'fr' | 'ar' | 'en';

  // Par défaut
  isDefault: boolean;

  createdAt: Date;
  updatedAt?: Date;
}

// ============================================================================
// STATISTIQUES & RAPPORTS
// ============================================================================

export interface InvoicingStats {
  period: {
    start: Date;
    end: Date;
  };

  // Factures
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalOutstanding: number;

  // Par statut
  byStatus: Record<InvoiceStatus, {
    count: number;
    amount: number;
  }>;

  // Délais de paiement
  averagePaymentDelay: number;     // Jours
  overdueCount: number;
  overdueAmount: number;

  // Top clients
  topCustomers: {
    thirdPartyId: string;
    name: string;
    totalAmount: number;
    invoiceCount: number;
  }[];
}

// ============================================================================
// EXPORTS & UTILITAIRES
// ============================================================================

export interface InvoiceExportOptions {
  format: 'PDF' | 'CSV' | 'XLSX' | 'XML';
  includePayments: boolean;
  includeDetails: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: InvoiceStatus[];
  thirdPartyIds?: string[];
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface InvoiceValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}
