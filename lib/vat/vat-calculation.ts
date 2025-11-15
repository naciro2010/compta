/**
 * Bibliothèque de calcul TVA
 * Fonctions utilitaires pour calculs TVA marocaine
 */

import type { VATRate, VATLine } from '@/types/vat';
import type { Invoice, InvoiceLine } from '@/types/invoicing';

// ============================================================================
// CALCUL TVA
// ============================================================================

/**
 * Calcule le montant de TVA à partir d'une base HT et d'un taux
 */
export function calculateVATAmount(baseAmount: number, rate: VATRate): number {
  return (baseAmount * rate) / 100;
}

/**
 * Calcule le montant TTC à partir d'un montant HT et d'un taux de TVA
 */
export function calculateTTCFromHT(htAmount: number, rate: VATRate): number {
  return htAmount + calculateVATAmount(htAmount, rate);
}

/**
 * Calcule le montant HT à partir d'un montant TTC et d'un taux de TVA
 */
export function calculateHTFromTTC(ttcAmount: number, rate: VATRate): number {
  return ttcAmount / (1 + rate / 100);
}

/**
 * Calcule la TVA déductible en fonction du taux de déduction
 */
export function calculateDeductibleVAT(
  vatAmount: number,
  deductionRate: number
): number {
  if (deductionRate < 0 || deductionRate > 100) {
    throw new Error('Taux de déduction invalide (doit être entre 0 et 100)');
  }
  return (vatAmount * deductionRate) / 100;
}

// ============================================================================
// BREAKDOWN TVA
// ============================================================================

/**
 * Calcule le breakdown de TVA par taux pour une facture
 */
export function calculateVATBreakdown(invoice: Invoice): {
  rate: VATRate;
  base: number;
  amount: number;
}[] {
  const breakdown = new Map<VATRate, { base: number; amount: number }>();

  invoice.lines.forEach((line) => {
    const rate = line.vatRate as VATRate;
    const existing = breakdown.get(rate) || { base: 0, amount: 0 };

    breakdown.set(rate, {
      base: existing.base + line.subtotal,
      amount: existing.amount + line.vatAmount,
    });
  });

  return Array.from(breakdown.entries())
    .map(([rate, values]) => ({
      rate,
      base: values.base,
      amount: values.amount,
    }))
    .sort((a, b) => b.rate - a.rate); // Tri décroissant par taux
}

/**
 * Calcule le breakdown pour une collection de lignes de TVA
 */
export function calculateVATLinesBreakdown(
  lines: VATLine[]
): Map<VATRate, { base: number; vat: number }> {
  const breakdown = new Map<VATRate, { base: number; vat: number }>();

  lines.forEach((line) => {
    const existing = breakdown.get(line.rate) || { base: 0, vat: 0 };

    breakdown.set(line.rate, {
      base: existing.base + line.baseAmount,
      vat: existing.vat + line.vatAmount,
    });
  });

  return breakdown;
}

// ============================================================================
// VALIDATION MONTANTS TVA
// ============================================================================

/**
 * Vérifie si le montant de TVA est cohérent avec la base et le taux
 */
export function isVATAmountValid(
  baseAmount: number,
  vatAmount: number,
  rate: VATRate,
  tolerance: number = 0.01
): boolean {
  const expectedVAT = calculateVATAmount(baseAmount, rate);
  const difference = Math.abs(expectedVAT - vatAmount);
  return difference <= tolerance;
}

/**
 * Vérifie si un breakdown de TVA est cohérent
 */
export function validateVATBreakdown(
  breakdown: { rate: VATRate; base: number; amount: number }[],
  tolerance: number = 0.01
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  breakdown.forEach((item) => {
    if (!isVATAmountValid(item.base, item.amount, item.rate, tolerance)) {
      const expected = calculateVATAmount(item.base, item.rate);
      errors.push(
        `TVA ${item.rate}%: montant incorrect (attendu: ${expected.toFixed(2)} MAD, reçu: ${item.amount.toFixed(2)} MAD)`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// RÉPARTITION TVA (pour comptabilité analytique)
// ============================================================================

/**
 * Répartit la TVA d'une facture sur plusieurs comptes analytiques
 */
export function allocateVATToAnalyticalAccounts(
  totalVAT: number,
  allocations: { accountCode: string; percentage: number }[]
): { accountCode: string; amount: number }[] {
  // Vérifier que les pourcentages totalisent 100%
  const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error(
      `Total des pourcentages doit être 100% (reçu: ${totalPercentage}%)`
    );
  }

  return allocations.map((allocation) => ({
    accountCode: allocation.accountCode,
    amount: (totalVAT * allocation.percentage) / 100,
  }));
}

// ============================================================================
// PRORATA DE DÉDUCTION
// ============================================================================

/**
 * Calcule le prorata de déduction TVA
 * Formule: (CA TTC taxable / CA TTC total) * 100
 */
export function calculateDeductionProrata(
  taxableTurnover: number,
  totalTurnover: number
): number {
  if (totalTurnover === 0) return 0;
  const prorata = (taxableTurnover / totalTurnover) * 100;
  return Math.min(100, Math.max(0, prorata)); // Limiter entre 0 et 100
}

/**
 * Applique le prorata de déduction à une liste de lignes TVA
 */
export function applyDeductionProrata(
  lines: VATLine[],
  prorata: number
): VATLine[] {
  return lines.map((line) => ({
    ...line,
    deductionRate: prorata,
    isDeductible: prorata > 0,
  }));
}

// ============================================================================
// RÉGIMES SPÉCIAUX
// ============================================================================

/**
 * Calcule la TVA en régime d'autoliquidation
 * (Cas où le client doit calculer et payer la TVA)
 */
export function calculateSelfAssessedVAT(
  baseAmount: number,
  rate: VATRate
): {
  baseAmount: number;
  vatAmount: number;
  isSelfAssessed: true;
  note: string;
} {
  return {
    baseAmount,
    vatAmount: calculateVATAmount(baseAmount, rate),
    isSelfAssessed: true,
    note: 'TVA due par le preneur (autoliquidation)',
  };
}

/**
 * Vérifie si une opération est éligible à l'exonération de TVA
 */
export function isExemptFromVAT(
  operationType: string,
  thirdPartyType: 'LOCAL' | 'EXPORT' | 'IMPORT'
): { exempt: boolean; reason?: string; article?: string } {
  // Exports
  if (thirdPartyType === 'EXPORT') {
    return {
      exempt: true,
      reason: 'Exportation de biens',
      article: 'Art. 92-I-1 du CGI',
    };
  }

  // À compléter selon les cas d'exonération du CGI marocain
  return { exempt: false };
}

// ============================================================================
// CONVERSION DEVISES (avec impact TVA)
// ============================================================================

/**
 * Calcule la TVA sur une transaction en devise étrangère
 */
export function calculateVATForForeignCurrency(
  amountForeignCurrency: number,
  exchangeRate: number,
  vatRate: VATRate
): {
  amountMAD: number;
  vatAmountMAD: number;
  totalMAD: number;
} {
  const amountMAD = amountForeignCurrency * exchangeRate;
  const vatAmountMAD = calculateVATAmount(amountMAD, vatRate);
  const totalMAD = amountMAD + vatAmountMAD;

  return {
    amountMAD,
    vatAmountMAD,
    totalMAD,
  };
}

// ============================================================================
// STATISTIQUES TVA
// ============================================================================

/**
 * Calcule la charge fiscale (TVA collectée / CA HT)
 */
export function calculateVATBurdenRate(
  collectedVAT: number,
  salesHT: number
): number {
  if (salesHT === 0) return 0;
  return (collectedVAT / salesHT) * 100;
}

/**
 * Calcule le taux de récupération de TVA (TVA déductible / TVA sur achats)
 */
export function calculateVATRecoveryRate(
  deductibleVAT: number,
  totalPurchaseVAT: number
): number {
  if (totalPurchaseVAT === 0) return 0;
  return (deductibleVAT / totalPurchaseVAT) * 100;
}

/**
 * Résumé TVA pour une période
 */
export interface VATPeriodSummary {
  period: { start: Date; end: Date };
  collected: {
    byRate: Map<VATRate, { base: number; vat: number }>;
    total: number;
  };
  deductible: {
    byRate: Map<VATRate, { base: number; vat: number }>;
    total: number;
  };
  net: number;
  vatToPay: number;
  previousCredit?: number;
  newCredit?: number;
}

/**
 * Génère un résumé TVA pour une période
 */
export function generateVATPeriodSummary(
  lines: VATLine[],
  startDate: Date,
  endDate: Date,
  previousCredit: number = 0
): VATPeriodSummary {
  const periodLines = lines.filter((line) => {
    const lineDate = line.documentDate.getTime();
    return lineDate >= startDate.getTime() && lineDate <= endDate.getTime();
  });

  const collectedLines = periodLines.filter((l) => l.type === 'COLLECTED');
  const deductibleLines = periodLines.filter((l) => l.type === 'DEDUCTIBLE');

  const collectedByRate = calculateVATLinesBreakdown(collectedLines);
  const deductibleByRate = calculateVATLinesBreakdown(deductibleLines);

  const totalCollected = Array.from(collectedByRate.values()).reduce(
    (sum, item) => sum + item.vat,
    0
  );

  const totalDeductible = Array.from(deductibleByRate.values()).reduce(
    (sum, item) => sum + item.vat,
    0
  );

  const net = totalCollected - totalDeductible;
  const vatToPay = net - previousCredit;

  return {
    period: { start: startDate, end: endDate },
    collected: {
      byRate: collectedByRate,
      total: totalCollected,
    },
    deductible: {
      byRate: deductibleByRate,
      total: totalDeductible,
    },
    net,
    vatToPay,
    previousCredit: previousCredit > 0 ? previousCredit : undefined,
    newCredit: vatToPay < 0 ? Math.abs(vatToPay) : undefined,
  };
}

// ============================================================================
// FORMATAGE
// ============================================================================

/**
 * Formate un montant de TVA avec la devise
 */
export function formatVATAmount(amount: number, currency: string = 'MAD'): string {
  return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Formate un taux de TVA
 */
export function formatVATRate(rate: VATRate): string {
  return rate === 0 ? 'Exonéré' : `${rate}%`;
}

/**
 * Formate un breakdown de TVA en texte
 */
export function formatVATBreakdown(
  breakdown: { rate: VATRate; base: number; amount: number }[]
): string {
  return breakdown
    .map(
      (item) =>
        `${formatVATRate(item.rate)}: Base ${formatVATAmount(item.base)}, TVA ${formatVATAmount(item.amount)}`
    )
    .join('\n');
}
