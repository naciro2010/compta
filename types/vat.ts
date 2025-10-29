/**
 * Types pour l'EPIC TVA (Taxe sur la Valeur Ajoutée)
 * Gestion de la TVA marocaine selon le Code Général des Impôts
 */

// ============================================================================
// RÉGIMES ET TAUX TVA
// ============================================================================

// Taux de TVA au Maroc
export type VATRate = 0 | 7 | 10 | 14 | 20;

export const VAT_RATES: VATRate[] = [0, 7, 10, 14, 20];

export const VAT_RATE_LABELS: Record<VATRate, string> = {
  0: 'Exonéré (0%)',
  7: 'Taux super-réduit (7%)',
  10: 'Taux réduit (10%)',
  14: 'Taux intermédiaire (14%)',
  20: 'Taux normal (20%)',
};

// Régime de TVA
export type VATRegime =
  | 'STANDARD'              // Régime standard (déclaration mensuelle)
  | 'QUARTERLY'             // Régime trimestriel (CA < 1M MAD)
  | 'EXEMPT'                // Exonéré
  | 'AUTO_ENTREPRENEUR';    // Auto-entrepreneur

// Type de TVA
export type VATType =
  | 'COLLECTED'             // TVA collectée (sur ventes)
  | 'DEDUCTIBLE';           // TVA déductible (sur achats)

// Période de déclaration
export type VATDeclarationPeriod = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

// ============================================================================
// LIGNE DE TVA
// ============================================================================

export interface VATLine {
  id: string;

  // Type et taux
  type: VATType;                      // Collectée ou déductible
  rate: VATRate;                      // Taux de TVA (0, 7, 10, 14, 20)

  // Montants
  baseAmount: number;                 // Base HT (MAD)
  vatAmount: number;                  // Montant TVA (MAD)
  totalAmount: number;                // Total TTC (MAD)

  // Origine
  documentType: 'INVOICE' | 'PURCHASE' | 'EXPENSE' | 'ENTRY';
  documentId: string;                 // ID du document source
  documentNumber: string;             // Numéro de facture/pièce
  documentDate: Date;                 // Date du document

  // Tiers
  thirdPartyId?: string;
  thirdPartyName?: string;
  thirdPartyICE?: string;             // ICE du tiers (obligatoire pour déductions)

  // Comptabilité
  accountCode: string;                // Compte de TVA (445510, 345510, etc.)
  journalEntryId?: string;            // Référence à l'écriture comptable

  // Exonération
  isExempt: boolean;                  // Exonéré
  exemptionReason?: string;           // Motif d'exonération
  exemptionArticle?: string;          // Article CGI (ex: "Art. 91-I-A-1")

  // Autoliquidation
  isSelfAssessed: boolean;            // Autoliquidation (TVA due par le client)

  // Statut
  isDeductible: boolean;              // Déductible (pour TVA sur achats)
  deductionRate: number;              // Taux de déduction (0-100%)
  deductionReason?: string;           // Raison si déduction partielle

  // Période
  periodId: string;                   // Période comptable
  declarationId?: string;             // Déclaration TVA associée

  // Audit
  createdAt: Date;
  createdBy: string;
}

// ============================================================================
// DÉCLARATION TVA
// ============================================================================

export type VATDeclarationStatus =
  | 'DRAFT'                 // Brouillon
  | 'IN_PROGRESS'           // En cours de préparation
  | 'READY'                 // Prête à soumettre
  | 'SUBMITTED'             // Soumise
  | 'VALIDATED'             // Validée par DGI
  | 'REJECTED'              // Rejetée
  | 'PAID'                  // Payée
  | 'CANCELLED';            // Annulée

export interface VATDeclaration {
  id: string;

  // Période
  year: number;                       // Année fiscale
  month?: number;                     // Mois (1-12) si mensuel
  quarter?: number;                   // Trimestre (1-4) si trimestriel
  period: VATDeclarationPeriod;       // MONTHLY ou QUARTERLY
  startDate: Date;                    // Date début période
  endDate: Date;                      // Date fin période

  // Identification
  companyId: string;
  ice: string;                        // ICE de l'entreprise
  if: string;                         // IF (Identifiant Fiscal)
  vatNumber?: string;                 // Numéro de TVA

  // Statut
  status: VATDeclarationStatus;

  // === TVA COLLECTÉE ===
  vatCollectedLines: VATLine[];       // Lignes de TVA collectée

  // Totaux par taux
  collected20: { base: number; vat: number };
  collected14: { base: number; vat: number };
  collected10: { base: number; vat: number };
  collected7: { base: number; vat: number };
  collected0: { base: number; vat: number };

  totalCollectedBase: number;         // Total base HT
  totalCollectedVAT: number;          // Total TVA collectée

  // === TVA DÉDUCTIBLE ===
  vatDeductibleLines: VATLine[];      // Lignes de TVA déductible

  // Totaux par taux
  deductible20: { base: number; vat: number };
  deductible14: { base: number; vat: number };
  deductible10: { base: number; vat: number };
  deductible7: { base: number; vat: number };
  deductible0: { base: number; vat: number };

  totalDeductibleBase: number;        // Total base HT
  totalDeductibleVAT: number;         // Total TVA déductible

  // === CALCUL FINAL ===
  netVAT: number;                     // TVA nette (collectée - déductible)
  vatCredit?: number;                 // Crédit de TVA reporté de la période précédente
  vatToPay: number;                   // TVA à payer (peut être négatif = crédit)
  newVATCredit?: number;              // Nouveau crédit à reporter

  // === RÉGULARISATIONS ===
  adjustments: VATAdjustment[];       // Ajustements/régularisations
  totalAdjustments: number;

  // === RELEVÉ DE DÉDUCTIONS ===
  deductionStatementUrl?: string;     // URL du relevé PDF généré
  deductionStatementGenerated: boolean;

  // === EXPORT XML ===
  xmlExportUrl?: string;              // URL du fichier XML SIMPL-TVA
  xmlExported: boolean;
  xmlValidated: boolean;              // Validé contre le schéma XSD
  xmlValidationErrors?: string[];

  // === SOUMISSION ===
  submittedAt?: Date;
  submittedBy?: string;
  submissionReference?: string;       // Référence DGI
  dgiReceipt?: string;                // Accusé de réception DGI

  // === PAIEMENT ===
  paymentDate?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  paidAt?: Date;
  paidBy?: string;

  // === VALIDATION DGI ===
  validatedAt?: Date;
  validatedBy?: string;               // Agent DGI
  rejectionReason?: string;

  // === NOTES ===
  notes?: string;                     // Notes internes

  // === AUDIT ===
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  lockedAt?: Date;                    // Date de verrouillage
  lockedBy?: string;
}

// ============================================================================
// AJUSTEMENTS / RÉGULARISATIONS
// ============================================================================

export type VATAdjustmentType =
  | 'CORRECTION'            // Correction d'erreur
  | 'RECOVERY'              // Récupération TVA
  | 'REVERSAL'              // Reversement TVA
  | 'CREDIT_NOTE'           // Avoir
  | 'BAD_DEBT'              // Créance irrécouvrable
  | 'OTHER';                // Autre

export interface VATAdjustment {
  id: string;
  declarationId: string;

  type: VATAdjustmentType;
  description: string;

  // Montant (positif = augmentation TVA à payer, négatif = diminution)
  amount: number;

  // Justification
  reason: string;
  documentReference?: string;

  // Audit
  createdAt: Date;
  createdBy: string;
}

// ============================================================================
// RELEVÉ DE DÉDUCTIONS
// ============================================================================

export interface DeductionStatement {
  id: string;
  declarationId: string;

  // Période
  period: {
    year: number;
    month?: number;
    quarter?: number;
  };

  // Lignes de déduction
  lines: VATDeductionLine[];

  // Totaux
  totalBaseAmount: number;
  totalVATAmount: number;

  // Génération PDF
  pdfUrl?: string;
  generatedAt?: Date;
  generatedBy?: string;
}

export interface VATDeductionLine {
  id: string;
  order: number;                      // Ordre d'affichage

  // Fournisseur
  supplierName: string;
  supplierICE: string;                // ICE obligatoire
  supplierIF?: string;

  // Document
  invoiceNumber: string;
  invoiceDate: Date;

  // Montants
  baseAmount: number;                 // Base HT
  vatRate: VATRate;
  vatAmount: number;

  // Déductibilité
  deductionRate: number;              // % déductible (généralement 100%)
  deductibleAmount: number;           // Montant TVA déductible

  // Catégorie
  category: VATDeductionCategory;

  // Notes
  notes?: string;
}

export type VATDeductionCategory =
  | 'GOODS'                 // Biens
  | 'SERVICES'              // Services
  | 'FIXED_ASSETS'          // Immobilisations
  | 'OTHER';                // Autres

// ============================================================================
// EXPORT XML SIMPL-TVA
// ============================================================================

export interface SimplTVAExport {
  id: string;
  declarationId: string;

  // Format DGI
  xmlVersion: string;               // Version du schéma XML (ex: "2.0")

  // Contenu XML
  xmlContent: string;               // Contenu XML complet
  xsdValidated: boolean;            // Validé contre le schéma XSD
  validationErrors?: string[];

  // Fichier
  filename: string;                 // Ex: "TVA_ICE_202501.xml"
  fileSize: number;                 // Taille en octets
  fileUrl?: string;                 // URL du fichier

  // Génération
  generatedAt: Date;
  generatedBy: string;

  // Soumission
  submittedAt?: Date;
  submissionReference?: string;
  dgiStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  dgiResponse?: string;
}

// ============================================================================
// CONFIGURATION TVA
// ============================================================================

export interface VATConfiguration {
  id: string;
  companyId: string;

  // Régime
  regime: VATRegime;
  declarationPeriod: VATDeclarationPeriod;

  // Identification
  vatNumber?: string;               // Numéro de TVA

  // Taux par défaut
  defaultRate: VATRate;

  // Comptes comptables
  accounts: {
    vatCollected20: string;         // 445510 - TVA collectée 20%
    vatCollected14: string;         // 445520 - TVA collectée 14%
    vatCollected10: string;         // 445530 - TVA collectée 10%
    vatCollected7: string;          // 445540 - TVA collectée 7%

    vatDeductible20: string;        // 345510 - TVA déductible 20%
    vatDeductible14: string;        // 345520 - TVA déductible 14%
    vatDeductible10: string;        // 345530 - TVA déductible 10%
    vatDeductible7: string;         // 345540 - TVA déductible 7%

    vatToPay: string;               // 445000 - État - TVA à payer
    vatCredit: string;              // 345000 - État - Crédit de TVA
  };

  // Relevé de déductions
  deductionStatementTemplate?: string; // Template PDF

  // Export XML
  xmlExportEnabled: boolean;
  xmlVersion: string;               // Version du format SIMPL-TVA

  // Notifications
  notifyBeforeDeadline: boolean;
  notificationDays: number;         // Nombre de jours avant échéance
  notificationEmails: string[];

  // Audit
  createdAt: Date;
  updatedAt?: Date;
}

// ============================================================================
// STATISTIQUES & RAPPORTS
// ============================================================================

export interface VATStats {
  period: {
    start: Date;
    end: Date;
  };

  // Globaux
  totalCollected: number;
  totalDeductible: number;
  netVAT: number;

  // Par taux
  byRate: Record<VATRate, {
    collected: { base: number; vat: number };
    deductible: { base: number; vat: number };
    net: number;
  }>;

  // Évolution
  previousPeriodNet?: number;
  variation?: number;               // % variation vs période précédente

  // Déclarations
  declarationCount: number;
  totalPaid: number;
  totalCredit: number;
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface VATValidationResult {
  valid: boolean;
  errors: VATValidationError[];
  warnings: VATValidationWarning[];
}

export interface VATValidationError {
  code: string;
  message: string;
  field?: string;
  lineId?: string;
}

export interface VATValidationWarning {
  code: string;
  message: string;
  field?: string;
}

// Règles de validation
export const VAT_VALIDATION_RULES = {
  // TVA déductible requiert ICE fournisseur
  DEDUCTIBLE_REQUIRES_ICE: 'VAT_001',
  // Montant TVA incohérent avec base et taux
  INVALID_VAT_AMOUNT: 'VAT_002',
  // Taux de TVA invalide
  INVALID_VAT_RATE: 'VAT_003',
  // Taux de déduction invalide (doit être 0-100%)
  INVALID_DEDUCTION_RATE: 'VAT_004',
  // Document source manquant
  MISSING_SOURCE_DOCUMENT: 'VAT_005',
  // Date hors période
  DATE_OUT_OF_PERIOD: 'VAT_006',
  // TVA collectée négative
  NEGATIVE_COLLECTED_VAT: 'VAT_007',
  // Montant excessif
  EXCESSIVE_AMOUNT: 'VAT_008',
};
