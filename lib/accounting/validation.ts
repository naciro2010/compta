/**
 * Validations pour le moteur comptable CGNC
 * Garantit l'intégrité des écritures en partie double
 */

import {
  Entry,
  EntryLine,
  EntryValidation,
  ValidationError,
  ValidationWarning,
  Account,
  AccountingPeriod,
} from '@/types/accounting';

/**
 * Valide une écriture comptable complète
 */
export function validateEntry(
  entry: Partial<Entry>,
  accounts: Account[],
  period?: AccountingPeriod
): EntryValidation {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validation des champs obligatoires
  if (!entry.journalId) {
    errors.push({
      code: 'MISSING_JOURNAL',
      message: 'Le journal est obligatoire',
      field: 'journalId',
    });
  }

  if (!entry.date) {
    errors.push({
      code: 'MISSING_DATE',
      message: 'La date est obligatoire',
      field: 'date',
    });
  }

  if (!entry.description || entry.description.trim() === '') {
    errors.push({
      code: 'MISSING_DESCRIPTION',
      message: 'La description est obligatoire',
      field: 'description',
    });
  }

  if (!entry.lines || entry.lines.length === 0) {
    errors.push({
      code: 'NO_LINES',
      message: 'L\'écriture doit contenir au moins une ligne',
      field: 'lines',
    });
  }

  // Validation de la période
  if (period) {
    if (!period.isOpen) {
      errors.push({
        code: 'PERIOD_CLOSED',
        message: 'La période comptable est fermée',
        field: 'periodId',
      });
    }

    if (entry.date) {
      const entryDate = new Date(entry.date);
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);

      if (entryDate < periodStart || entryDate > periodEnd) {
        errors.push({
          code: 'DATE_OUT_OF_PERIOD',
          message: 'La date de l\'écriture est hors de la période comptable',
          field: 'date',
        });
      }
    }
  }

  // Validation des lignes
  if (entry.lines && entry.lines.length > 0) {
    const lineErrors = validateEntryLines(entry.lines, accounts);
    errors.push(...lineErrors);
  }

  // Validation de l'équilibre (Débit = Crédit)
  if (entry.lines && entry.lines.length > 0) {
    const balanceValidation = validateBalance(entry.lines);
    if (!balanceValidation.isBalanced) {
      errors.push({
        code: 'UNBALANCED_ENTRY',
        message: `L'écriture n'est pas équilibrée. Débit: ${balanceValidation.totalDebit} MAD, Crédit: ${balanceValidation.totalCredit} MAD, Différence: ${balanceValidation.difference} MAD`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valide les lignes d'une écriture
 */
export function validateEntryLines(
  lines: EntryLine[],
  accounts: Account[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  lines.forEach((line, index) => {
    // Compte obligatoire
    if (!line.accountId) {
      errors.push({
        code: 'MISSING_ACCOUNT',
        message: 'Le compte est obligatoire',
        field: 'accountId',
        lineIndex: index,
      });
      return;
    }

    // Vérifier que le compte existe
    const account = accounts.find(a => a.id === line.accountId);
    if (!account) {
      errors.push({
        code: 'INVALID_ACCOUNT',
        message: `Le compte ${line.accountId} n'existe pas`,
        field: 'accountId',
        lineIndex: index,
      });
      return;
    }

    // Vérifier que c'est un compte de détail
    if (!account.isDetailAccount) {
      errors.push({
        code: 'NOT_DETAIL_ACCOUNT',
        message: `Le compte ${account.number} - ${account.label} n'est pas un compte de détail`,
        field: 'accountId',
        lineIndex: index,
      });
    }

    // Vérifier que le compte est actif
    if (!account.isActive) {
      errors.push({
        code: 'INACTIVE_ACCOUNT',
        message: `Le compte ${account.number} - ${account.label} n'est pas actif`,
        field: 'accountId',
        lineIndex: index,
      });
    }

    // Libellé obligatoire
    if (!line.label || line.label.trim() === '') {
      errors.push({
        code: 'MISSING_LABEL',
        message: 'Le libellé de la ligne est obligatoire',
        field: 'label',
        lineIndex: index,
      });
    }

    // Montant obligatoire (débit OU crédit)
    if (line.debit === 0 && line.credit === 0) {
      errors.push({
        code: 'NO_AMOUNT',
        message: 'La ligne doit avoir un montant au débit ou au crédit',
        lineIndex: index,
      });
    }

    // Pas les deux en même temps
    if (line.debit > 0 && line.credit > 0) {
      errors.push({
        code: 'BOTH_DEBIT_CREDIT',
        message: 'Une ligne ne peut pas avoir à la fois un débit et un crédit',
        lineIndex: index,
      });
    }

    // Montants positifs
    if (line.debit < 0 || line.credit < 0) {
      errors.push({
        code: 'NEGATIVE_AMOUNT',
        message: 'Les montants doivent être positifs',
        lineIndex: index,
      });
    }

    // Devise
    if (!line.currency) {
      errors.push({
        code: 'MISSING_CURRENCY',
        message: 'La devise est obligatoire',
        field: 'currency',
        lineIndex: index,
      });
    }

    // Taux de change pour devises étrangères
    if (line.currency && line.currency !== 'MAD' && !line.exchangeRate) {
      errors.push({
        code: 'MISSING_EXCHANGE_RATE',
        message: 'Le taux de change est obligatoire pour les devises étrangères',
        field: 'exchangeRate',
        lineIndex: index,
      });
    }

    // Montants MAD cohérents
    if (line.debitMAD < 0 || line.creditMAD < 0) {
      errors.push({
        code: 'NEGATIVE_MAD_AMOUNT',
        message: 'Les montants en MAD doivent être positifs',
        lineIndex: index,
      });
    }
  });

  return errors;
}

/**
 * Valide l'équilibre d'une écriture (Débit = Crédit)
 */
export function validateBalance(lines: EntryLine[]): {
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
} {
  const totalDebit = lines.reduce((sum, line) => sum + line.debitMAD, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.creditMAD, 0);
  const difference = Math.abs(totalDebit - totalCredit);

  // Tolérance de 0.01 MAD pour les arrondis
  const isBalanced = difference < 0.01;

  return {
    isBalanced,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    difference: Math.round(difference * 100) / 100,
  };
}

/**
 * Valide un compte personnalisé
 */
export function validateCustomAccount(
  account: Partial<Account>,
  existingAccounts: Account[]
): EntryValidation {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Numéro obligatoire
  if (!account.number || account.number.trim() === '') {
    errors.push({
      code: 'MISSING_NUMBER',
      message: 'Le numéro de compte est obligatoire',
      field: 'number',
    });
  }

  // Vérifier que le numéro n'existe pas déjà
  if (account.number) {
    const exists = existingAccounts.find(a => a.number === account.number);
    if (exists) {
      errors.push({
        code: 'DUPLICATE_NUMBER',
        message: `Le compte ${account.number} existe déjà`,
        field: 'number',
      });
    }
  }

  // Libellé obligatoire
  if (!account.label || account.label.trim() === '') {
    errors.push({
      code: 'MISSING_LABEL',
      message: 'Le libellé est obligatoire',
      field: 'label',
    });
  }

  // Classe obligatoire
  if (!account.class) {
    errors.push({
      code: 'MISSING_CLASS',
      message: 'La classe est obligatoire',
      field: 'class',
    });
  } else if (account.class < 1 || account.class > 8) {
    errors.push({
      code: 'INVALID_CLASS',
      message: 'La classe doit être comprise entre 1 et 8',
      field: 'class',
    });
  }

  // Type obligatoire
  if (!account.type) {
    errors.push({
      code: 'MISSING_TYPE',
      message: 'Le type de compte est obligatoire',
      field: 'type',
    });
  }

  // Justification obligatoire pour compte personnalisé
  if (!account.justification || account.justification.trim() === '') {
    warnings.push({
      code: 'MISSING_JUSTIFICATION',
      message: 'Il est recommandé de justifier la création d\'un compte personnalisé',
      field: 'justification',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valide une période comptable
 */
export function validatePeriod(period: Partial<AccountingPeriod>): EntryValidation {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!period.startDate) {
    errors.push({
      code: 'MISSING_START_DATE',
      message: 'La date de début est obligatoire',
      field: 'startDate',
    });
  }

  if (!period.endDate) {
    errors.push({
      code: 'MISSING_END_DATE',
      message: 'La date de fin est obligatoire',
      field: 'endDate',
    });
  }

  if (period.startDate && period.endDate) {
    if (new Date(period.startDate) >= new Date(period.endDate)) {
      errors.push({
        code: 'INVALID_PERIOD',
        message: 'La date de fin doit être postérieure à la date de début',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calcule le montant en MAD pour une devise étrangère
 */
export function calculateMADAmount(
  amount: number,
  currency: string,
  exchangeRate?: number
): number {
  if (currency === 'MAD') {
    return amount;
  }

  if (!exchangeRate) {
    throw new Error('Taux de change requis pour les devises étrangères');
  }

  return Math.round(amount * exchangeRate * 100) / 100;
}
