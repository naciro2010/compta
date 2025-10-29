/**
 * Store Zustand pour la gestion de la TVA
 * EPIC TVA - Déclarations, Relevés, Export XML
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  VATLine,
  VATDeclaration,
  VATDeclarationStatus,
  VATAdjustment,
  DeductionStatement,
  SimplTVAExport,
  VATConfiguration,
  VATStats,
  VATValidationResult,
  VATRate,
  VATType,
  VATDeclarationPeriod,
} from '@/types/vat';

interface VATState {
  // === DONNÉES ===
  vatLines: VATLine[];
  declarations: VATDeclaration[];
  adjustments: VATAdjustment[];
  deductionStatements: DeductionStatement[];
  xmlExports: SimplTVAExport[];
  configuration: VATConfiguration | null;

  // === FILTRES ===
  selectedPeriod: { year: number; month?: number; quarter?: number } | null;
  selectedDeclaration: string | null;

  // === ACTIONS - LIGNES TVA ===
  addVATLine: (line: Omit<VATLine, 'id' | 'createdAt' | 'createdBy'>) => VATLine;
  updateVATLine: (id: string, updates: Partial<VATLine>) => void;
  deleteVATLine: (id: string) => void;
  getVATLinesByPeriod: (periodId: string) => VATLine[];
  getVATLinesByType: (type: VATType) => VATLine[];
  getVATLinesByRate: (rate: VATRate) => VATLine[];
  getVATLinesByDocument: (documentId: string) => VATLine[];

  // === ACTIONS - DÉCLARATIONS TVA ===
  createVATDeclaration: (
    params: {
      year: number;
      month?: number;
      quarter?: number;
      period: VATDeclarationPeriod;
      startDate: Date;
      endDate: Date;
    }
  ) => VATDeclaration;
  updateVATDeclaration: (id: string, updates: Partial<VATDeclaration>) => void;
  deleteVATDeclaration: (id: string) => void;
  getVATDeclaration: (id: string) => VATDeclaration | undefined;
  getVATDeclarationsByYear: (year: number) => VATDeclaration[];
  getVATDeclarationsByStatus: (status: VATDeclarationStatus) => VATDeclaration[];

  // Calcul de la déclaration
  calculateVATDeclaration: (declarationId: string) => void;
  validateVATDeclaration: (declarationId: string) => VATValidationResult;

  // Workflow
  submitVATDeclaration: (declarationId: string, submittedBy: string) => void;
  payVATDeclaration: (
    declarationId: string,
    params: {
      paymentDate: Date;
      paymentMethod: string;
      paymentReference: string;
      paidBy: string;
    }
  ) => void;
  lockVATDeclaration: (declarationId: string, lockedBy: string) => void;

  // === ACTIONS - AJUSTEMENTS ===
  addVATAdjustment: (
    declarationId: string,
    adjustment: Omit<VATAdjustment, 'id' | 'declarationId' | 'createdAt' | 'createdBy'>
  ) => void;
  updateVATAdjustment: (id: string, updates: Partial<VATAdjustment>) => void;
  deleteVATAdjustment: (id: string) => void;
  getAdjustmentsByDeclaration: (declarationId: string) => VATAdjustment[];

  // === ACTIONS - RELEVÉ DE DÉDUCTIONS ===
  generateDeductionStatement: (declarationId: string) => DeductionStatement;
  exportDeductionStatementToPDF: (statementId: string) => Promise<string>;
  getDeductionStatement: (id: string) => DeductionStatement | undefined;

  // === ACTIONS - EXPORT XML SIMPL-TVA ===
  generateSimplTVAXML: (declarationId: string, userId: string) => SimplTVAExport;
  validateSimplTVAXML: (exportId: string) => { valid: boolean; errors: string[] };
  submitSimplTVAXML: (exportId: string) => Promise<void>;
  getXMLExport: (id: string) => SimplTVAExport | undefined;

  // === ACTIONS - CONFIGURATION ===
  setVATConfiguration: (config: VATConfiguration) => void;
  updateVATConfiguration: (updates: Partial<VATConfiguration>) => void;
  getVATConfiguration: () => VATConfiguration | null;

  // === ACTIONS - STATISTIQUES ===
  getVATStats: (startDate: Date, endDate: Date) => VATStats;
  getVATStatsByRate: (rate: VATRate, startDate: Date, endDate: Date) => {
    collected: { base: number; vat: number };
    deductible: { base: number; vat: number };
    net: number;
  };

  // === ACTIONS - UTILITAIRES ===
  clearAllVATData: () => void;
  setSelectedPeriod: (period: { year: number; month?: number; quarter?: number } | null) => void;
  setSelectedDeclaration: (id: string | null) => void;
}

export const useVATStore = create<VATState>()(
  persist(
    (set, get) => ({
      // === ÉTAT INITIAL ===
      vatLines: [],
      declarations: [],
      adjustments: [],
      deductionStatements: [],
      xmlExports: [],
      configuration: null,
      selectedPeriod: null,
      selectedDeclaration: null,

      // === ACTIONS - LIGNES TVA ===
      addVATLine: (lineData) => {
        const newLine: VATLine = {
          ...lineData,
          id: `vat-line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          createdBy: 'current-user', // À remplacer par l'utilisateur authentifié
        };

        set((state) => ({
          vatLines: [...state.vatLines, newLine],
        }));

        return newLine;
      },

      updateVATLine: (id, updates) => {
        set((state) => ({
          vatLines: state.vatLines.map((line) =>
            line.id === id ? { ...line, ...updates } : line
          ),
        }));
      },

      deleteVATLine: (id) => {
        set((state) => ({
          vatLines: state.vatLines.filter((line) => line.id !== id),
        }));
      },

      getVATLinesByPeriod: (periodId) => {
        return get().vatLines.filter((line) => line.periodId === periodId);
      },

      getVATLinesByType: (type) => {
        return get().vatLines.filter((line) => line.type === type);
      },

      getVATLinesByRate: (rate) => {
        return get().vatLines.filter((line) => line.rate === rate);
      },

      getVATLinesByDocument: (documentId) => {
        return get().vatLines.filter((line) => line.documentId === documentId);
      },

      // === ACTIONS - DÉCLARATIONS TVA ===
      createVATDeclaration: (params) => {
        const { configuration } = get();
        if (!configuration) {
          throw new Error('Configuration TVA non définie');
        }

        const newDeclaration: VATDeclaration = {
          id: `vat-decl-${Date.now()}`,
          year: params.year,
          month: params.month,
          quarter: params.quarter,
          period: params.period,
          startDate: params.startDate,
          endDate: params.endDate,

          companyId: configuration.companyId,
          ice: '', // À remplir depuis les paramètres entreprise
          if: '',
          vatNumber: configuration.vatNumber,

          status: 'DRAFT',

          // TVA collectée
          vatCollectedLines: [],
          collected20: { base: 0, vat: 0 },
          collected14: { base: 0, vat: 0 },
          collected10: { base: 0, vat: 0 },
          collected7: { base: 0, vat: 0 },
          collected0: { base: 0, vat: 0 },
          totalCollectedBase: 0,
          totalCollectedVAT: 0,

          // TVA déductible
          vatDeductibleLines: [],
          deductible20: { base: 0, vat: 0 },
          deductible14: { base: 0, vat: 0 },
          deductible10: { base: 0, vat: 0 },
          deductible7: { base: 0, vat: 0 },
          deductible0: { base: 0, vat: 0 },
          totalDeductibleBase: 0,
          totalDeductibleVAT: 0,

          // Calcul
          netVAT: 0,
          vatToPay: 0,

          // Régularisations
          adjustments: [],
          totalAdjustments: 0,

          // Relevé & XML
          deductionStatementGenerated: false,
          xmlExported: false,
          xmlValidated: false,

          // Audit
          createdAt: new Date(),
          createdBy: 'current-user',
        };

        set((state) => ({
          declarations: [...state.declarations, newDeclaration],
        }));

        // Calculer automatiquement
        get().calculateVATDeclaration(newDeclaration.id);

        return newDeclaration;
      },

      updateVATDeclaration: (id, updates) => {
        set((state) => ({
          declarations: state.declarations.map((decl) =>
            decl.id === id ? { ...decl, ...updates, updatedAt: new Date() } : decl
          ),
        }));
      },

      deleteVATDeclaration: (id) => {
        set((state) => ({
          declarations: state.declarations.filter((decl) => decl.id !== id),
        }));
      },

      getVATDeclaration: (id) => {
        return get().declarations.find((decl) => decl.id === id);
      },

      getVATDeclarationsByYear: (year) => {
        return get().declarations.filter((decl) => decl.year === year);
      },

      getVATDeclarationsByStatus: (status) => {
        return get().declarations.filter((decl) => decl.status === status);
      },

      // === CALCUL DÉCLARATION ===
      calculateVATDeclaration: (declarationId) => {
        const declaration = get().getVATDeclaration(declarationId);
        if (!declaration) return;

        const { vatLines, adjustments } = get();

        // Filtrer les lignes de la période
        const startTime = declaration.startDate.getTime();
        const endTime = declaration.endDate.getTime();

        const periodLines = vatLines.filter((line) => {
          const lineTime = line.documentDate.getTime();
          return lineTime >= startTime && lineTime <= endTime;
        });

        // Séparer collectée / déductible
        const collectedLines = periodLines.filter((line) => line.type === 'COLLECTED');
        const deductibleLines = periodLines.filter((line) => line.type === 'DEDUCTIBLE');

        // Calculer par taux - COLLECTÉE
        const collected20 = collectedLines
          .filter((l) => l.rate === 20)
          .reduce((acc, l) => ({ base: acc.base + l.baseAmount, vat: acc.vat + l.vatAmount }), { base: 0, vat: 0 });

        const collected14 = collectedLines
          .filter((l) => l.rate === 14)
          .reduce((acc, l) => ({ base: acc.base + l.baseAmount, vat: acc.vat + l.vatAmount }), { base: 0, vat: 0 });

        const collected10 = collectedLines
          .filter((l) => l.rate === 10)
          .reduce((acc, l) => ({ base: acc.base + l.baseAmount, vat: acc.vat + l.vatAmount }), { base: 0, vat: 0 });

        const collected7 = collectedLines
          .filter((l) => l.rate === 7)
          .reduce((acc, l) => ({ base: acc.base + l.baseAmount, vat: acc.vat + l.vatAmount }), { base: 0, vat: 0 });

        const collected0 = collectedLines
          .filter((l) => l.rate === 0)
          .reduce((acc, l) => ({ base: acc.base + l.baseAmount, vat: acc.vat + l.vatAmount }), { base: 0, vat: 0 });

        const totalCollectedBase = collected20.base + collected14.base + collected10.base + collected7.base + collected0.base;
        const totalCollectedVAT = collected20.vat + collected14.vat + collected10.vat + collected7.vat + collected0.vat;

        // Calculer par taux - DÉDUCTIBLE
        const deductible20 = deductibleLines
          .filter((l) => l.rate === 20)
          .reduce((acc, l) => {
            const deductibleVat = l.vatAmount * (l.deductionRate / 100);
            return { base: acc.base + l.baseAmount, vat: acc.vat + deductibleVat };
          }, { base: 0, vat: 0 });

        const deductible14 = deductibleLines
          .filter((l) => l.rate === 14)
          .reduce((acc, l) => {
            const deductibleVat = l.vatAmount * (l.deductionRate / 100);
            return { base: acc.base + l.baseAmount, vat: acc.vat + deductibleVat };
          }, { base: 0, vat: 0 });

        const deductible10 = deductibleLines
          .filter((l) => l.rate === 10)
          .reduce((acc, l) => {
            const deductibleVat = l.vatAmount * (l.deductionRate / 100);
            return { base: acc.base + l.baseAmount, vat: acc.vat + deductibleVat };
          }, { base: 0, vat: 0 });

        const deductible7 = deductibleLines
          .filter((l) => l.rate === 7)
          .reduce((acc, l) => {
            const deductibleVat = l.vatAmount * (l.deductionRate / 100);
            return { base: acc.base + l.baseAmount, vat: acc.vat + deductibleVat };
          }, { base: 0, vat: 0 });

        const deductible0 = deductibleLines
          .filter((l) => l.rate === 0)
          .reduce((acc, l) => {
            const deductibleVat = l.vatAmount * (l.deductionRate / 100);
            return { base: acc.base + l.baseAmount, vat: acc.vat + deductibleVat };
          }, { base: 0, vat: 0 });

        const totalDeductibleBase = deductible20.base + deductible14.base + deductible10.base + deductible7.base + deductible0.base;
        const totalDeductibleVAT = deductible20.vat + deductible14.vat + deductible10.vat + deductible7.vat + deductible0.vat;

        // Ajustements de cette déclaration
        const declAdjustments = adjustments.filter((adj) => adj.declarationId === declarationId);
        const totalAdjustments = declAdjustments.reduce((sum, adj) => sum + adj.amount, 0);

        // Calcul final
        const netVAT = totalCollectedVAT - totalDeductibleVAT + totalAdjustments;
        const vatToPay = netVAT - (declaration.vatCredit || 0);

        // Mettre à jour la déclaration
        get().updateVATDeclaration(declarationId, {
          vatCollectedLines: collectedLines,
          collected20,
          collected14,
          collected10,
          collected7,
          collected0,
          totalCollectedBase,
          totalCollectedVAT,

          vatDeductibleLines: deductibleLines,
          deductible20,
          deductible14,
          deductible10,
          deductible7,
          deductible0,
          totalDeductibleBase,
          totalDeductibleVAT,

          adjustments: declAdjustments,
          totalAdjustments,

          netVAT,
          vatToPay,
          newVATCredit: vatToPay < 0 ? Math.abs(vatToPay) : undefined,

          status: 'IN_PROGRESS',
        });
      },

      validateVATDeclaration: (declarationId) => {
        const declaration = get().getVATDeclaration(declarationId);
        if (!declaration) {
          return {
            valid: false,
            errors: [{ code: 'NOT_FOUND', message: 'Déclaration introuvable' }],
            warnings: [],
          };
        }

        const errors: any[] = [];
        const warnings: any[] = [];

        // Validation ICE fournisseurs pour TVA déductible
        declaration.vatDeductibleLines.forEach((line) => {
          if (line.isDeductible && !line.thirdPartyICE) {
            errors.push({
              code: 'VAT_001',
              message: `ICE fournisseur manquant pour la ligne ${line.documentNumber}`,
              lineId: line.id,
            });
          }
        });

        // Validation montants
        declaration.vatCollectedLines.forEach((line) => {
          const expectedVAT = (line.baseAmount * line.rate) / 100;
          const diff = Math.abs(expectedVAT - line.vatAmount);
          if (diff > 0.01) {
            warnings.push({
              code: 'VAT_002',
              message: `Montant TVA incohérent pour ${line.documentNumber}`,
              field: 'vatAmount',
            });
          }
        });

        return {
          valid: errors.length === 0,
          errors,
          warnings,
        };
      },

      submitVATDeclaration: (declarationId, submittedBy) => {
        const validation = get().validateVATDeclaration(declarationId);
        if (!validation.valid) {
          throw new Error('La déclaration contient des erreurs');
        }

        get().updateVATDeclaration(declarationId, {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          submittedBy,
          submissionReference: `SIMPL-TVA-${Date.now()}`,
        });
      },

      payVATDeclaration: (declarationId, params) => {
        get().updateVATDeclaration(declarationId, {
          status: 'PAID',
          paymentDate: params.paymentDate,
          paymentMethod: params.paymentMethod,
          paymentReference: params.paymentReference,
          paidAt: new Date(),
          paidBy: params.paidBy,
        });
      },

      lockVATDeclaration: (declarationId, lockedBy) => {
        get().updateVATDeclaration(declarationId, {
          lockedAt: new Date(),
          lockedBy,
        });
      },

      // === AJUSTEMENTS ===
      addVATAdjustment: (declarationId, adjustmentData) => {
        const newAdjustment: VATAdjustment = {
          ...adjustmentData,
          id: `vat-adj-${Date.now()}`,
          declarationId,
          createdAt: new Date(),
          createdBy: 'current-user',
        };

        set((state) => ({
          adjustments: [...state.adjustments, newAdjustment],
        }));

        // Recalculer la déclaration
        get().calculateVATDeclaration(declarationId);
      },

      updateVATAdjustment: (id, updates) => {
        set((state) => ({
          adjustments: state.adjustments.map((adj) =>
            adj.id === id ? { ...adj, ...updates } : adj
          ),
        }));
      },

      deleteVATAdjustment: (id) => {
        const adjustment = get().adjustments.find((adj) => adj.id === id);
        if (adjustment) {
          set((state) => ({
            adjustments: state.adjustments.filter((adj) => adj.id !== id),
          }));
          // Recalculer la déclaration
          get().calculateVATDeclaration(adjustment.declarationId);
        }
      },

      getAdjustmentsByDeclaration: (declarationId) => {
        return get().adjustments.filter((adj) => adj.declarationId === declarationId);
      },

      // === RELEVÉ DE DÉDUCTIONS ===
      generateDeductionStatement: (declarationId) => {
        const declaration = get().getVATDeclaration(declarationId);
        if (!declaration) {
          throw new Error('Déclaration introuvable');
        }

        const lines = declaration.vatDeductibleLines.map((line, index) => ({
          id: line.id,
          order: index + 1,
          supplierName: line.thirdPartyName || 'Fournisseur inconnu',
          supplierICE: line.thirdPartyICE || '',
          supplierIF: undefined,
          invoiceNumber: line.documentNumber,
          invoiceDate: line.documentDate,
          baseAmount: line.baseAmount,
          vatRate: line.rate,
          vatAmount: line.vatAmount,
          deductionRate: line.deductionRate,
          deductibleAmount: line.vatAmount * (line.deductionRate / 100),
          category: 'GOODS' as const,
        }));

        const totalBaseAmount = lines.reduce((sum, l) => sum + l.baseAmount, 0);
        const totalVATAmount = lines.reduce((sum, l) => sum + l.deductibleAmount, 0);

        const statement: DeductionStatement = {
          id: `deduction-${Date.now()}`,
          declarationId,
          period: {
            year: declaration.year,
            month: declaration.month,
            quarter: declaration.quarter,
          },
          lines,
          totalBaseAmount,
          totalVATAmount,
          generatedAt: new Date(),
          generatedBy: 'current-user',
        };

        set((state) => ({
          deductionStatements: [...state.deductionStatements, statement],
        }));

        get().updateVATDeclaration(declarationId, {
          deductionStatementGenerated: true,
        });

        return statement;
      },

      exportDeductionStatementToPDF: async (statementId) => {
        // TODO: Implémenter génération PDF avec bibliothèque (jsPDF, pdfmake, etc.)
        const statement = get().deductionStatements.find((s) => s.id === statementId);
        if (!statement) {
          throw new Error('Relevé introuvable');
        }

        // Simulation
        const pdfUrl = `/exports/deduction-statement-${statementId}.pdf`;

        set((state) => ({
          deductionStatements: state.deductionStatements.map((s) =>
            s.id === statementId ? { ...s, pdfUrl } : s
          ),
        }));

        return pdfUrl;
      },

      getDeductionStatement: (id) => {
        return get().deductionStatements.find((s) => s.id === id);
      },

      // === EXPORT XML SIMPL-TVA ===
      generateSimplTVAXML: (declarationId, userId) => {
        const declaration = get().getVATDeclaration(declarationId);
        if (!declaration) {
          throw new Error('Déclaration introuvable');
        }

        // Générer le XML (structure simplifiée)
        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<DeclarationTVA xmlns="http://www.tax.gov.ma/simpl-tva" version="2.0">
  <Identification>
    <ICE>${declaration.ice}</ICE>
    <IF>${declaration.if}</IF>
    <Periode>
      <Annee>${declaration.year}</Annee>
      ${declaration.month ? `<Mois>${declaration.month}</Mois>` : `<Trimestre>${declaration.quarter}</Trimestre>`}
    </Periode>
  </Identification>
  <TVACollectee>
    <Taux20 base="${declaration.collected20.base}" tva="${declaration.collected20.vat}" />
    <Taux14 base="${declaration.collected14.base}" tva="${declaration.collected14.vat}" />
    <Taux10 base="${declaration.collected10.base}" tva="${declaration.collected10.vat}" />
    <Taux7 base="${declaration.collected7.base}" tva="${declaration.collected7.vat}" />
    <Total>${declaration.totalCollectedVAT}</Total>
  </TVACollectee>
  <TVADeductible>
    <Taux20 base="${declaration.deductible20.base}" tva="${declaration.deductible20.vat}" />
    <Taux14 base="${declaration.deductible14.base}" tva="${declaration.deductible14.vat}" />
    <Taux10 base="${declaration.deductible10.base}" tva="${declaration.deductible10.vat}" />
    <Taux7 base="${declaration.deductible7.base}" tva="${declaration.deductible7.vat}" />
    <Total>${declaration.totalDeductibleVAT}</Total>
  </TVADeductible>
  <Calcul>
    <TVANette>${declaration.netVAT}</TVANette>
    <CreditReporte>${declaration.vatCredit || 0}</CreditReporte>
    <TVAAPayer>${declaration.vatToPay}</TVAAPayer>
  </Calcul>
</DeclarationTVA>`;

        const filename = `TVA_${declaration.ice}_${declaration.year}${declaration.month ? declaration.month.toString().padStart(2, '0') : `T${declaration.quarter}`}.xml`;

        const xmlExport: SimplTVAExport = {
          id: `xml-export-${Date.now()}`,
          declarationId,
          xmlVersion: '2.0',
          xmlContent,
          xsdValidated: false,
          filename,
          fileSize: xmlContent.length,
          generatedAt: new Date(),
          generatedBy: userId,
        };

        set((state) => ({
          xmlExports: [...state.xmlExports, xmlExport],
        }));

        get().updateVATDeclaration(declarationId, {
          xmlExported: true,
          xmlExportUrl: `/exports/${filename}`,
        });

        return xmlExport;
      },

      validateSimplTVAXML: (exportId) => {
        // TODO: Implémenter validation XSD réelle
        const xmlExport = get().xmlExports.find((x) => x.id === exportId);
        if (!xmlExport) {
          return { valid: false, errors: ['Export introuvable'] };
        }

        // Simulation validation
        const valid = xmlExport.xmlContent.includes('<?xml version="1.0"');
        const errors = valid ? [] : ['Format XML invalide'];

        set((state) => ({
          xmlExports: state.xmlExports.map((x) =>
            x.id === exportId ? { ...x, xsdValidated: valid, validationErrors: errors } : x
          ),
        }));

        return { valid, errors };
      },

      submitSimplTVAXML: async (exportId) => {
        // TODO: Implémenter soumission réelle à la DGI
        const xmlExport = get().xmlExports.find((x) => x.id === exportId);
        if (!xmlExport) {
          throw new Error('Export introuvable');
        }

        // Simulation
        set((state) => ({
          xmlExports: state.xmlExports.map((x) =>
            x.id === exportId
              ? {
                  ...x,
                  submittedAt: new Date(),
                  submissionReference: `DGI-${Date.now()}`,
                  dgiStatus: 'ACCEPTED' as const,
                }
              : x
          ),
        }));
      },

      getXMLExport: (id) => {
        return get().xmlExports.find((x) => x.id === id);
      },

      // === CONFIGURATION ===
      setVATConfiguration: (config) => {
        set({ configuration: config });
      },

      updateVATConfiguration: (updates) => {
        set((state) => ({
          configuration: state.configuration
            ? { ...state.configuration, ...updates, updatedAt: new Date() }
            : null,
        }));
      },

      getVATConfiguration: () => {
        return get().configuration;
      },

      // === STATISTIQUES ===
      getVATStats: (startDate, endDate) => {
        const { vatLines } = get();

        const startTime = startDate.getTime();
        const endTime = endDate.getTime();

        const periodLines = vatLines.filter((line) => {
          const lineTime = line.documentDate.getTime();
          return lineTime >= startTime && lineTime <= endTime;
        });

        const totalCollected = periodLines
          .filter((l) => l.type === 'COLLECTED')
          .reduce((sum, l) => sum + l.vatAmount, 0);

        const totalDeductible = periodLines
          .filter((l) => l.type === 'DEDUCTIBLE')
          .reduce((sum, l) => sum + l.vatAmount * (l.deductionRate / 100), 0);

        const netVAT = totalCollected - totalDeductible;

        // Par taux
        const byRate: any = {};
        [0, 7, 10, 14, 20].forEach((rate) => {
          const collected = periodLines
            .filter((l) => l.type === 'COLLECTED' && l.rate === rate)
            .reduce((acc, l) => ({
              base: acc.base + l.baseAmount,
              vat: acc.vat + l.vatAmount,
            }), { base: 0, vat: 0 });

          const deductible = periodLines
            .filter((l) => l.type === 'DEDUCTIBLE' && l.rate === rate)
            .reduce((acc, l) => ({
              base: acc.base + l.baseAmount,
              vat: acc.vat + (l.vatAmount * (l.deductionRate / 100)),
            }), { base: 0, vat: 0 });

          byRate[rate] = {
            collected,
            deductible,
            net: collected.vat - deductible.vat,
          };
        });

        const declarationCount = get().declarations.filter((d) => {
          const dStart = d.startDate.getTime();
          const dEnd = d.endDate.getTime();
          return dStart >= startTime && dEnd <= endTime;
        }).length;

        return {
          period: { start: startDate, end: endDate },
          totalCollected,
          totalDeductible,
          netVAT,
          byRate,
          declarationCount,
          totalPaid: 0, // TODO: calculer depuis les déclarations payées
          totalCredit: 0,
        };
      },

      getVATStatsByRate: (rate, startDate, endDate) => {
        const { vatLines } = get();

        const startTime = startDate.getTime();
        const endTime = endDate.getTime();

        const periodLines = vatLines.filter((line) => {
          const lineTime = line.documentDate.getTime();
          return lineTime >= startTime && lineTime <= endTime && line.rate === rate;
        });

        const collected = periodLines
          .filter((l) => l.type === 'COLLECTED')
          .reduce((acc, l) => ({
            base: acc.base + l.baseAmount,
            vat: acc.vat + l.vatAmount,
          }), { base: 0, vat: 0 });

        const deductible = periodLines
          .filter((l) => l.type === 'DEDUCTIBLE')
          .reduce((acc, l) => ({
            base: acc.base + l.baseAmount,
            vat: acc.vat + (l.vatAmount * (l.deductionRate / 100)),
          }), { base: 0, vat: 0 });

        const net = collected.vat - deductible.vat;

        return { collected, deductible, net };
      },

      // === UTILITAIRES ===
      clearAllVATData: () => {
        set({
          vatLines: [],
          declarations: [],
          adjustments: [],
          deductionStatements: [],
          xmlExports: [],
        });
      },

      setSelectedPeriod: (period) => {
        set({ selectedPeriod: period });
      },

      setSelectedDeclaration: (id) => {
        set({ selectedDeclaration: id });
      },
    }),
    {
      name: 'vat-storage',
    }
  )
);
