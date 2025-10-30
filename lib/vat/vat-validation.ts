/**
 * Validation TVA
 * Règles de validation pour les déclarations TVA marocaines
 */

import type {
  VATLine,
  VATDeclaration,
  VATValidationResult,
  VATValidationError,
  VATValidationWarning,
  VAT_VALIDATION_RULES,
} from '@/types/vat';
import { isVATAmountValid } from './vat-calculation';

// ============================================================================
// VALIDATION LIGNES TVA
// ============================================================================

/**
 * Valide une ligne de TVA
 */
export function validateVATLine(line: VATLine): {
  valid: boolean;
  errors: VATValidationError[];
  warnings: VATValidationWarning[];
} {
  const errors: VATValidationError[] = [];
  const warnings: VATValidationWarning[] = [];

  // TVA_001: TVA déductible requiert ICE fournisseur
  if (line.type === 'DEDUCTIBLE' && line.isDeductible && !line.thirdPartyICE) {
    errors.push({
      code: 'VAT_001',
      message: `ICE fournisseur obligatoire pour TVA déductible (Document: ${line.documentNumber})`,
      lineId: line.id,
      field: 'thirdPartyICE',
    });
  }

  // TVA_002: Montant TVA incohérent avec base et taux
  if (!isVATAmountValid(line.baseAmount, line.vatAmount, line.rate)) {
    const expectedVAT = (line.baseAmount * line.rate) / 100;
    warnings.push({
      code: 'VAT_002',
      message: `Montant TVA incohérent. Attendu: ${expectedVAT.toFixed(2)} MAD, Reçu: ${line.vatAmount.toFixed(2)} MAD`,
      field: 'vatAmount',
    });
  }

  // TVA_003: Taux de TVA invalide
  const validRates = [0, 7, 10, 14, 20];
  if (!validRates.includes(line.rate)) {
    errors.push({
      code: 'VAT_003',
      message: `Taux de TVA invalide: ${line.rate}%. Taux valides: 0%, 7%, 10%, 14%, 20%`,
      lineId: line.id,
      field: 'rate',
    });
  }

  // TVA_004: Taux de déduction invalide
  if (line.deductionRate < 0 || line.deductionRate > 100) {
    errors.push({
      code: 'VAT_004',
      message: `Taux de déduction invalide: ${line.deductionRate}%. Doit être entre 0 et 100`,
      lineId: line.id,
      field: 'deductionRate',
    });
  }

  // TVA_005: Document source manquant
  if (!line.documentId || !line.documentNumber) {
    errors.push({
      code: 'VAT_005',
      message: 'Document source manquant',
      lineId: line.id,
      field: 'documentId',
    });
  }

  // TVA_007: TVA collectée négative
  if (line.type === 'COLLECTED' && line.vatAmount < 0) {
    errors.push({
      code: 'VAT_007',
      message: 'TVA collectée ne peut pas être négative',
      lineId: line.id,
      field: 'vatAmount',
    });
  }

  // TVA_008: Montant excessif (seuil d'alerte)
  const ALERT_THRESHOLD = 1000000; // 1M MAD
  if (line.baseAmount > ALERT_THRESHOLD) {
    warnings.push({
      code: 'VAT_008',
      message: `Montant élevé détecté: ${line.baseAmount.toFixed(2)} MAD. Vérifier la cohérence.`,
      field: 'baseAmount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valide une liste de lignes TVA
 */
export function validateVATLines(lines: VATLine[]): VATValidationResult {
  const allErrors: VATValidationError[] = [];
  const allWarnings: VATValidationWarning[] = [];

  lines.forEach((line) => {
    const validation = validateVATLine(line);
    allErrors.push(...validation.errors);
    allWarnings.push(...validation.warnings);
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// ============================================================================
// VALIDATION DÉCLARATION TVA
// ============================================================================

/**
 * Valide une déclaration TVA complète
 */
export function validateVATDeclaration(
  declaration: VATDeclaration
): VATValidationResult {
  const errors: VATValidationError[] = [];
  const warnings: VATValidationWarning[] = [];

  // === VALIDATION IDENTITÉ ===
  if (!declaration.ice || declaration.ice.length !== 15) {
    errors.push({
      code: 'DECL_001',
      message: 'ICE invalide (doit contenir 15 chiffres)',
      field: 'ice',
    });
  }

  if (!declaration.if) {
    errors.push({
      code: 'DECL_002',
      message: 'Identifiant Fiscal (IF) obligatoire',
      field: 'if',
    });
  }

  // === VALIDATION PÉRIODE ===
  if (declaration.period === 'MONTHLY' && !declaration.month) {
    errors.push({
      code: 'DECL_003',
      message: 'Mois obligatoire pour déclaration mensuelle',
      field: 'month',
    });
  }

  if (declaration.period === 'QUARTERLY' && !declaration.quarter) {
    errors.push({
      code: 'DECL_004',
      message: 'Trimestre obligatoire pour déclaration trimestrielle',
      field: 'quarter',
    });
  }

  if (declaration.month && (declaration.month < 1 || declaration.month > 12)) {
    errors.push({
      code: 'DECL_005',
      message: `Mois invalide: ${declaration.month}. Doit être entre 1 et 12`,
      field: 'month',
    });
  }

  if (declaration.quarter && (declaration.quarter < 1 || declaration.quarter > 4)) {
    errors.push({
      code: 'DECL_006',
      message: `Trimestre invalide: ${declaration.quarter}. Doit être entre 1 et 4`,
      field: 'quarter',
    });
  }

  // === VALIDATION LIGNES TVA ===
  const collectedValidation = validateVATLines(declaration.vatCollectedLines);
  const deductibleValidation = validateVATLines(declaration.vatDeductibleLines);

  errors.push(...collectedValidation.errors);
  errors.push(...deductibleValidation.errors);
  warnings.push(...collectedValidation.warnings);
  warnings.push(...deductibleValidation.warnings);

  // === VALIDATION COHÉRENCE TOTAUX ===
  const tolerance = 0.01;

  // Vérifier totaux TVA collectée
  const sumCollected =
    declaration.collected20.vat +
    declaration.collected14.vat +
    declaration.collected10.vat +
    declaration.collected7.vat +
    declaration.collected0.vat;

  if (Math.abs(sumCollected - declaration.totalCollectedVAT) > tolerance) {
    errors.push({
      code: 'DECL_007',
      message: `Incohérence total TVA collectée. Calculé: ${sumCollected.toFixed(2)}, Déclaré: ${declaration.totalCollectedVAT.toFixed(2)}`,
      field: 'totalCollectedVAT',
    });
  }

  // Vérifier totaux TVA déductible
  const sumDeductible =
    declaration.deductible20.vat +
    declaration.deductible14.vat +
    declaration.deductible10.vat +
    declaration.deductible7.vat +
    declaration.deductible0.vat;

  if (Math.abs(sumDeductible - declaration.totalDeductibleVAT) > tolerance) {
    errors.push({
      code: 'DECL_008',
      message: `Incohérence total TVA déductible. Calculé: ${sumDeductible.toFixed(2)}, Déclaré: ${declaration.totalDeductibleVAT.toFixed(2)}`,
      field: 'totalDeductibleVAT',
    });
  }

  // Vérifier TVA nette
  const expectedNetVAT =
    declaration.totalCollectedVAT -
    declaration.totalDeductibleVAT +
    declaration.totalAdjustments;

  if (Math.abs(expectedNetVAT - declaration.netVAT) > tolerance) {
    errors.push({
      code: 'DECL_009',
      message: `Incohérence TVA nette. Calculé: ${expectedNetVAT.toFixed(2)}, Déclaré: ${declaration.netVAT.toFixed(2)}`,
      field: 'netVAT',
    });
  }

  // === VALIDATION STATUT ===
  if (declaration.status === 'SUBMITTED' && !declaration.submittedAt) {
    errors.push({
      code: 'DECL_010',
      message: 'Date de soumission manquante',
      field: 'submittedAt',
    });
  }

  if (declaration.status === 'PAID' && !declaration.paidAt) {
    errors.push({
      code: 'DECL_011',
      message: 'Date de paiement manquante',
      field: 'paidAt',
    });
  }

  // === AVERTISSEMENTS ===

  // Aucune ligne TVA
  if (
    declaration.vatCollectedLines.length === 0 &&
    declaration.vatDeductibleLines.length === 0
  ) {
    warnings.push({
      code: 'DECL_W001',
      message: 'Aucune ligne de TVA dans la déclaration',
    });
  }

  // Crédit de TVA important
  if (declaration.vatToPay < -50000) {
    warnings.push({
      code: 'DECL_W002',
      message: `Crédit de TVA important: ${Math.abs(declaration.vatToPay).toFixed(2)} MAD`,
      field: 'vatToPay',
    });
  }

  // TVA à payer importante
  if (declaration.vatToPay > 100000) {
    warnings.push({
      code: 'DECL_W003',
      message: `TVA à payer importante: ${declaration.vatToPay.toFixed(2)} MAD`,
      field: 'vatToPay',
    });
  }

  // Ratio TVA déductible / collectée anormal
  if (
    declaration.totalCollectedVAT > 0 &&
    declaration.totalDeductibleVAT / declaration.totalCollectedVAT > 0.95
  ) {
    const ratio = (
      (declaration.totalDeductibleVAT / declaration.totalCollectedVAT) *
      100
    ).toFixed(1);
    warnings.push({
      code: 'DECL_W004',
      message: `Ratio TVA déductible/collectée élevé: ${ratio}%`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// VALIDATION ICE FOURNISSEUR
// ============================================================================

/**
 * Valide un numéro ICE (15 chiffres)
 */
export function validateICE(ice: string): {
  valid: boolean;
  formatted?: string;
  error?: string;
} {
  // Nettoyer l'ICE
  const cleaned = ice.replace(/\s+/g, '');

  // Vérifier format
  if (!/^\d{15}$/.test(cleaned)) {
    return {
      valid: false,
      error: 'ICE doit contenir exactement 15 chiffres',
    };
  }

  // Validation checksum (algorithme Luhn)
  const digits = cleaned.split('').map(Number);
  let sum = 0;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];

    // Doubler tous les chiffres pairs (en partant de la droite)
    if ((digits.length - i) % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
  }

  const isValid = sum % 10 === 0;

  if (!isValid) {
    return {
      valid: false,
      error: 'Checksum ICE invalide',
    };
  }

  // Format: XXX XXXX XXXX XXX (groupe de 3-4-4-4)
  const formatted = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7, 11)} ${cleaned.slice(11, 15)}`;

  return {
    valid: true,
    formatted,
  };
}

/**
 * Vérifie si toutes les lignes déductibles ont un ICE valide
 */
export function validateDeductibleLinesHaveICE(
  lines: VATLine[]
): VATValidationResult {
  const errors: VATValidationError[] = [];
  const warnings: VATValidationWarning[] = [];

  const deductibleLines = lines.filter((l) => l.type === 'DEDUCTIBLE' && l.isDeductible);

  deductibleLines.forEach((line) => {
    if (!line.thirdPartyICE) {
      errors.push({
        code: 'ICE_001',
        message: `ICE fournisseur manquant pour ${line.documentNumber}`,
        lineId: line.id,
        field: 'thirdPartyICE',
      });
    } else {
      const validation = validateICE(line.thirdPartyICE);
      if (!validation.valid) {
        errors.push({
          code: 'ICE_002',
          message: `ICE fournisseur invalide pour ${line.documentNumber}: ${validation.error}`,
          lineId: line.id,
          field: 'thirdPartyICE',
        });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// VALIDATION EXPORT XML
// ============================================================================

/**
 * Valide qu'une déclaration est prête pour l'export XML
 */
export function validateDeclarationForXMLExport(
  declaration: VATDeclaration
): VATValidationResult {
  const validation = validateVATDeclaration(declaration);

  // Ajout de validations spécifiques à l'export
  const additionalErrors: VATValidationError[] = [];

  if (declaration.status === 'DRAFT') {
    additionalErrors.push({
      code: 'XML_001',
      message: 'Impossible d\'exporter une déclaration en brouillon',
      field: 'status',
    });
  }

  if (!declaration.ice || !declaration.if) {
    additionalErrors.push({
      code: 'XML_002',
      message: 'ICE et IF obligatoires pour export XML',
    });
  }

  // Vérifier ICE de tous les fournisseurs
  const iceValidation = validateDeductibleLinesHaveICE(declaration.vatDeductibleLines);
  additionalErrors.push(...iceValidation.errors);

  return {
    valid: validation.valid && additionalErrors.length === 0,
    errors: [...validation.errors, ...additionalErrors],
    warnings: validation.warnings,
  };
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Groupe les erreurs par code
 */
export function groupErrorsByCode(
  errors: VATValidationError[]
): Map<string, VATValidationError[]> {
  const grouped = new Map<string, VATValidationError[]>();

  errors.forEach((error) => {
    const existing = grouped.get(error.code) || [];
    grouped.set(error.code, [...existing, error]);
  });

  return grouped;
}

/**
 * Formate un résultat de validation en texte lisible
 */
export function formatValidationResult(result: VATValidationResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push('✓ Validation réussie');
  } else {
    lines.push('✗ Validation échouée');
    lines.push('');
    lines.push(`Erreurs (${result.errors.length}):`);
    result.errors.forEach((error, index) => {
      lines.push(`${index + 1}. [${error.code}] ${error.message}`);
      if (error.field) lines.push(`   Champ: ${error.field}`);
      if (error.lineId) lines.push(`   Ligne: ${error.lineId}`);
    });
  }

  if (result.warnings.length > 0) {
    lines.push('');
    lines.push(`Avertissements (${result.warnings.length}):`);
    result.warnings.forEach((warning, index) => {
      lines.push(`${index + 1}. [${warning.code}] ${warning.message}`);
      if (warning.field) lines.push(`   Champ: ${warning.field}`);
    });
  }

  return lines.join('\n');
}
