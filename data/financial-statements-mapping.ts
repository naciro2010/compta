/**
 * Mapping CGNC vers les États de Synthèse (EPIC 3)
 * Conformité avec le Plan Comptable Général Marocain
 *
 * Ce fichier définit comment les comptes du plan CGNC sont mappés
 * vers les rubriques des états de synthèse (BL, CPC, ESG, TF)
 */

import { AccountMapping } from '@/types/financial-statements';

// ============================================================================
// BILAN - ACTIF
// ============================================================================

export const BILAN_ACTIF_MAPPING: AccountMapping[] = [
  // IMMOBILISATIONS EN NON-VALEURS (AA à AE)
  {
    accountRange: '211',
    statementType: 'BL',
    rubricCode: 'AA',
    rubricLabel: 'Frais préliminaires',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '212',
    statementType: 'BL',
    rubricCode: 'AB',
    rubricLabel: 'Charges à répartir sur plusieurs exercices',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '213',
    statementType: 'BL',
    rubricCode: 'AC',
    rubricLabel: 'Primes de remboursement des obligations',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // IMMOBILISATIONS INCORPORELLES (AF à AJ)
  {
    accountRange: '221',
    statementType: 'BL',
    rubricCode: 'AF',
    rubricLabel: 'Immobilisations en recherche et développement',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '222',
    statementType: 'BL',
    rubricCode: 'AG',
    rubricLabel: 'Brevets, marques, droits et valeurs similaires',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '223',
    statementType: 'BL',
    rubricCode: 'AH',
    rubricLabel: 'Fonds commercial',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '228',
    statementType: 'BL',
    rubricCode: 'AI',
    rubricLabel: 'Autres immobilisations incorporelles',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // IMMOBILISATIONS CORPORELLES (AK à AP)
  {
    accountRange: '231',
    statementType: 'BL',
    rubricCode: 'AK',
    rubricLabel: 'Terrains',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '232',
    statementType: 'BL',
    rubricCode: 'AL',
    rubricLabel: 'Constructions',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '233',
    statementType: 'BL',
    rubricCode: 'AM',
    rubricLabel: 'Installations techniques, matériel et outillage',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '234',
    statementType: 'BL',
    rubricCode: 'AN',
    rubricLabel: 'Matériel de transport',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '235',
    statementType: 'BL',
    rubricCode: 'AO',
    rubricLabel: 'Mobilier, matériel de bureau et aménagements divers',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '238',
    statementType: 'BL',
    rubricCode: 'AP',
    rubricLabel: 'Autres immobilisations corporelles',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '239',
    statementType: 'BL',
    rubricCode: 'AP',
    rubricLabel: 'Immobilisations corporelles en cours',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // IMMOBILISATIONS FINANCIÈRES (AQ à AT)
  {
    accountRange: '241-248',
    statementType: 'BL',
    rubricCode: 'AQ',
    rubricLabel: 'Prêts immobilisés',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '251',
    statementType: 'BL',
    rubricCode: 'AR',
    rubricLabel: 'Titres de participation',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '258',
    statementType: 'BL',
    rubricCode: 'AS',
    rubricLabel: 'Autres titres immobilisés',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // ÉCARTS DE CONVERSION ACTIF (AU)
  {
    accountRange: '27',
    statementType: 'BL',
    rubricCode: 'AU',
    rubricLabel: 'Écarts de conversion - Actif',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // STOCKS (BA à BF)
  {
    accountRange: '311',
    statementType: 'BL',
    rubricCode: 'BA',
    rubricLabel: 'Marchandises',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '312',
    statementType: 'BL',
    rubricCode: 'BB',
    rubricLabel: 'Matières et fournitures consommables',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '313',
    statementType: 'BL',
    rubricCode: 'BC',
    rubricLabel: 'Produits en cours',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '314',
    statementType: 'BL',
    rubricCode: 'BD',
    rubricLabel: 'Produits intermédiaires et produits résiduels',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '315',
    statementType: 'BL',
    rubricCode: 'BE',
    rubricLabel: 'Produits finis',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // CRÉANCES DE L'ACTIF CIRCULANT (BG à BK)
  {
    accountRange: '342',
    statementType: 'BL',
    rubricCode: 'BG',
    rubricLabel: 'Fournisseurs débiteurs, avances et acomptes',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '341-343-346-348',
    statementType: 'BL',
    rubricCode: 'BH',
    rubricLabel: 'Clients et comptes rattachés',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '345',
    statementType: 'BL',
    rubricCode: 'BI',
    rubricLabel: 'Personnel débiteur',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '3451',
    statementType: 'BL',
    rubricCode: 'BJ',
    rubricLabel: 'État débiteur',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '349',
    statementType: 'BL',
    rubricCode: 'BK',
    rubricLabel: 'Comptes de régularisation - Actif',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '3424-3425',
    statementType: 'BL',
    rubricCode: 'BK',
    rubricLabel: 'Autres débiteurs',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // TITRES ET VALEURS DE PLACEMENT (BL à BN)
  {
    accountRange: '350',
    statementType: 'BL',
    rubricCode: 'BL',
    rubricLabel: 'Titres et valeurs de placement',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // TRÉSORERIE - ACTIF (CA à CC)
  {
    accountRange: '511-514',
    statementType: 'BL',
    rubricCode: 'CA',
    rubricLabel: 'Chèques et valeurs à encaisser',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '5141',
    statementType: 'BL',
    rubricCode: 'CB',
    rubricLabel: 'Banques, TG et CP',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '516',
    statementType: 'BL',
    rubricCode: 'CC',
    rubricLabel: 'Caisses, régies d\'avances et accréditifs',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
];

// ============================================================================
// BILAN - PASSIF
// ============================================================================

export const BILAN_PASSIF_MAPPING: AccountMapping[] = [
  // CAPITAUX PROPRES (DA à DG)
  {
    accountRange: '1111-1112-1113-1114-1115',
    statementType: 'BL',
    rubricCode: 'DA',
    rubricLabel: 'Capital social ou personnel',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '1117-1118-1119',
    statementType: 'BL',
    rubricCode: 'DA',
    rubricLabel: 'Moins : Actionnaires, capital souscrit non appelé',
    sign: -1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '112',
    statementType: 'BL',
    rubricCode: 'DB',
    rubricLabel: 'Primes d\'émission, de fusion et d\'apport',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '113',
    statementType: 'BL',
    rubricCode: 'DC',
    rubricLabel: 'Écarts de réévaluation',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '114',
    statementType: 'BL',
    rubricCode: 'DD',
    rubricLabel: 'Réserve légale',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '115-116',
    statementType: 'BL',
    rubricCode: 'DE',
    rubricLabel: 'Autres réserves',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '118',
    statementType: 'BL',
    rubricCode: 'DF',
    rubricLabel: 'Résultats nets en instance d\'affectation',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '119',
    statementType: 'BL',
    rubricCode: 'DG',
    rubricLabel: 'Résultat net de l\'exercice',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // CAPITAUX PROPRES ASSIMILÉS (DH à DJ)
  {
    accountRange: '131',
    statementType: 'BL',
    rubricCode: 'DH',
    rubricLabel: 'Subventions d\'investissement',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '135',
    statementType: 'BL',
    rubricCode: 'DI',
    rubricLabel: 'Provisions réglementées',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // DETTES DE FINANCEMENT (DK à DO)
  {
    accountRange: '141',
    statementType: 'BL',
    rubricCode: 'DK',
    rubricLabel: 'Emprunts obligataires',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '148',
    statementType: 'BL',
    rubricCode: 'DL',
    rubricLabel: 'Autres dettes de financement',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // PROVISIONS DURABLES POUR RISQUES ET CHARGES (DP à DQ)
  {
    accountRange: '151',
    statementType: 'BL',
    rubricCode: 'DP',
    rubricLabel: 'Provisions pour risques',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '155',
    statementType: 'BL',
    rubricCode: 'DQ',
    rubricLabel: 'Provisions pour charges',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // ÉCARTS DE CONVERSION - PASSIF (DR)
  {
    accountRange: '17',
    statementType: 'BL',
    rubricCode: 'DR',
    rubricLabel: 'Écarts de conversion - Passif',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // DETTES DU PASSIF CIRCULANT (EA à EH)
  {
    accountRange: '441-442-443-444-446-448',
    statementType: 'BL',
    rubricCode: 'EA',
    rubricLabel: 'Fournisseurs et comptes rattachés',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '441',
    statementType: 'BL',
    rubricCode: 'EB',
    rubricLabel: 'Clients créditeurs, avances et acomptes',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '443',
    statementType: 'BL',
    rubricCode: 'EC',
    rubricLabel: 'Personnel créditeur',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '444-445',
    statementType: 'BL',
    rubricCode: 'ED',
    rubricLabel: 'Organismes sociaux',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '4452-4453-4455-4456-4457-4458',
    statementType: 'BL',
    rubricCode: 'EE',
    rubricLabel: 'État créditeur',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '449',
    statementType: 'BL',
    rubricCode: 'EF',
    rubricLabel: 'Comptes de régularisation - Passif',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '4481-4483-4484-4485-4488',
    statementType: 'BL',
    rubricCode: 'EG',
    rubricLabel: 'Autres créanciers',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '45',
    statementType: 'BL',
    rubricCode: 'EH',
    rubricLabel: 'Autres provisions pour risques et charges',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // TRÉSORERIE - PASSIF (FA à FC)
  {
    accountRange: '5520-5525',
    statementType: 'BL',
    rubricCode: 'FA',
    rubricLabel: 'Crédits d\'escompte',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '553-5530',
    statementType: 'BL',
    rubricCode: 'FB',
    rubricLabel: 'Crédits de trésorerie',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '5541-5548',
    statementType: 'BL',
    rubricCode: 'FC',
    rubricLabel: 'Banques (soldes créditeurs)',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
];

// ============================================================================
// CPC - PRODUITS
// ============================================================================

export const CPC_PRODUITS_MAPPING: AccountMapping[] = [
  // PRODUITS D'EXPLOITATION (GA à GH)
  {
    accountRange: '711',
    statementType: 'CPC',
    rubricCode: 'GA',
    rubricLabel: 'Ventes de marchandises',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '712',
    statementType: 'CPC',
    rubricCode: 'GB',
    rubricLabel: 'Ventes de biens et services produits',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '713',
    statementType: 'CPC',
    rubricCode: 'GC',
    rubricLabel: 'Variation de stocks de produits',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '714',
    statementType: 'CPC',
    rubricCode: 'GD',
    rubricLabel: 'Immobilisations produites par l\'entreprise pour elle-même',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '716',
    statementType: 'CPC',
    rubricCode: 'GE',
    rubricLabel: 'Subventions d\'exploitation',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '718',
    statementType: 'CPC',
    rubricCode: 'GF',
    rubricLabel: 'Autres produits d\'exploitation',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '719',
    statementType: 'CPC',
    rubricCode: 'GG',
    rubricLabel: 'Reprises d\'exploitation, transferts de charges',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // PRODUITS FINANCIERS (IA à IF)
  {
    accountRange: '732',
    statementType: 'CPC',
    rubricCode: 'IA',
    rubricLabel: 'Produits des titres de participation et autres titres immobilisés',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '733',
    statementType: 'CPC',
    rubricCode: 'IB',
    rubricLabel: 'Gains de change',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '738',
    statementType: 'CPC',
    rubricCode: 'IC',
    rubricLabel: 'Intérêts et autres produits financiers',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '739',
    statementType: 'CPC',
    rubricCode: 'ID',
    rubricLabel: 'Reprises financières, transferts de charges',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // PRODUITS NON COURANTS (KA à KE)
  {
    accountRange: '751',
    statementType: 'CPC',
    rubricCode: 'KA',
    rubricLabel: 'Produits des cessions d\'immobilisations',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '756',
    statementType: 'CPC',
    rubricCode: 'KB',
    rubricLabel: 'Subventions d\'équilibre',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '757',
    statementType: 'CPC',
    rubricCode: 'KC',
    rubricLabel: 'Reprises sur subventions d\'investissement',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '758',
    statementType: 'CPC',
    rubricCode: 'KD',
    rubricLabel: 'Autres produits non courants',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '759',
    statementType: 'CPC',
    rubricCode: 'KE',
    rubricLabel: 'Reprises non courantes, transferts de charges',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
];

// ============================================================================
// CPC - CHARGES
// ============================================================================

export const CPC_CHARGES_MAPPING: AccountMapping[] = [
  // CHARGES D'EXPLOITATION (HA à HN)
  {
    accountRange: '611',
    statementType: 'CPC',
    rubricCode: 'HA',
    rubricLabel: 'Achats revendus de marchandises',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '612',
    statementType: 'CPC',
    rubricCode: 'HB',
    rubricLabel: 'Achats consommés de matières et fournitures',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '613-614',
    statementType: 'CPC',
    rubricCode: 'HC',
    rubricLabel: 'Autres charges externes',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '616',
    statementType: 'CPC',
    rubricCode: 'HD',
    rubricLabel: 'Impôts et taxes',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '617',
    statementType: 'CPC',
    rubricCode: 'HE',
    rubricLabel: 'Charges de personnel',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '618',
    statementType: 'CPC',
    rubricCode: 'HF',
    rubricLabel: 'Autres charges d\'exploitation',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '619',
    statementType: 'CPC',
    rubricCode: 'HG',
    rubricLabel: 'Dotations d\'exploitation',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // CHARGES FINANCIÈRES (JA à JF)
  {
    accountRange: '631',
    statementType: 'CPC',
    rubricCode: 'JA',
    rubricLabel: 'Charges d\'intérêts',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '633',
    statementType: 'CPC',
    rubricCode: 'JB',
    rubricLabel: 'Pertes de change',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '638',
    statementType: 'CPC',
    rubricCode: 'JC',
    rubricLabel: 'Autres charges financières',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '639',
    statementType: 'CPC',
    rubricCode: 'JD',
    rubricLabel: 'Dotations financières',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // CHARGES NON COURANTES (LA à LE)
  {
    accountRange: '651',
    statementType: 'CPC',
    rubricCode: 'LA',
    rubricLabel: 'Valeurs nettes d\'amortissements des immobilisations cédées',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '656',
    statementType: 'CPC',
    rubricCode: 'LB',
    rubricLabel: 'Subventions accordées',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '658',
    statementType: 'CPC',
    rubricCode: 'LC',
    rubricLabel: 'Autres charges non courantes',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
  {
    accountRange: '659',
    statementType: 'CPC',
    rubricCode: 'LD',
    rubricLabel: 'Dotations non courantes aux amortissements et provisions',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },

  // IMPÔTS SUR LES RÉSULTATS (MA)
  {
    accountRange: '670',
    statementType: 'CPC',
    rubricCode: 'MA',
    rubricLabel: 'Impôts sur les résultats',
    sign: 1,
    model: ['NORMAL', 'SIMPLIFIE'],
  },
];

// ============================================================================
// Seuil pour déterminer le modèle
// ============================================================================

export const STATEMENT_MODEL_THRESHOLD = {
  revenueThresholdMAD: 10_000_000, // 10 millions MAD
};

// ============================================================================
// Fonctions utilitaires de mapping
// ============================================================================

/**
 * Vérifie si un compte correspond à une plage de comptes
 */
export function accountMatchesRange(accountNumber: string, range: string): boolean {
  // Gestion des plages simples (ex: "211")
  if (!range.includes('-') && !range.includes('*')) {
    return accountNumber.startsWith(range);
  }

  // Gestion des wildcards (ex: "61*")
  if (range.includes('*')) {
    const prefix = range.replace('*', '');
    return accountNumber.startsWith(prefix);
  }

  // Gestion des plages (ex: "212-218")
  if (range.includes('-')) {
    const [start, end] = range.split('-');
    const accountNum = parseInt(accountNumber.substring(0, start.length));
    const startNum = parseInt(start);
    const endNum = parseInt(end);
    return accountNum >= startNum && accountNum <= endNum;
  }

  return false;
}

/**
 * Trouve tous les mappings pour un compte donné
 */
export function findMappingsForAccount(
  accountNumber: string,
  statementType: 'BL' | 'CPC',
  section: 'ACTIF' | 'PASSIF' | 'PRODUITS' | 'CHARGES'
): AccountMapping[] {
  let mappings: AccountMapping[] = [];

  if (statementType === 'BL') {
    if (section === 'ACTIF') {
      mappings = BILAN_ACTIF_MAPPING;
    } else {
      mappings = BILAN_PASSIF_MAPPING;
    }
  } else {
    if (section === 'PRODUITS') {
      mappings = CPC_PRODUITS_MAPPING;
    } else {
      mappings = CPC_CHARGES_MAPPING;
    }
  }

  return mappings.filter(mapping =>
    accountMatchesRange(accountNumber, mapping.accountRange)
  );
}

/**
 * Regroupe les comptes par rubrique
 */
export function groupAccountsByRubric(
  accounts: { number: string; balance: number }[],
  mappings: AccountMapping[]
): Record<string, number> {
  const rubrics: Record<string, number> = {};

  for (const account of accounts) {
    const matchingMappings = mappings.filter(m =>
      accountMatchesRange(account.number, m.accountRange)
    );

    for (const mapping of matchingMappings) {
      const amount = account.balance * mapping.sign;
      rubrics[mapping.rubricCode] = (rubrics[mapping.rubricCode] || 0) + amount;
    }
  }

  return rubrics;
}
