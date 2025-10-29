/**
 * Types pour les États de Synthèse CGNC (EPIC 3)
 * Conformes au Plan Comptable Général Marocain
 *
 * États de synthèse :
 * - BL : Bilan
 * - CPC : Compte de Produits et Charges
 * - ESG : État des Soldes de Gestion
 * - TF : Tableau de Financement
 * - ETIC : État des Informations Complémentaires
 */

// ============================================================================
// Types communs
// ============================================================================

/**
 * Modèle des états de synthèse
 * - NORMAL : 5 états (BL, CPC, ESG, TF, ETIC) - pour CA > 10M MAD
 * - SIMPLIFIE : 4 états (BL, CPC, TF, ETIC) - pour CA ≤ 10M MAD
 */
export type FinancialStatementModel = 'NORMAL' | 'SIMPLIFIE';

/**
 * Type d'état de synthèse
 */
export type FinancialStatementType = 'BL' | 'CPC' | 'ESG' | 'TF' | 'ETIC';

/**
 * Ligne de rubrique dans un état
 */
export interface StatementLine {
  code: string;                    // Code de la rubrique (ex: "AA", "AB", etc.)
  label: string;                   // Libellé de la rubrique
  currentYear: number;             // Montant exercice N
  previousYear?: number;           // Montant exercice N-1
  level: number;                   // Niveau hiérarchique (1, 2, 3)
  isBold?: boolean;                // Affichage en gras (totaux)
  isCalculated?: boolean;          // Calculé automatiquement
  accountRanges?: string[];        // Plages de comptes CGNC (ex: ["211", "212-218"])
}

// ============================================================================
// BILAN (BL)
// ============================================================================

/**
 * Structure du Bilan
 * Actif + Passif doivent être équilibrés
 */
export interface Bilan {
  id: string;
  fiscalYearId: string;            // Exercice concerné
  generatedAt: Date;
  generatedBy: string;
  model: FinancialStatementModel;

  // Actif
  actif: {
    immobilisationsEnNonValeurs: StatementLine[];        // Rubriques AA à AE
    immobilisationsIncorporelles: StatementLine[];       // Rubriques AF à AJ
    immobilisationsCorpoelles: StatementLine[];          // Rubriques AK à AP
    immobilisationsFinancieres: StatementLine[];         // Rubriques AQ à AT
    ecartsDeConversion: StatementLine[];                 // Rubrique AU
    totalActifImmobilise: StatementLine;                 // Total I (AA à AU)

    stocks: StatementLine[];                             // Rubriques BA à BF
    creances: StatementLine[];                           // Rubriques BG à BK
    titresEtValeursDepl: StatementLine[];               // Rubriques BL à BN
    ecartsDeConversionActifCirculant: StatementLine[];   // Rubrique BO
    totalActifCirculant: StatementLine;                  // Total II (BA à BO)

    tresorerie: StatementLine[];                         // Rubriques CA à CC
    totalTresorerie: StatementLine;                      // Total III (CA à CC)

    totalGeneral: StatementLine;                         // Total Général Actif
  };

  // Passif
  passif: {
    capitauxPropres: StatementLine[];                    // Rubriques DA à DG
    capitauxPropresAssimiles: StatementLine[];           // Rubriques DH à DJ
    dettesDeFinancement: StatementLine[];                // Rubriques DK à DO
    provisionsRisquesEtCharges: StatementLine[];         // Rubriques DP à DQ
    ecartsDeConversionPassif: StatementLine[];           // Rubrique DR
    totalFinancementPermanent: StatementLine;            // Total I (DA à DR)

    dettesPassifCirculant: StatementLine[];              // Rubriques EA à EH
    autresProvisionsPourRisques: StatementLine[];        // Rubrique EI
    ecartsDeConversionPassifCirculant: StatementLine[];  // Rubrique EJ
    totalPassifCirculant: StatementLine;                 // Total II (EA à EJ)

    tresoreriePassif: StatementLine[];                   // Rubriques FA à FC
    totalTresoreriePassif: StatementLine;                // Total III (FA à FC)

    totalGeneral: StatementLine;                         // Total Général Passif
  };

  // Contrôles
  isBalanced: boolean;               // Actif = Passif
  difference: number;                // Différence (doit être 0)
}

// ============================================================================
// COMPTE DE PRODUITS ET CHARGES (CPC)
// ============================================================================

/**
 * Compte de Produits et Charges
 * Résultat Net = Total Produits - Total Charges
 */
export interface CPC {
  id: string;
  fiscalYearId: string;
  generatedAt: Date;
  generatedBy: string;
  model: FinancialStatementModel;

  // Produits d'exploitation
  produitsExploitation: StatementLine[];                 // Rubriques GA à GH
  totalProduitsExploitation: StatementLine;              // Total I (GA à GH)

  // Charges d'exploitation
  chargesExploitation: StatementLine[];                  // Rubriques HA à HN
  totalChargesExploitation: StatementLine;               // Total II (HA à HN)

  // Résultat d'exploitation
  resultatExploitation: StatementLine;                   // Total III (I - II)

  // Produits financiers
  produitsFinanciers: StatementLine[];                   // Rubriques IA à IF
  totalProduitsFinanciers: StatementLine;                // Total IV (IA à IF)

  // Charges financières
  chargesFinancieres: StatementLine[];                   // Rubriques JA à JF
  totalChargesFinancieres: StatementLine;                // Total V (JA à JF)

  // Résultat financier
  resultatFinancier: StatementLine;                      // Total VI (IV - V)

  // Résultat courant
  resultatCourant: StatementLine;                        // Total VII (III + VI)

  // Produits non courants
  produitsNonCourants: StatementLine[];                  // Rubriques KA à KE
  totalProduitsNonCourants: StatementLine;               // Total VIII (KA à KE)

  // Charges non courantes
  chargesNonCourantes: StatementLine[];                  // Rubriques LA à LE
  totalChargesNonCourantes: StatementLine;               // Total IX (LA à LE)

  // Résultat non courant
  resultatNonCourant: StatementLine;                     // Total X (VIII - IX)

  // Résultat avant impôts
  resultatAvantImpots: StatementLine;                    // Total XI (VII + X)

  // Impôts sur les résultats
  impotsSurResultats: StatementLine;                     // Rubrique MA

  // Résultat net
  resultatNet: StatementLine;                            // Total XII (XI - MA)

  // Contrôles
  totalProduits: number;             // Somme de tous les produits
  totalCharges: number;              // Somme de toutes les charges
  isCoherent: boolean;               // Résultat Net = Total Produits - Total Charges
}

// ============================================================================
// ÉTAT DES SOLDES DE GESTION (ESG)
// ============================================================================

/**
 * État des Soldes de Gestion
 * Calcule les soldes intermédiaires de gestion
 * Disponible uniquement en modèle NORMAL
 */
export interface ESG {
  id: string;
  fiscalYearId: string;
  generatedAt: Date;
  generatedBy: string;

  // Tableau de formation des résultats (TFR)
  tfr: {
    // Production
    ventesProduitsEtServices: StatementLine;             // Ligne 1
    variationStocksProduits: StatementLine;              // Ligne 2
    immobilisationsProduitesPar: StatementLine;          // Ligne 3
    production: StatementLine;                           // Total I (1+2+3)

    // Consommation
    achatsConsommes: StatementLine;                      // Ligne 4
    autresChargesExternes: StatementLine;                // Ligne 5
    consommation: StatementLine;                         // Total II (4+5)

    // Valeur ajoutée
    valeurAjoutee: StatementLine;                        // Total III (I - II)

    // Excédent Brut d'Exploitation (EBE)
    subventionsExploitation: StatementLine;              // Ligne 6
    impotsTaxes: StatementLine;                          // Ligne 7
    chargesPersonnel: StatementLine;                     // Ligne 8
    ebe: StatementLine;                                  // Total IV (III + 6 - 7 - 8)

    // Résultat d'exploitation
    autresProduits: StatementLine;                       // Ligne 9
    autresCharges: StatementLine;                        // Ligne 10
    dotationsAmortissements: StatementLine;              // Ligne 11
    reprisesExploitation: StatementLine;                 // Ligne 12
    resultatExploitation: StatementLine;                 // Total V (IV + 9 - 10 - 11 + 12)

    // Résultat financier
    resultatFinancier: StatementLine;                    // Total VI

    // Résultat courant
    resultatCourant: StatementLine;                      // Total VII (V + VI)

    // Résultat non courant
    resultatNonCourant: StatementLine;                   // Total VIII

    // Résultat net
    resultatAvantImpots: StatementLine;                  // Total IX (VII + VIII)
    impots: StatementLine;                               // Ligne 13
    resultatNet: StatementLine;                          // Total X (IX - 13)
  };

  // Capacité d'autofinancement (CAF)
  caf: {
    // Méthode additive
    resultatNet: StatementLine;
    dotationsAmortissements: StatementLine;
    dotationsProvisions: StatementLine;
    valeursNettesImmobilisations: StatementLine;
    reprisesAmortissements: StatementLine;
    reprisesProvisions: StatementLine;
    produitsDesCessions: StatementLine;
    caf: StatementLine;                                  // Capacité d'autofinancement
    distributions: StatementLine;
    autofinancement: StatementLine;                      // CAF - Distributions
  };
}

// ============================================================================
// TABLEAU DE FINANCEMENT (TF)
// ============================================================================

/**
 * Tableau de Financement
 * Analyse les variations du patrimoine
 */
export interface TableauFinancement {
  id: string;
  fiscalYearId: string;
  generatedAt: Date;
  generatedBy: string;
  model: FinancialStatementModel;

  // Partie I : Synthèse des masses du bilan
  syntheseMasses: {
    emplois: StatementLine[];                            // Augmentation de l'actif
    ressources: StatementLine[];                         // Augmentation du passif
    variationFondsRoulement: StatementLine;              // Variation FR
  };

  // Partie II : Emplois et ressources
  emplois: {
    acquisitionsImmobilisations: StatementLine[];
    remboursementsDettes: StatementLine[];
    emploisEnNonValeurs: StatementLine[];
    autresEmplois: StatementLine[];
    totalEmplois: StatementLine;
  };

  ressources: {
    caf: StatementLine;                                  // Capacité d'autofinancement
    cessions: StatementLine[];
    augmentationCapital: StatementLine[];
    nouvellesDettesFin: StatementLine[];
    autresRessources: StatementLine[];
    totalRessources: StatementLine;
  };

  // Variation du BFR et Trésorerie
  variationBFR: StatementLine;                           // Variation Besoin en FR
  variationTresorerie: StatementLine;                    // Variation Trésorerie

  // Contrôle d'équilibre
  isBalanced: boolean;                                   // Ressources = Emplois
  difference: number;
}

// ============================================================================
// ÉTAT DES INFORMATIONS COMPLÉMENTAIRES (ETIC)
// ============================================================================

/**
 * Section de l'ETIC
 */
export interface ETICSection {
  id: string;
  code: string;                      // Code section (A, B, C, etc.)
  title: string;                     // Titre de la section
  order: number;                     // Ordre d'affichage
  content: string;                   // Contenu texte (markdown)
  isRequired: boolean;               // Section obligatoire
  tables?: ETICTable[];              // Tableaux de données
  attachments?: ETICAttachment[];    // Pièces jointes
}

/**
 * Tableau de données dans l'ETIC
 */
export interface ETICTable {
  id: string;
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Pièce jointe de l'ETIC
 */
export interface ETICAttachment {
  id: string;
  filename: string;
  description: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

/**
 * ETIC complet
 */
export interface ETIC {
  id: string;
  fiscalYearId: string;
  generatedAt: Date;
  generatedBy: string;
  model: FinancialStatementModel;

  sections: ETICSection[];           // Toutes les sections

  // Sections prédéfinies CGNC
  A_PrincipesMethodes?: ETICSection;           // A. Principes et méthodes comptables
  B_ReglesEvaluation?: ETICSection;            // B. Règles d'évaluation
  C_EtatImmobilisations?: ETICSection;         // C. État des immobilisations
  D_EtatProvisions?: ETICSection;              // D. État des provisions
  E_EtatCreances?: ETICSection;                // E. État des créances
  F_EtatDettes?: ETICSection;                  // F. État des dettes
  G_EngagementsHorsBilan?: ETICSection;        // G. Engagements hors bilan
  H_TableauAmortissements?: ETICSection;       // H. Tableau des amortissements
  I_TableauProvisionsRisques?: ETICSection;    // I. Provisions pour risques et charges
  J_EffectifMoyen?: ETICSection;               // J. Effectif moyen
  K_OperationsDevises?: ETICSection;           // K. Opérations en devises
}

// ============================================================================
// Ensemble complet des états de synthèse
// ============================================================================

/**
 * Pack complet des états de synthèse pour un exercice
 */
export interface FinancialStatementsPack {
  id: string;
  fiscalYearId: string;
  model: FinancialStatementModel;
  generatedAt: Date;
  generatedBy: string;

  // Les 5 états (4 si simplifié)
  bilan: Bilan;
  cpc: CPC;
  esg?: ESG | null;                  // Uniquement si modèle NORMAL
  tableauFinancement: TableauFinancement;
  etic: ETIC;

  // Contrôles de cohérence
  validations: StatementValidation[];

  // Statut
  status: 'DRAFT' | 'VALIDATED' | 'LOCKED';
  validatedAt?: Date;
  validatedBy?: string;
}

/**
 * Validation d'un état de synthèse
 */
export interface StatementValidation {
  statementType: FinancialStatementType;
  isValid: boolean;
  errors: StatementValidationError[];
  warnings: StatementValidationWarning[];
}

export interface StatementValidationError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface StatementValidationWarning {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// ============================================================================
// Configuration et paramétrage
// ============================================================================

/**
 * Mapping d'un compte CGNC vers une rubrique d'état
 */
export interface AccountMapping {
  accountRange: string;              // Plage de comptes (ex: "211", "212-218", "61*")
  statementType: FinancialStatementType;
  rubricCode: string;                // Code de la rubrique (ex: "AA", "GA", etc.)
  rubricLabel: string;
  sign: 1 | -1;                      // Signe du montant (1 normal, -1 inversé)
  model: FinancialStatementModel[];  // Modèles concernés
}

/**
 * Configuration des seuils pour déterminer le modèle
 */
export interface StatementModelThresholds {
  revenueThresholdMAD: number;       // Seuil CA en MAD (10 000 000)
  totalAssetsThresholdMAD?: number;  // Seuil total actif (optionnel)
}
