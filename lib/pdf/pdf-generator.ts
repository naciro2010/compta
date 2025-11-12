/**
 * Utilitaires pour la génération de PDF
 * Utilise jsPDF et html2canvas pour convertir des éléments HTML en PDF
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFGenerationOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  margin?: number;
}

/**
 * Génère un PDF à partir d'un élément HTML
 * @param elementId ID de l'élément HTML à convertir
 * @param options Options de génération
 * @returns Promise<Blob> Blob du PDF généré
 */
export async function generatePDFFromHTML(
  elementId: string,
  options: PDFGenerationOptions = {}
): Promise<Blob> {
  const {
    format = 'a4',
    orientation = 'portrait',
    quality = 0.95,
    margin = 10,
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Capturer l'élément HTML en canvas
  const canvas = await html2canvas(element, {
    scale: 2, // Haute résolution
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  // Dimensions du PDF (en mm)
  const pdfWidth = format === 'a4' ? 210 : 215.9;
  const pdfHeight = format === 'a4' ? 297 : 279.4;

  // Calculer les dimensions de l'image dans le PDF
  const imgWidth = pdfWidth - (2 * margin);
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Créer le PDF
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  });

  // Convertir le canvas en image
  const imgData = canvas.toDataURL('image/jpeg', quality);

  // Ajouter l'image au PDF
  let heightLeft = imgHeight;
  let position = margin;

  // Première page
  pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
  heightLeft -= (pdfHeight - 2 * margin);

  // Pages supplémentaires si nécessaire
  while (heightLeft > 0) {
    position = heightLeft - imgHeight + margin;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 2 * margin);
  }

  // Retourner le blob
  return pdf.output('blob');
}

/**
 * Télécharge un PDF généré
 * @param elementId ID de l'élément HTML à convertir
 * @param filename Nom du fichier à télécharger
 * @param options Options de génération
 */
export async function downloadPDF(
  elementId: string,
  filename: string,
  options: PDFGenerationOptions = {}
): Promise<void> {
  const blob = await generatePDFFromHTML(elementId, options);

  // Créer un lien de téléchargement
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Nettoyer l'URL
  URL.revokeObjectURL(url);
}

/**
 * Affiche un aperçu du PDF dans une nouvelle fenêtre
 * @param elementId ID de l'élément HTML à convertir
 * @param options Options de génération
 */
export async function previewPDF(
  elementId: string,
  options: PDFGenerationOptions = {}
): Promise<void> {
  const blob = await generatePDFFromHTML(elementId, options);

  // Ouvrir dans une nouvelle fenêtre
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');

  // Nettoyer après un délai
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Génère un PDF à partir de données d'entreprise et facture
 * (Alternative pour une génération plus contrôlée sans HTML)
 */
export async function generateInvoicePDF(data: {
  invoice: any;
  company: any;
  client: any;
}): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Configuration des polices et styles
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // En-tête de l'entreprise
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.company.name || 'Votre Société', margin, y);
  y += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`ICE: ${data.company.ice || 'N/A'}`, margin, y);
  y += 5;
  pdf.text(data.company.address || '', margin, y);
  y += 5;
  pdf.text(`${data.company.phone || ''} | ${data.company.email || ''}`, margin, y);
  y += 15;

  // Titre de la facture
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  const invoiceType = data.invoice.type === 'INVOICE' ? 'FACTURE' : 'DEVIS';
  pdf.text(invoiceType, pageWidth / 2, y, { align: 'center' });
  y += 10;

  pdf.setFontSize(12);
  pdf.text(`N° ${data.invoice.number}`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Informations client
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Client:', margin, y);
  y += 5;

  pdf.setFont('helvetica', 'normal');
  pdf.text(data.client.name || '', margin, y);
  y += 5;
  pdf.text(`ICE: ${data.client.ice || 'N/A'}`, margin, y);
  y += 5;
  if (data.client.address) {
    pdf.text(data.client.address, margin, y);
    y += 5;
  }
  y += 10;

  // Tableau des articles
  const tableStartY = y;
  const colWidths = {
    description: 80,
    quantity: 25,
    unitPrice: 30,
    total: 30,
  };

  // En-têtes du tableau
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.text('Description', margin + 2, y + 5);
  pdf.text('Qté', margin + colWidths.description + 2, y + 5);
  pdf.text('P.U. HT', margin + colWidths.description + colWidths.quantity + 2, y + 5);
  pdf.text('Total HT', margin + colWidths.description + colWidths.quantity + colWidths.unitPrice + 2, y + 5);
  y += 10;

  // Lignes des articles
  pdf.setFont('helvetica', 'normal');
  data.invoice.items?.forEach((item: any) => {
    pdf.text(item.description || '', margin + 2, y);
    pdf.text(item.quantity?.toString() || '0', margin + colWidths.description + 2, y);
    pdf.text(item.unitPrice?.toFixed(2) || '0.00', margin + colWidths.description + colWidths.quantity + 2, y);
    pdf.text(item.totalAmount?.toFixed(2) || '0.00', margin + colWidths.description + colWidths.quantity + colWidths.unitPrice + 2, y);
    y += 7;
  });

  y += 10;

  // Totaux
  const totalX = pageWidth - margin - 50;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total HT:', totalX - 30, y);
  pdf.text(`${data.invoice.totalAmountExclTax?.toFixed(2) || '0.00'} MAD`, totalX, y);
  y += 7;

  pdf.text('TVA:', totalX - 30, y);
  pdf.text(`${data.invoice.totalVatAmount?.toFixed(2) || '0.00'} MAD`, totalX, y);
  y += 7;

  pdf.setFontSize(12);
  pdf.text('Total TTC:', totalX - 30, y);
  pdf.text(`${data.invoice.totalAmountInclTax?.toFixed(2) || '0.00'} MAD`, totalX, y);

  return pdf.output('blob');
}
