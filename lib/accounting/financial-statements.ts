/**
 * Générateur d'États de Synthèse CGNC (EPIC 3)
 * Conforme au Plan Comptable Général Marocain
 */

import {
  Bilan,
  CPC,
  ESG,
  TableauFinancement,
  ETIC,
  ETICSection,
  FinancialStatementsPack,
  FinancialStatementModel,
  StatementLine,
  StatementValidation,
  StatementValidationError,
  StatementValidationWarning,
} from '@/types/financial-statements';
import {
  Account,
  Entry,
  FiscalYear,
  BalanceSheet,
  CompanySettings,
} from '@/types/accounting';
import {
  BILAN_ACTIF_MAPPING,
  BILAN_PASSIF_MAPPING,
  CPC_PRODUITS_MAPPING,
  CPC_CHARGES_MAPPING,
  STATEMENT_MODEL_THRESHOLD,
  accountMatchesRange,
  groupAccountsByRubric,
} from '@/data/financial-statements-mapping';

// ============================================================================
// Détermination du modèle
// ============================================================================

/**
 * Détermine le modèle d'états de synthèse applicable
 * Selon le CA : ≤ 10M MAD = SIMPLIFIE, > 10M MAD = NORMAL
 */
export function determineStatementModel(
  fiscalYear: FiscalYear,
  entries: Entry[]
): FinancialStatementModel {
  // Calculer le CA de l'exercice (comptes 711 et 712)
  const yearEntries = entries.filter(
    e => e.periodId && fiscalYear.periods.some(p => p.id === e.periodId)
  );

  let revenue = 0;

  for (const entry of yearEntries) {
    for (const line of entry.lines) {
      const accountNumber = line.accountId;

      // Comptes de ventes (711, 712)
      if (accountNumber.startsWith('711') || accountNumber.startsWith('712')) {
        revenue += line.creditMAD - line.debitMAD;
      }
    }
  }

  return revenue > STATEMENT_MODEL_THRESHOLD.revenueThresholdMAD
    ? 'NORMAL'
    : 'SIMPLIFIE';
}

// ============================================================================
// Calcul des soldes comptables
// ============================================================================

/**
 * Calcule les soldes de tous les comptes pour un exercice donné
 */
export function calculateAccountBalances(
  accounts: Account[],
  entries: Entry[],
  fiscalYear: FiscalYear,
  previousFiscalYear?: FiscalYear
): {
  current: Map<string, number>;
  previous: Map<string, number>;
} {
  const currentBalances = new Map<string, number>();
  const previousBalances = new Map<string, number>();

  // Soldes exercice courant
  const currentEntries = entries.filter(
    e => e.periodId && fiscalYear.periods.some(p => p.id === e.periodId) && e.isValidated
  );

  for (const entry of currentEntries) {
    for (const line of entry.lines) {
      const current = currentBalances.get(line.accountId) || 0;
      currentBalances.set(line.accountId, current + line.debitMAD - line.creditMAD);
    }
  }

  // Soldes exercice précédent
  if (previousFiscalYear) {
    const previousEntries = entries.filter(
      e => e.periodId && previousFiscalYear.periods.some(p => p.id === e.periodId) && e.isValidated
    );

    for (const entry of previousEntries) {
      for (const line of entry.lines) {
        const previous = previousBalances.get(line.accountId) || 0;
        previousBalances.set(line.accountId, previous + line.debitMAD - line.creditMAD);
      }
    }
  }

  return { current: currentBalances, previous: previousBalances };
}

// ============================================================================
// GÉNÉRATION DU BILAN (BL)
// ============================================================================

/**
 * Génère le Bilan conforme CGNC
 */
export function generateBilan(
  fiscalYear: FiscalYear,
  accounts: Account[],
  entries: Entry[],
  previousFiscalYear: FiscalYear | undefined,
  model: FinancialStatementModel,
  userId: string
): Bilan {
  const { current, previous } = calculateAccountBalances(
    accounts,
    entries,
    fiscalYear,
    previousFiscalYear
  );

  // Convertir les maps en tableaux pour le groupement
  const currentAccountsData = Array.from(current.entries()).map(([number, balance]) => ({
    number,
    balance,
  }));
  const previousAccountsData = Array.from(previous.entries()).map(([number, balance]) => ({
    number,
    balance,
  }));

  // Grouper par rubriques
  const actifCurrent = groupAccountsByRubric(currentAccountsData, BILAN_ACTIF_MAPPING);
  const actifPrevious = groupAccountsByRubric(previousAccountsData, BILAN_ACTIF_MAPPING);
  const passifCurrent = groupAccountsByRubric(currentAccountsData, BILAN_PASSIF_MAPPING);
  const passifPrevious = groupAccountsByRubric(previousAccountsData, BILAN_PASSIF_MAPPING);

  // Construire l'ACTIF
  const actif = {
    // Immobilisations en non-valeurs
    immobilisationsEnNonValeurs: [
      createStatementLine('AA', 'Frais préliminaires', actifCurrent, actifPrevious, 2),
      createStatementLine('AB', 'Charges à répartir', actifCurrent, actifPrevious, 2),
      createStatementLine('AC', 'Primes de remboursement', actifCurrent, actifPrevious, 2),
    ],

    // Immobilisations incorporelles
    immobilisationsIncorporelles: [
      createStatementLine('AF', 'R&D', actifCurrent, actifPrevious, 2),
      createStatementLine('AG', 'Brevets, marques', actifCurrent, actifPrevious, 2),
      createStatementLine('AH', 'Fonds commercial', actifCurrent, actifPrevious, 2),
      createStatementLine('AI', 'Autres immob. incorp.', actifCurrent, actifPrevious, 2),
    ],

    // Immobilisations corporelles
    immobilisationsCorpoelles: [
      createStatementLine('AK', 'Terrains', actifCurrent, actifPrevious, 2),
      createStatementLine('AL', 'Constructions', actifCurrent, actifPrevious, 2),
      createStatementLine('AM', 'Installations techniques', actifCurrent, actifPrevious, 2),
      createStatementLine('AN', 'Matériel de transport', actifCurrent, actifPrevious, 2),
      createStatementLine('AO', 'Mobilier et matériel', actifCurrent, actifPrevious, 2),
      createStatementLine('AP', 'Autres immob. corp.', actifCurrent, actifPrevious, 2),
    ],

    // Immobilisations financières
    immobilisationsFinancieres: [
      createStatementLine('AQ', 'Prêts immobilisés', actifCurrent, actifPrevious, 2),
      createStatementLine('AR', 'Titres de participation', actifCurrent, actifPrevious, 2),
      createStatementLine('AS', 'Autres titres immobilisés', actifCurrent, actifPrevious, 2),
    ],

    // Écarts de conversion
    ecartsDeConversion: [
      createStatementLine('AU', 'Écarts de conversion - Actif', actifCurrent, actifPrevious, 2),
    ],

    totalActifImmobilise: createTotalLine(
      'AZ',
      'TOTAL ACTIF IMMOBILISÉ (I)',
      ['AA', 'AB', 'AC', 'AF', 'AG', 'AH', 'AI', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AU'],
      actifCurrent,
      actifPrevious,
      1
    ),

    // Stocks
    stocks: [
      createStatementLine('BA', 'Marchandises', actifCurrent, actifPrevious, 2),
      createStatementLine('BB', 'Matières et fournitures', actifCurrent, actifPrevious, 2),
      createStatementLine('BC', 'Produits en cours', actifCurrent, actifPrevious, 2),
      createStatementLine('BD', 'Produits intermédiaires', actifCurrent, actifPrevious, 2),
      createStatementLine('BE', 'Produits finis', actifCurrent, actifPrevious, 2),
    ],

    // Créances
    creances: [
      createStatementLine('BG', 'Fournisseurs débiteurs', actifCurrent, actifPrevious, 2),
      createStatementLine('BH', 'Clients et comptes rattachés', actifCurrent, actifPrevious, 2),
      createStatementLine('BI', 'Personnel débiteur', actifCurrent, actifPrevious, 2),
      createStatementLine('BJ', 'État débiteur', actifCurrent, actifPrevious, 2),
      createStatementLine('BK', 'Autres débiteurs', actifCurrent, actifPrevious, 2),
    ],

    // Titres et valeurs
    titresEtValeursDepl: [
      createStatementLine('BL', 'Titres et valeurs de placement', actifCurrent, actifPrevious, 2),
    ],

    ecartsDeConversionActifCirculant: [
      createStatementLine('BO', 'Écarts de conversion - Actif (Circ.)', actifCurrent, actifPrevious, 2),
    ],

    totalActifCirculant: createTotalLine(
      'BZ',
      'TOTAL ACTIF CIRCULANT (II)',
      ['BA', 'BB', 'BC', 'BD', 'BE', 'BG', 'BH', 'BI', 'BJ', 'BK', 'BL', 'BO'],
      actifCurrent,
      actifPrevious,
      1
    ),

    // Trésorerie
    tresorerie: [
      createStatementLine('CA', 'Chèques et valeurs à encaisser', actifCurrent, actifPrevious, 2),
      createStatementLine('CB', 'Banques, TG et CP', actifCurrent, actifPrevious, 2),
      createStatementLine('CC', 'Caisses, régies d\'avances', actifCurrent, actifPrevious, 2),
    ],

    totalTresorerie: createTotalLine(
      'CZ',
      'TOTAL TRÉSORERIE - ACTIF (III)',
      ['CA', 'CB', 'CC'],
      actifCurrent,
      actifPrevious,
      1
    ),

    totalGeneral: createTotalLine(
      'TOTAL_ACTIF',
      'TOTAL GÉNÉRAL ACTIF (I + II + III)',
      ['AZ', 'BZ', 'CZ'],
      actifCurrent,
      actifPrevious,
      1
    ),
  };

  // Construire le PASSIF
  const passif = {
    // Capitaux propres
    capitauxPropres: [
      createStatementLine('DA', 'Capital social', passifCurrent, passifPrevious, 2),
      createStatementLine('DB', 'Primes d\'émission', passifCurrent, passifPrevious, 2),
      createStatementLine('DC', 'Écarts de réévaluation', passifCurrent, passifPrevious, 2),
      createStatementLine('DD', 'Réserve légale', passifCurrent, passifPrevious, 2),
      createStatementLine('DE', 'Autres réserves', passifCurrent, passifPrevious, 2),
      createStatementLine('DF', 'Résultats nets en instance', passifCurrent, passifPrevious, 2),
      createStatementLine('DG', 'Résultat net de l\'exercice', passifCurrent, passifPrevious, 2),
    ],

    // Capitaux propres assimilés
    capitauxPropresAssimiles: [
      createStatementLine('DH', 'Subventions d\'investissement', passifCurrent, passifPrevious, 2),
      createStatementLine('DI', 'Provisions réglementées', passifCurrent, passifPrevious, 2),
    ],

    // Dettes de financement
    dettesDeFinancement: [
      createStatementLine('DK', 'Emprunts obligataires', passifCurrent, passifPrevious, 2),
      createStatementLine('DL', 'Autres dettes de financement', passifCurrent, passifPrevious, 2),
    ],

    // Provisions pour risques
    provisionsRisquesEtCharges: [
      createStatementLine('DP', 'Provisions pour risques', passifCurrent, passifPrevious, 2),
      createStatementLine('DQ', 'Provisions pour charges', passifCurrent, passifPrevious, 2),
    ],

    // Écarts de conversion
    ecartsDeConversionPassif: [
      createStatementLine('DR', 'Écarts de conversion - Passif', passifCurrent, passifPrevious, 2),
    ],

    totalFinancementPermanent: createTotalLine(
      'DZ',
      'TOTAL FINANCEMENT PERMANENT (I)',
      ['DA', 'DB', 'DC', 'DD', 'DE', 'DF', 'DG', 'DH', 'DI', 'DK', 'DL', 'DP', 'DQ', 'DR'],
      passifCurrent,
      passifPrevious,
      1
    ),

    // Dettes du passif circulant
    dettesPassifCirculant: [
      createStatementLine('EA', 'Fournisseurs et comptes rattachés', passifCurrent, passifPrevious, 2),
      createStatementLine('EB', 'Clients créditeurs', passifCurrent, passifPrevious, 2),
      createStatementLine('EC', 'Personnel créditeur', passifCurrent, passifPrevious, 2),
      createStatementLine('ED', 'Organismes sociaux', passifCurrent, passifPrevious, 2),
      createStatementLine('EE', 'État créditeur', passifCurrent, passifPrevious, 2),
      createStatementLine('EF', 'Comptes de régularisation', passifCurrent, passifPrevious, 2),
      createStatementLine('EG', 'Autres créanciers', passifCurrent, passifPrevious, 2),
    ],

    autresProvisionsPourRisques: [
      createStatementLine('EH', 'Autres provisions pour risques', passifCurrent, passifPrevious, 2),
    ],

    ecartsDeConversionPassifCirculant: [
      createStatementLine('EJ', 'Écarts de conversion - Passif (Circ.)', passifCurrent, passifPrevious, 2),
    ],

    totalPassifCirculant: createTotalLine(
      'EZ',
      'TOTAL PASSIF CIRCULANT (II)',
      ['EA', 'EB', 'EC', 'ED', 'EE', 'EF', 'EG', 'EH', 'EJ'],
      passifCurrent,
      passifPrevious,
      1
    ),

    // Trésorerie passif
    tresoreriePassif: [
      createStatementLine('FA', 'Crédits d\'escompte', passifCurrent, passifPrevious, 2),
      createStatementLine('FB', 'Crédits de trésorerie', passifCurrent, passifPrevious, 2),
      createStatementLine('FC', 'Banques (soldes créditeurs)', passifCurrent, passifPrevious, 2),
    ],

    totalTresoreriePassif: createTotalLine(
      'FZ',
      'TOTAL TRÉSORERIE - PASSIF (III)',
      ['FA', 'FB', 'FC'],
      passifCurrent,
      passifPrevious,
      1
    ),

    totalGeneral: createTotalLine(
      'TOTAL_PASSIF',
      'TOTAL GÉNÉRAL PASSIF (I + II + III)',
      ['DZ', 'EZ', 'FZ'],
      passifCurrent,
      passifPrevious,
      1
    ),
  };

  // Vérification de l'équilibre
  const totalActif = actif.totalGeneral.currentYear;
  const totalPassif = passif.totalGeneral.currentYear;
  const difference = Math.abs(totalActif - totalPassif);
  const isBalanced = difference < 0.01;

  return {
    id: crypto.randomUUID(),
    fiscalYearId: fiscalYear.id,
    generatedAt: new Date(),
    generatedBy: userId,
    model,
    actif,
    passif,
    isBalanced,
    difference,
  };
}

// ============================================================================
// GÉNÉRATION DU CPC
// ============================================================================

/**
 * Génère le Compte de Produits et Charges conforme CGNC
 */
export function generateCPC(
  fiscalYear: FiscalYear,
  accounts: Account[],
  entries: Entry[],
  previousFiscalYear: FiscalYear | undefined,
  model: FinancialStatementModel,
  userId: string
): CPC {
  const { current, previous } = calculateAccountBalances(
    accounts,
    entries,
    fiscalYear,
    previousFiscalYear
  );

  const currentAccountsData = Array.from(current.entries()).map(([number, balance]) => ({
    number,
    balance,
  }));
  const previousAccountsData = Array.from(previous.entries()).map(([number, balance]) => ({
    number,
    balance,
  }));

  // Grouper par rubriques
  const produitsCurrent = groupAccountsByRubric(currentAccountsData, CPC_PRODUITS_MAPPING);
  const produitsPrevious = groupAccountsByRubric(previousAccountsData, CPC_PRODUITS_MAPPING);
  const chargesCurrent = groupAccountsByRubric(currentAccountsData, CPC_CHARGES_MAPPING);
  const chargesPrevious = groupAccountsByRubric(previousAccountsData, CPC_CHARGES_MAPPING);

  // PRODUITS D'EXPLOITATION
  const produitsExploitation = [
    createStatementLine('GA', 'Ventes de marchandises', produitsCurrent, produitsPrevious, 2),
    createStatementLine('GB', 'Ventes de biens et services', produitsCurrent, produitsPrevious, 2),
    createStatementLine('GC', 'Variation de stocks', produitsCurrent, produitsPrevious, 2),
    createStatementLine('GD', 'Immobilisations produites', produitsCurrent, produitsPrevious, 2),
    createStatementLine('GE', 'Subventions d\'exploitation', produitsCurrent, produitsPrevious, 2),
    createStatementLine('GF', 'Autres produits d\'exploitation', produitsCurrent, produitsPrevious, 2),
    createStatementLine('GG', 'Reprises d\'exploitation', produitsCurrent, produitsPrevious, 2),
  ];

  const totalProduitsExploitation = createTotalLine(
    'GZ',
    'TOTAL PRODUITS D\'EXPLOITATION (I)',
    ['GA', 'GB', 'GC', 'GD', 'GE', 'GF', 'GG'],
    produitsCurrent,
    produitsPrevious,
    1
  );

  // CHARGES D'EXPLOITATION
  const chargesExploitation = [
    createStatementLine('HA', 'Achats revendus', chargesCurrent, chargesPrevious, 2),
    createStatementLine('HB', 'Achats consommés', chargesCurrent, chargesPrevious, 2),
    createStatementLine('HC', 'Autres charges externes', chargesCurrent, chargesPrevious, 2),
    createStatementLine('HD', 'Impôts et taxes', chargesCurrent, chargesPrevious, 2),
    createStatementLine('HE', 'Charges de personnel', chargesCurrent, chargesPrevious, 2),
    createStatementLine('HF', 'Autres charges d\'exploitation', chargesCurrent, chargesPrevious, 2),
    createStatementLine('HG', 'Dotations d\'exploitation', chargesCurrent, chargesPrevious, 2),
  ];

  const totalChargesExploitation = createTotalLine(
    'HZ',
    'TOTAL CHARGES D\'EXPLOITATION (II)',
    ['HA', 'HB', 'HC', 'HD', 'HE', 'HF', 'HG'],
    chargesCurrent,
    chargesPrevious,
    1
  );

  // RÉSULTAT D'EXPLOITATION
  const resultatExploitation: StatementLine = {
    code: 'REX',
    label: 'RÉSULTAT D\'EXPLOITATION (I - II)',
    currentYear: totalProduitsExploitation.currentYear - totalChargesExploitation.currentYear,
    previousYear: (totalProduitsExploitation.previousYear || 0) - (totalChargesExploitation.previousYear || 0),
    level: 1,
    isBold: true,
    isCalculated: true,
  };

  // PRODUITS FINANCIERS
  const produitsFinanciers = [
    createStatementLine('IA', 'Produits des titres de participation', produitsCurrent, produitsPrevious, 2),
    createStatementLine('IB', 'Gains de change', produitsCurrent, produitsPrevious, 2),
    createStatementLine('IC', 'Intérêts et autres produits financiers', produitsCurrent, produitsPrevious, 2),
    createStatementLine('ID', 'Reprises financières', produitsCurrent, produitsPrevious, 2),
  ];

  const totalProduitsFinanciers = createTotalLine(
    'IZ',
    'TOTAL PRODUITS FINANCIERS (IV)',
    ['IA', 'IB', 'IC', 'ID'],
    produitsCurrent,
    produitsPrevious,
    1
  );

  // CHARGES FINANCIÈRES
  const chargesFinancieres = [
    createStatementLine('JA', 'Charges d\'intérêts', chargesCurrent, chargesPrevious, 2),
    createStatementLine('JB', 'Pertes de change', chargesCurrent, chargesPrevious, 2),
    createStatementLine('JC', 'Autres charges financières', chargesCurrent, chargesPrevious, 2),
    createStatementLine('JD', 'Dotations financières', chargesCurrent, chargesPrevious, 2),
  ];

  const totalChargesFinancieres = createTotalLine(
    'JZ',
    'TOTAL CHARGES FINANCIÈRES (V)',
    ['JA', 'JB', 'JC', 'JD'],
    chargesCurrent,
    chargesPrevious,
    1
  );

  // RÉSULTAT FINANCIER
  const resultatFinancier: StatementLine = {
    code: 'RFI',
    label: 'RÉSULTAT FINANCIER (IV - V)',
    currentYear: totalProduitsFinanciers.currentYear - totalChargesFinancieres.currentYear,
    previousYear: (totalProduitsFinanciers.previousYear || 0) - (totalChargesFinancieres.previousYear || 0),
    level: 1,
    isBold: true,
    isCalculated: true,
  };

  // RÉSULTAT COURANT
  const resultatCourant: StatementLine = {
    code: 'RCO',
    label: 'RÉSULTAT COURANT (III + VI)',
    currentYear: resultatExploitation.currentYear + resultatFinancier.currentYear,
    previousYear: (resultatExploitation.previousYear || 0) + (resultatFinancier.previousYear || 0),
    level: 1,
    isBold: true,
    isCalculated: true,
  };

  // PRODUITS NON COURANTS
  const produitsNonCourants = [
    createStatementLine('KA', 'Produits des cessions', produitsCurrent, produitsPrevious, 2),
    createStatementLine('KB', 'Subventions d\'équilibre', produitsCurrent, produitsPrevious, 2),
    createStatementLine('KC', 'Reprises sur subventions', produitsCurrent, produitsPrevious, 2),
    createStatementLine('KD', 'Autres produits non courants', produitsCurrent, produitsPrevious, 2),
    createStatementLine('KE', 'Reprises non courantes', produitsCurrent, produitsPrevious, 2),
  ];

  const totalProduitsNonCourants = createTotalLine(
    'KZ',
    'TOTAL PRODUITS NON COURANTS (VIII)',
    ['KA', 'KB', 'KC', 'KD', 'KE'],
    produitsCurrent,
    produitsPrevious,
    1
  );

  // CHARGES NON COURANTES
  const chargesNonCourantes = [
    createStatementLine('LA', 'VNA des immobilisations cédées', chargesCurrent, chargesPrevious, 2),
    createStatementLine('LB', 'Subventions accordées', chargesCurrent, chargesPrevious, 2),
    createStatementLine('LC', 'Autres charges non courantes', chargesCurrent, chargesPrevious, 2),
    createStatementLine('LD', 'Dotations non courantes', chargesCurrent, chargesPrevious, 2),
  ];

  const totalChargesNonCourantes = createTotalLine(
    'LZ',
    'TOTAL CHARGES NON COURANTES (IX)',
    ['LA', 'LB', 'LC', 'LD'],
    chargesCurrent,
    chargesPrevious,
    1
  );

  // RÉSULTAT NON COURANT
  const resultatNonCourant: StatementLine = {
    code: 'RNC',
    label: 'RÉSULTAT NON COURANT (VIII - IX)',
    currentYear: totalProduitsNonCourants.currentYear - totalChargesNonCourantes.currentYear,
    previousYear: (totalProduitsNonCourants.previousYear || 0) - (totalChargesNonCourantes.previousYear || 0),
    level: 1,
    isBold: true,
    isCalculated: true,
  };

  // RÉSULTAT AVANT IMPÔTS
  const resultatAvantImpots: StatementLine = {
    code: 'RAI',
    label: 'RÉSULTAT AVANT IMPÔTS (VII + X)',
    currentYear: resultatCourant.currentYear + resultatNonCourant.currentYear,
    previousYear: (resultatCourant.previousYear || 0) + (resultatNonCourant.previousYear || 0),
    level: 1,
    isBold: true,
    isCalculated: true,
  };

  // IMPÔTS SUR LES RÉSULTATS
  const impotsSurResultats = createStatementLine('MA', 'Impôts sur les résultats', chargesCurrent, chargesPrevious, 2);

  // RÉSULTAT NET
  const resultatNet: StatementLine = {
    code: 'RNE',
    label: 'RÉSULTAT NET (XI - MA)',
    currentYear: resultatAvantImpots.currentYear - impotsSurResultats.currentYear,
    previousYear: (resultatAvantImpots.previousYear || 0) - (impotsSurResultats.previousYear || 0),
    level: 1,
    isBold: true,
    isCalculated: true,
  };

  // Calcul des totaux pour cohérence
  const totalProduits =
    totalProduitsExploitation.currentYear +
    totalProduitsFinanciers.currentYear +
    totalProduitsNonCourants.currentYear;

  const totalCharges =
    totalChargesExploitation.currentYear +
    totalChargesFinancieres.currentYear +
    totalChargesNonCourantes.currentYear +
    impotsSurResultats.currentYear;

  const isCoherent = Math.abs(resultatNet.currentYear - (totalProduits - totalCharges)) < 0.01;

  return {
    id: crypto.randomUUID(),
    fiscalYearId: fiscalYear.id,
    generatedAt: new Date(),
    generatedBy: userId,
    model,
    produitsExploitation,
    totalProduitsExploitation,
    chargesExploitation,
    totalChargesExploitation,
    resultatExploitation,
    produitsFinanciers,
    totalProduitsFinanciers,
    chargesFinancieres,
    totalChargesFinancieres,
    resultatFinancier,
    resultatCourant,
    produitsNonCourants,
    totalProduitsNonCourants,
    chargesNonCourantes,
    totalChargesNonCourantes,
    resultatNonCourant,
    resultatAvantImpots,
    impotsSurResultats,
    resultatNet,
    totalProduits,
    totalCharges,
    isCoherent,
  };
}

// ============================================================================
// GÉNÉRATION DE L'ESG (Modèle NORMAL uniquement)
// ============================================================================

/**
 * Génère l'État des Soldes de Gestion (modèle NORMAL uniquement)
 */
export function generateESG(
  fiscalYear: FiscalYear,
  cpc: CPC,
  userId: string
): ESG | null {
  // ESG uniquement pour le modèle NORMAL
  if (cpc.model === 'SIMPLIFIE') {
    return null;
  }

  // Construction du TFR (Tableau de Formation des Résultats)
  const production: StatementLine = {
    code: 'PROD',
    label: 'PRODUCTION DE L\'EXERCICE',
    currentYear:
      (cpc.produitsExploitation.find(p => p.code === 'GB')?.currentYear || 0) +
      (cpc.produitsExploitation.find(p => p.code === 'GC')?.currentYear || 0) +
      (cpc.produitsExploitation.find(p => p.code === 'GD')?.currentYear || 0),
    level: 1,
    isBold: true,
    isCalculated: true,
  };

  const consommation: StatementLine = {
    code: 'CONS',
    label: 'CONSOMMATION DE L\'EXERCICE',
    currentYear:
      (cpc.chargesExploitation.find(c => c.code === 'HB')?.currentYear || 0) +
      (cpc.chargesExploitation.find(c => c.code === 'HC')?.currentYear || 0),
    level: 1,
    isBold: true,
    isCalculated: true,
  };

  const valeurAjoutee: StatementLine = {
    code: 'VA',
    label: 'VALEUR AJOUTÉE (I - II)',
    currentYear: production.currentYear - consommation.currentYear,
    level: 1,
    isBold: true,
    isCalculated: true,
  };

  const ebe: StatementLine = {
    code: 'EBE',
    label: 'EXCÉDENT BRUT D\'EXPLOITATION',
    currentYear:
      valeurAjoutee.currentYear +
      (cpc.produitsExploitation.find(p => p.code === 'GE')?.currentYear || 0) -
      (cpc.chargesExploitation.find(c => c.code === 'HD')?.currentYear || 0) -
      (cpc.chargesExploitation.find(c => c.code === 'HE')?.currentYear || 0),
    level: 1,
    isBold: true,
    isCalculated: true,
  };

  // Capacité d'autofinancement (CAF)
  const caf: StatementLine = {
    code: 'CAF',
    label: 'CAPACITÉ D\'AUTOFINANCEMENT',
    currentYear: cpc.resultatNet.currentYear + (cpc.chargesExploitation.find(c => c.code === 'HG')?.currentYear || 0),
    level: 1,
    isBold: true,
    isCalculated: true,
  };

  const autofinancement: StatementLine = {
    code: 'AF',
    label: 'AUTOFINANCEMENT',
    currentYear: caf.currentYear,
    level: 1,
    isBold: true,
    isCalculated: true,
  };

  return {
    id: crypto.randomUUID(),
    fiscalYearId: fiscalYear.id,
    generatedAt: new Date(),
    generatedBy: userId,
    tfr: {
      ventesProduitsEtServices: cpc.produitsExploitation.find(p => p.code === 'GB')!,
      variationStocksProduits: cpc.produitsExploitation.find(p => p.code === 'GC')!,
      immobilisationsProduitesPar: cpc.produitsExploitation.find(p => p.code === 'GD')!,
      production,
      achatsConsommes: cpc.chargesExploitation.find(c => c.code === 'HB')!,
      autresChargesExternes: cpc.chargesExploitation.find(c => c.code === 'HC')!,
      consommation,
      valeurAjoutee,
      subventionsExploitation: cpc.produitsExploitation.find(p => p.code === 'GE')!,
      impotsTaxes: cpc.chargesExploitation.find(c => c.code === 'HD')!,
      chargesPersonnel: cpc.chargesExploitation.find(c => c.code === 'HE')!,
      ebe,
      autresProduits: cpc.produitsExploitation.find(p => p.code === 'GF')!,
      autresCharges: cpc.chargesExploitation.find(c => c.code === 'HF')!,
      dotationsAmortissements: cpc.chargesExploitation.find(c => c.code === 'HG')!,
      reprisesExploitation: cpc.produitsExploitation.find(p => p.code === 'GG')!,
      resultatExploitation: cpc.resultatExploitation,
      resultatFinancier: cpc.resultatFinancier,
      resultatCourant: cpc.resultatCourant,
      resultatNonCourant: cpc.resultatNonCourant,
      resultatAvantImpots: cpc.resultatAvantImpots,
      impots: cpc.impotsSurResultats,
      resultatNet: cpc.resultatNet,
    },
    caf: {
      resultatNet: cpc.resultatNet,
      dotationsAmortissements: cpc.chargesExploitation.find(c => c.code === 'HG')!,
      dotationsProvisions: { code: 'DPR', label: 'Dotations provisions', currentYear: 0, level: 2 },
      valeursNettesImmobilisations: cpc.chargesNonCourantes.find(c => c.code === 'LA')!,
      reprisesAmortissements: { code: 'RAC', label: 'Reprises amortissements', currentYear: 0, level: 2 },
      reprisesProvisions: { code: 'RPR', label: 'Reprises provisions', currentYear: 0, level: 2 },
      produitsDesCessions: cpc.produitsNonCourants.find(p => p.code === 'KA')!,
      caf,
      distributions: { code: 'DIV', label: 'Distributions', currentYear: 0, level: 2 },
      autofinancement,
    },
  };
}

// ============================================================================
// GÉNÉRATION DU TABLEAU DE FINANCEMENT
// ============================================================================

/**
 * Génère le Tableau de Financement conforme CGNC
 */
export function generateTableauFinancement(
  fiscalYear: FiscalYear,
  bilan: Bilan,
  cpc: CPC,
  esg: ESG | null,
  userId: string
): TableauFinancement {
  const caf = esg?.caf.caf.currentYear || 0;

  // Emplois
  const emplois = {
    acquisitionsImmobilisations: [],
    remboursementsDettes: [],
    emploisEnNonValeurs: [],
    autresEmplois: [],
    totalEmplois: {
      code: 'TE',
      label: 'TOTAL EMPLOIS',
      currentYear: 0,
      level: 1,
      isBold: true,
      isCalculated: true,
    },
  };

  // Ressources
  const ressources = {
    caf: {
      code: 'CAF',
      label: 'Capacité d\'autofinancement',
      currentYear: caf,
      level: 2,
    },
    cessions: [],
    augmentationCapital: [],
    nouvellesDettesFin: [],
    autresRessources: [],
    totalRessources: {
      code: 'TR',
      label: 'TOTAL RESSOURCES',
      currentYear: caf,
      level: 1,
      isBold: true,
      isCalculated: true,
    },
  };

  // Variations
  const variationBFR: StatementLine = {
    code: 'VBFR',
    label: 'VARIATION DU BFR',
    currentYear: 0,
    level: 1,
    isBold: true,
    isCalculated: true,
  };

  const variationTresorerie: StatementLine = {
    code: 'VT',
    label: 'VARIATION DE TRÉSORERIE',
    currentYear:
      (bilan.actif.totalTresorerie.currentYear - (bilan.passif.totalTresoreriePassif.currentYear || 0)) -
      ((bilan.actif.totalTresorerie.previousYear || 0) - (bilan.passif.totalTresoreriePassif.previousYear || 0)),
    level: 1,
    isBold: true,
    isCalculated: true,
  };

  const isBalanced = Math.abs(ressources.totalRessources.currentYear - emplois.totalEmplois.currentYear) < 0.01;

  return {
    id: crypto.randomUUID(),
    fiscalYearId: fiscalYear.id,
    generatedAt: new Date(),
    generatedBy: userId,
    model: cpc.model,
    syntheseMasses: {
      emplois: [],
      ressources: [],
      variationFondsRoulement: {
        code: 'VFR',
        label: 'VARIATION FONDS DE ROULEMENT',
        currentYear: 0,
        level: 1,
        isBold: true,
        isCalculated: true,
      },
    },
    emplois,
    ressources,
    variationBFR,
    variationTresorerie,
    isBalanced,
    difference: ressources.totalRessources.currentYear - emplois.totalEmplois.currentYear,
  };
}

// ============================================================================
// GÉNÉRATION DE L'ETIC
// ============================================================================

/**
 * Génère l'ETIC (État des Informations Complémentaires)
 */
export function generateETIC(
  fiscalYear: FiscalYear,
  companySettings: CompanySettings,
  model: FinancialStatementModel,
  userId: string
): ETIC {
  const sections: ETICSection[] = [
    {
      id: crypto.randomUUID(),
      code: 'A',
      title: 'Principes et méthodes comptables',
      order: 1,
      content: '## Principes et méthodes comptables\n\nLes états de synthèse sont établis conformément aux dispositions du CGNC.',
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      code: 'B',
      title: 'Règles d\'évaluation',
      order: 2,
      content: '## Règles d\'évaluation\n\n- Immobilisations : Coût d\'acquisition\n- Stocks : FIFO\n- Créances : Valeur nominale',
      isRequired: true,
    },
    {
      id: crypto.randomUUID(),
      code: 'C',
      title: 'État des immobilisations',
      order: 3,
      content: '## État des immobilisations\n\nTableau détaillé des immobilisations.',
      isRequired: true,
      tables: [],
    },
  ];

  return {
    id: crypto.randomUUID(),
    fiscalYearId: fiscalYear.id,
    generatedAt: new Date(),
    generatedBy: userId,
    model,
    sections,
  };
}

// ============================================================================
// GÉNÉRATION DU PACK COMPLET
// ============================================================================

/**
 * Génère le pack complet des états de synthèse
 */
export function generateFinancialStatementsPack(
  fiscalYear: FiscalYear,
  accounts: Account[],
  entries: Entry[],
  previousFiscalYear: FiscalYear | undefined,
  companySettings: CompanySettings,
  userId: string
): FinancialStatementsPack {
  // Déterminer le modèle
  const model = determineStatementModel(fiscalYear, entries);

  // Générer chaque état
  const bilan = generateBilan(fiscalYear, accounts, entries, previousFiscalYear, model, userId);
  const cpc = generateCPC(fiscalYear, accounts, entries, previousFiscalYear, model, userId);
  const esg = model === 'NORMAL' ? generateESG(fiscalYear, cpc, userId) : undefined;
  const tableauFinancement = generateTableauFinancement(fiscalYear, bilan, cpc, esg || null, userId);
  const etic = generateETIC(fiscalYear, companySettings, model, userId);

  // Valider les états
  const validations = validateFinancialStatements(bilan, cpc, esg, tableauFinancement, etic);

  return {
    id: crypto.randomUUID(),
    fiscalYearId: fiscalYear.id,
    model,
    generatedAt: new Date(),
    generatedBy: userId,
    bilan,
    cpc,
    esg,
    tableauFinancement,
    etic,
    validations,
    status: 'DRAFT',
  };
}

// ============================================================================
// VALIDATION DES ÉTATS
// ============================================================================

/**
 * Valide tous les états de synthèse
 */
export function validateFinancialStatements(
  bilan: Bilan,
  cpc: CPC,
  esg: ESG | null,
  tf: TableauFinancement,
  etic: ETIC
): StatementValidation[] {
  const validations: StatementValidation[] = [];

  // Validation du Bilan
  const bilanErrors: StatementValidationError[] = [];
  const bilanWarnings: StatementValidationWarning[] = [];

  if (!bilan.isBalanced) {
    bilanErrors.push({
      code: 'BILAN_NOT_BALANCED',
      message: `Le bilan n'est pas équilibré. Différence: ${bilan.difference.toFixed(2)} MAD`,
      details: { difference: bilan.difference },
    });
  }

  validations.push({
    statementType: 'BL',
    isValid: bilanErrors.length === 0,
    errors: bilanErrors,
    warnings: bilanWarnings,
  });

  // Validation du CPC
  const cpcErrors: StatementValidationError[] = [];
  const cpcWarnings: StatementValidationWarning[] = [];

  if (!cpc.isCoherent) {
    cpcErrors.push({
      code: 'CPC_NOT_COHERENT',
      message: 'Le CPC présente des incohérences de calcul',
    });
  }

  // Vérifier la cohérence avec le Bilan
  const bilanResultat = bilan.passif.capitauxPropres.find(line => line.code === 'DG');
  if (bilanResultat && Math.abs(bilanResultat.currentYear - cpc.resultatNet.currentYear) > 0.01) {
    cpcWarnings.push({
      code: 'CPC_BILAN_MISMATCH',
      message: 'Le résultat du CPC ne correspond pas au résultat du Bilan',
      details: {
        cpcResultat: cpc.resultatNet.currentYear,
        bilanResultat: bilanResultat.currentYear,
      },
    });
  }

  validations.push({
    statementType: 'CPC',
    isValid: cpcErrors.length === 0,
    errors: cpcErrors,
    warnings: cpcWarnings,
  });

  // Validation ESG (si présent)
  if (esg) {
    validations.push({
      statementType: 'ESG',
      isValid: true,
      errors: [],
      warnings: [],
    });
  }

  // Validation TF
  const tfErrors: StatementValidationError[] = [];
  if (!tf.isBalanced) {
    tfErrors.push({
      code: 'TF_NOT_BALANCED',
      message: 'Le tableau de financement n\'est pas équilibré',
      details: { difference: tf.difference },
    });
  }

  validations.push({
    statementType: 'TF',
    isValid: tfErrors.length === 0,
    errors: tfErrors,
    warnings: [],
  });

  // Validation ETIC
  validations.push({
    statementType: 'ETIC',
    isValid: true,
    errors: [],
    warnings: [],
  });

  return validations;
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Crée une ligne de rubrique
 */
function createStatementLine(
  code: string,
  label: string,
  currentRubrics: Record<string, number>,
  previousRubrics: Record<string, number>,
  level: number
): StatementLine {
  return {
    code,
    label,
    currentYear: currentRubrics[code] || 0,
    previousYear: previousRubrics[code] || 0,
    level,
    isBold: level === 1,
  };
}

/**
 * Crée une ligne de total
 */
function createTotalLine(
  code: string,
  label: string,
  sumCodes: string[],
  currentRubrics: Record<string, number>,
  previousRubrics: Record<string, number>,
  level: number
): StatementLine {
  const currentYear = sumCodes.reduce((sum, c) => sum + (currentRubrics[c] || 0), 0);
  const previousYear = sumCodes.reduce((sum, c) => sum + (previousRubrics[c] || 0), 0);

  return {
    code,
    label,
    currentYear,
    previousYear,
    level,
    isBold: true,
    isCalculated: true,
  };
}
