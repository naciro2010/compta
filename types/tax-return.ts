/**
 * Types pour l'EPIC Liasse Fiscale
 * Déclaration IS (Impôt sur les Sociétés) - Maroc
 */

export type TaxReturnStatus = 'DRAFT' | 'READY' | 'SUBMITTED' | 'VALIDATED' | 'REJECTED';

export interface TaxReturn {
  id: string;
  fiscalYear: number;
  companyId: string;
  ice: string;
  if: string;

  status: TaxReturnStatus;

  // Résultat fiscal (depuis CPC)
  accountingResult: number; // Résultat comptable
  fiscalAdjustments: number; // Réintégrations - Déductions
  taxableIncome: number; // Résultat fiscal
  taxRate: number; // Taux IS (généralement 31% ou 20%)
  taxDue: number; // IS dû

  // Annexes
  scheduleA?: any; // Tableau passage résultat comptable → fiscal
  scheduleB?: any; // Provisions
  scheduleC?: any; // Amortissements
  scheduleD?: any; // Plus/Moins-values

  // Export
  xmlGenerated: boolean;
  xmlUrl?: string;

  createdAt: Date;
  submittedAt?: Date;
}
