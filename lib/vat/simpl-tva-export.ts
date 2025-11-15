/**
 * Export XML SIMPL-TVA
 * Génération XML pour télédéclaration TVA auprès de la DGI marocaine
 */

import type { VATDeclaration, SimplTVAExport } from '@/types/vat';
import { validateDeclarationForXMLExport } from './vat-validation';

// ============================================================================
// GÉNÉRATION XML SIMPL-TVA
// ============================================================================

/**
 * Génère le XML SIMPL-TVA pour une déclaration
 */
export function generateSimplTVAXML(declaration: VATDeclaration): string {
  // Validation préalable
  const validation = validateDeclarationForXMLExport(declaration);
  if (!validation.valid) {
    throw new Error(
      `Impossible de générer le XML: ${validation.errors.map((e) => e.message).join(', ')}`
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DeclarationTVA xmlns="http://www.tax.gov.ma/simpl-tva"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.tax.gov.ma/simpl-tva SIMPL-TVA-2.0.xsd"
                version="2.0">

  <!-- IDENTIFICATION -->
  <Identification>
    <ICE>${escapeXML(declaration.ice)}</ICE>
    <IF>${escapeXML(declaration.if)}</IF>
    ${declaration.vatNumber ? `<NumeroTVA>${escapeXML(declaration.vatNumber)}</NumeroTVA>` : ''}
    <Periode>
      <Annee>${declaration.year}</Annee>
      ${declaration.period === 'MONTHLY' ? `<Mois>${declaration.month}</Mois>` : ''}
      ${declaration.period === 'QUARTERLY' ? `<Trimestre>${declaration.quarter}</Trimestre>` : ''}
    </Periode>
    <DateSoumission>${formatDateForXML(new Date())}</DateSoumission>
  </Identification>

  <!-- TVA COLLECTÉE -->
  <TVACollectee>
    <LigneTVA taux="20">
      <BaseImposable>${formatAmount(declaration.collected20.base)}</BaseImposable>
      <MontantTVA>${formatAmount(declaration.collected20.vat)}</MontantTVA>
    </LigneTVA>
    <LigneTVA taux="14">
      <BaseImposable>${formatAmount(declaration.collected14.base)}</BaseImposable>
      <MontantTVA>${formatAmount(declaration.collected14.vat)}</MontantTVA>
    </LigneTVA>
    <LigneTVA taux="10">
      <BaseImposable>${formatAmount(declaration.collected10.base)}</BaseImposable>
      <MontantTVA>${formatAmount(declaration.collected10.vat)}</MontantTVA>
    </LigneTVA>
    <LigneTVA taux="7">
      <BaseImposable>${formatAmount(declaration.collected7.base)}</BaseImposable>
      <MontantTVA>${formatAmount(declaration.collected7.vat)}</MontantTVA>
    </LigneTVA>
    <LigneTVA taux="0">
      <BaseImposable>${formatAmount(declaration.collected0.base)}</BaseImposable>
      <MontantTVA>${formatAmount(declaration.collected0.vat)}</MontantTVA>
    </LigneTVA>
    <TotalBaseImposable>${formatAmount(declaration.totalCollectedBase)}</TotalBaseImposable>
    <TotalTVACollectee>${formatAmount(declaration.totalCollectedVAT)}</TotalTVACollectee>
  </TVACollectee>

  <!-- TVA DÉDUCTIBLE -->
  <TVADeductible>
    <LigneTVA taux="20">
      <BaseImposable>${formatAmount(declaration.deductible20.base)}</BaseImposable>
      <MontantTVA>${formatAmount(declaration.deductible20.vat)}</MontantTVA>
    </LigneTVA>
    <LigneTVA taux="14">
      <BaseImposable>${formatAmount(declaration.deductible14.base)}</BaseImposable>
      <MontantTVA>${formatAmount(declaration.deductible14.vat)}</MontantTVA>
    </LigneTVA>
    <LigneTVA taux="10">
      <BaseImposable>${formatAmount(declaration.deductible10.base)}</BaseImposable>
      <MontantTVA>${formatAmount(declaration.deductible10.vat)}</MontantTVA>
    </LigneTVA>
    <LigneTVA taux="7">
      <BaseImposable>${formatAmount(declaration.deductible7.base)}</BaseImposable>
      <MontantTVA>${formatAmount(declaration.deductible7.vat)}</MontantTVA>
    </LigneTVA>
    <LigneTVA taux="0">
      <BaseImposable>${formatAmount(declaration.deductible0.base)}</BaseImposable>
      <MontantTVA>${formatAmount(declaration.deductible0.vat)}</MontantTVA>
    </LigneTVA>
    <TotalBaseImposable>${formatAmount(declaration.totalDeductibleBase)}</TotalBaseImposable>
    <TotalTVADeductible>${formatAmount(declaration.totalDeductibleVAT)}</TotalTVADeductible>
  </TVADeductible>

  <!-- RELEVÉ DE DÉDUCTIONS (détail fournisseurs) -->
  <ReleveDeductions>
${generateDeductionLines(declaration)}
  </ReleveDeductions>

  <!-- RÉGULARISATIONS -->
  ${declaration.adjustments.length > 0 ? generateAdjustmentsXML(declaration) : ''}

  <!-- CALCUL FINAL -->
  <CalculTVA>
    <TVANette>${formatAmount(declaration.netVAT)}</TVANette>
    ${declaration.vatCredit ? `<CreditReporte>${formatAmount(declaration.vatCredit)}</CreditReporte>` : ''}
    <TVAAPayer>${formatAmount(declaration.vatToPay)}</TVAAPayer>
    ${declaration.newVATCredit ? `<NouveauCredit>${formatAmount(declaration.newVATCredit)}</NouveauCredit>` : ''}
  </CalculTVA>

  <!-- INFORMATIONS COMPLÉMENTAIRES -->
  <Informations>
    <DateDeclaration>${formatDateForXML(declaration.createdAt)}</DateDeclaration>
    ${declaration.notes ? `<Notes>${escapeXML(declaration.notes)}</Notes>` : ''}
  </Informations>

</DeclarationTVA>`;

  return xml;
}

/**
 * Génère les lignes de déduction détaillées (relevé fournisseurs)
 */
function generateDeductionLines(declaration: VATDeclaration): string {
  if (declaration.vatDeductibleLines.length === 0) {
    return '    <!-- Aucune déduction -->';
  }

  return declaration.vatDeductibleLines
    .map(
      (line, index) => `    <LigneDeduction numero="${index + 1}">
      <Fournisseur>
        <Nom>${escapeXML(line.thirdPartyName || 'N/A')}</Nom>
        <ICE>${escapeXML(line.thirdPartyICE || '')}</ICE>
      </Fournisseur>
      <Document>
        <Type>${escapeXML(line.documentType)}</Type>
        <Numero>${escapeXML(line.documentNumber)}</Numero>
        <Date>${formatDateForXML(line.documentDate)}</Date>
      </Document>
      <Montants>
        <BaseHT>${formatAmount(line.baseAmount)}</BaseHT>
        <TauxTVA>${line.rate}</TauxTVA>
        <MontantTVA>${formatAmount(line.vatAmount)}</MontantTVA>
        <TauxDeduction>${line.deductionRate}</TauxDeduction>
        <MontantDeductible>${formatAmount(line.vatAmount * (line.deductionRate / 100))}</MontantDeductible>
      </Montants>
    </LigneDeduction>`
    )
    .join('\n');
}

/**
 * Génère le XML pour les régularisations/ajustements
 */
function generateAdjustmentsXML(declaration: VATDeclaration): string {
  return `  <Regularisations>
${declaration.adjustments
  .map(
    (adj, index) => `    <Regularisation numero="${index + 1}">
      <Type>${escapeXML(adj.type)}</Type>
      <Description>${escapeXML(adj.description)}</Description>
      <Montant>${formatAmount(adj.amount)}</Montant>
      ${adj.documentReference ? `<Reference>${escapeXML(adj.documentReference)}</Reference>` : ''}
      <Motif>${escapeXML(adj.reason)}</Motif>
    </Regularisation>`
  )
  .join('\n')}
  </Regularisations>`;
}

// ============================================================================
// VALIDATION XSD
// ============================================================================

/**
 * Valide un XML contre le schéma XSD SIMPL-TVA
 * Note: Dans un environnement de production, utiliser une bibliothèque comme libxmljs
 */
export function validateXMLAgainstXSD(xmlContent: string): {
  valid: boolean;
  errors: string[];
} {
  // TODO: Implémenter validation XSD réelle avec une bibliothèque
  // Pour l'instant, validation basique de structure XML

  const errors: string[] = [];

  // Vérifier que c'est du XML valide
  if (!xmlContent.startsWith('<?xml version="1.0"')) {
    errors.push('Déclaration XML manquante');
  }

  // Vérifier présence des balises obligatoires
  const requiredTags = [
    'DeclarationTVA',
    'Identification',
    'ICE',
    'IF',
    'Periode',
    'TVACollectee',
    'TVADeductible',
    'CalculTVA',
  ];

  requiredTags.forEach((tag) => {
    if (!xmlContent.includes(`<${tag}`)) {
      errors.push(`Balise obligatoire manquante: <${tag}>`);
    }
  });

  // Vérifier fermeture des balises
  const openTags = xmlContent.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g) || [];
  const closeTags = xmlContent.match(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g) || [];

  if (openTags.length !== closeTags.length) {
    errors.push('Nombre de balises ouvrantes et fermantes incohérent');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// EXPORT VERS FICHIER
// ============================================================================

/**
 * Crée un nom de fichier conforme pour l'export SIMPL-TVA
 */
export function generateSimplTVAFilename(declaration: VATDeclaration): string {
  const periodStr = declaration.period === 'MONTHLY'
    ? declaration.month!.toString().padStart(2, '0')
    : `T${declaration.quarter}`;

  return `SIMPL-TVA_${declaration.ice}_${declaration.year}${periodStr}.xml`;
}

/**
 * Prépare les métadonnées pour l'export
 */
export function prepareExportMetadata(
  declaration: VATDeclaration,
  xmlContent: string
): SimplTVAExport {
  const filename = generateSimplTVAFilename(declaration);
  const validation = validateXMLAgainstXSD(xmlContent);

  return {
    id: `xml-export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    declarationId: declaration.id,
    xmlVersion: '2.0',
    xmlContent,
    xsdValidated: validation.valid,
    validationErrors: validation.errors,
    filename,
    fileSize: new Blob([xmlContent]).size,
    generatedAt: new Date(),
    generatedBy: 'system', // À remplacer par l'utilisateur authentifié
  };
}

/**
 * Génère et prépare un export complet
 */
export function generateCompleteExport(declaration: VATDeclaration): SimplTVAExport {
  const xmlContent = generateSimplTVAXML(declaration);
  return prepareExportMetadata(declaration, xmlContent);
}

// ============================================================================
// TÉLÉCHARGEMENT
// ============================================================================

/**
 * Crée un Blob téléchargeable pour le XML
 */
export function createDownloadableXMLBlob(xmlContent: string): Blob {
  return new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
}

/**
 * Déclenche le téléchargement du fichier XML côté client
 */
export function downloadXMLFile(xmlContent: string, filename: string): void {
  const blob = createDownloadableXMLBlob(xmlContent);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// ============================================================================
// UTILITAIRES XML
// ============================================================================

/**
 * Échappe les caractères spéciaux XML
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formate un montant pour XML (2 décimales, point comme séparateur)
 */
function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Formate une date pour XML (YYYY-MM-DD)
 */
function formatDateForXML(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatte un XML pour l'affichage (indentation)
 */
export function formatXMLForDisplay(xml: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  xml.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) {
      indent--; // Fermeture de balise
    }

    formatted += tab.repeat(indent) + '<' + node + '>\n';

    if (node.match(/^<?\w[^>]*[^/]$/)) {
      indent++; // Ouverture de balise
    }
  });

  return formatted.substring(1, formatted.length - 2);
}

// ============================================================================
// SOUMISSION À LA DGI (simulation)
// ============================================================================

/**
 * Simule la soumission du XML à la plateforme SIMPL de la DGI
 * Note: En production, intégrer avec l'API réelle de la DGI
 */
export async function submitToDGI(
  xmlExport: SimplTVAExport
): Promise<{
  success: boolean;
  reference?: string;
  message: string;
  receipt?: string;
}> {
  // TODO: Implémenter l'intégration réelle avec la DGI

  // Simulation pour le MVP
  if (!xmlExport.xsdValidated) {
    return {
      success: false,
      message: 'XML non valide. Veuillez corriger les erreurs avant soumission.',
    };
  }

  // Simulation délai réseau
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulation succès
  const reference = `DGI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  return {
    success: true,
    reference,
    message: 'Déclaration soumise avec succès',
    receipt: `Accusé de réception #${reference}`,
  };
}

// ============================================================================
// EXPORT SCHÉMA XSD (pour référence)
// ============================================================================

/**
 * Schéma XSD simplifié pour SIMPL-TVA
 * Note: Ceci est une version simplifiée. Obtenir le schéma officiel depuis la DGI
 */
export const SIMPL_TVA_XSD_REFERENCE = `
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="http://www.tax.gov.ma/simpl-tva"
           xmlns="http://www.tax.gov.ma/simpl-tva"
           elementFormDefault="qualified">

  <xs:element name="DeclarationTVA">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="Identification" type="IdentificationType"/>
        <xs:element name="TVACollectee" type="TVAType"/>
        <xs:element name="TVADeductible" type="TVAType"/>
        <xs:element name="ReleveDeductions" type="ReleveType" minOccurs="0"/>
        <xs:element name="Regularisations" type="RegularisationsType" minOccurs="0"/>
        <xs:element name="CalculTVA" type="CalculType"/>
        <xs:element name="Informations" type="InformationsType" minOccurs="0"/>
      </xs:sequence>
      <xs:attribute name="version" type="xs:string" fixed="2.0"/>
    </xs:complexType>
  </xs:element>

  <!-- Types définis... (simplifié pour MVP) -->

</xs:schema>
`;
