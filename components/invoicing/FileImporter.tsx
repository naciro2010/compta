'use client'

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import { InvoiceLine } from '@/types/invoicing';

// Configure PDF.js worker - Use local worker file instead of CDN
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/compta/pdf.worker.min.mjs';
}

interface ExtractedData {
  clientName?: string;
  clientICE?: string;
  clientAddress?: string;
  reference?: string;
  issueDate?: Date;
  dueDate?: Date;
  lines: Array<Partial<InvoiceLine>>;
  totalHT?: number;
  totalTTC?: number;
  notes?: string;
}

interface FileImporterProps {
  onDataExtracted: (data: ExtractedData) => void;
}

export default function FileImporter({ onDataExtracted }: FileImporterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Extract text from PDF using PDF.js
  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    setMessage(`Extraction du PDF (${pdf.numPages} pages)...`);

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
      setProgress((i / pdf.numPages) * 50);
    }

    return fullText;
  };

  // Extract data from Excel file
  const extractDataFromExcel = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    let fullText = '';
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      data.forEach((row: any) => {
        fullText += row.join(' | ') + '\n';
      });
    });

    return fullText;
  };

  // Perform OCR on image
  const performOCR = async (file: File): Promise<string> => {
    setMessage('Analyse OCR de l\'image...');

    const result = await Tesseract.recognize(
      file,
      'fra+eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(50 + m.progress * 50);
          }
        },
      }
    );

    return result.data.text;
  };

  // Parse extracted text to structured data
  const parseInvoiceData = (text: string): ExtractedData => {
    const lines: Array<Partial<InvoiceLine>> = [];
    let clientName = '';
    let clientICE = '';
    let clientAddress = '';
    let reference = '';
    let issueDate: Date | undefined;
    let totalHT: number | undefined;
    let totalTTC: number | undefined;
    let notes = '';

    // Normalize text
    const normalizedText = text.replace(/\s+/g, ' ').trim();

    // Extract client name (usually after "Client:", "Nom:", "À l'attention de:")
    const clientPatterns = [
      /(?:client|nom|à l'attention de|facturé à)[:\s]+([A-Za-zÀ-ÿ\s]+?)(?:\s+ICE|$|\n)/i,
      /(?:raison sociale)[:\s]+([A-Za-zÀ-ÿ\s]+?)(?:\s+ICE|$|\n)/i,
    ];

    for (const pattern of clientPatterns) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        clientName = match[1].trim();
        break;
      }
    }

    // Extract ICE number
    const iceMatch = normalizedText.match(/ICE[:\s]*(\d{15})/i);
    if (iceMatch) {
      clientICE = iceMatch[1];
    }

    // Extract reference
    const refMatch = normalizedText.match(/(?:référence|ref|n°|numéro)[:\s]*([A-Z0-9-]+)/i);
    if (refMatch) {
      reference = refMatch[1];
    }

    // Extract issue date
    const datePatterns = [
      /(?:date d'émission|date|émis le)[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
    ];

    for (const pattern of datePatterns) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        const dateParts = match[1].split(/[/-]/);
        if (dateParts.length === 3) {
          const [day, month, year] = dateParts;
          const fullYear = year.length === 2 ? '20' + year : year;
          issueDate = new Date(`${fullYear}-${month}-${day}`);
          if (!isNaN(issueDate.getTime())) break;
        }
      }
    }

    // Extract invoice lines
    // Look for patterns like: "Description Qty Price Total" or "Désignation Quantité Prix"
    const linePattern = /([A-Za-zÀ-ÿ\s]+?)\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)/g;
    let lineMatch;
    let order = 0;

    while ((lineMatch = linePattern.exec(normalizedText)) !== null) {
      const description = lineMatch[1].trim();
      const quantity = parseFloat(lineMatch[2].replace(',', '.'));
      const unitPrice = parseFloat(lineMatch[3].replace(',', '.'));
      const total = parseFloat(lineMatch[4].replace(',', '.'));

      // Validate that the calculation makes sense (within 10% tolerance)
      if (Math.abs(quantity * unitPrice - total) / total < 0.1) {
        lines.push({
          description,
          quantity,
          unitPrice,
          vatRate: 20, // Default VAT rate
          discountRate: 0,
          order: order++,
        });
      }
    }

    // Extract totals
    const totalHTMatch = normalizedText.match(/(?:total HT|sous-total)[:\s]*(\d+(?:[.,]\d+)?)/i);
    if (totalHTMatch) {
      totalHT = parseFloat(totalHTMatch[1].replace(',', '.'));
    }

    const totalTTCMatch = normalizedText.match(/(?:total TTC|montant total|total)[:\s]*(\d+(?:[.,]\d+)?)/i);
    if (totalTTCMatch) {
      totalTTC = parseFloat(totalTTCMatch[1].replace(',', '.'));
    }

    return {
      clientName: clientName || undefined,
      clientICE: clientICE || undefined,
      reference: reference || undefined,
      issueDate,
      lines,
      totalHT,
      totalTTC,
    };
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setStatus('idle');
    setMessage(`Traitement de ${file.name}...`);

    try {
      let extractedText = '';

      // Detect file type and extract text
      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);

        // If PDF extraction didn't yield much text, try OCR
        if (extractedText.length < 100) {
          setMessage('Texte insuffisant, tentative OCR...');
          // Convert PDF to image and perform OCR (simplified - in production, render PDF pages to canvas)
          extractedText = await performOCR(file);
        }
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
      ) {
        setMessage('Extraction du fichier Excel...');
        extractedText = await extractDataFromExcel(file);
        setProgress(50);
      } else if (file.type.startsWith('image/')) {
        extractedText = await performOCR(file);
      } else {
        throw new Error('Format de fichier non supporté');
      }

      // Parse the extracted text
      setMessage('Analyse des données...');
      setProgress(75);
      const parsedData = parseInvoiceData(extractedText);

      setProgress(100);
      setStatus('success');
      setMessage(`Données extraites avec succès ! ${parsedData.lines.length} lignes trouvées.`);

      // Call the callback with extracted data
      onDataExtracted(parsedData);

    } catch (error: any) {
      console.error('Error processing file:', error);
      setStatus('error');
      setMessage(`Erreur: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Importer depuis un fichier
        </CardTitle>
      </CardHeader>
      <div className="p-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-claude-accent bg-claude-accent/5'
              : 'border-claude-border hover:border-claude-accent/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-claude-accent" />
              <div className="space-y-2">
                <p className="text-sm text-claude-text-muted">{message}</p>
                <div className="w-full bg-claude-border rounded-full h-2">
                  <div
                    className="bg-claude-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-claude-text-subtle">{Math.round(progress)}%</p>
              </div>
            </div>
          ) : (
            <>
              {status === 'idle' && (
                <div className="space-y-4">
                  <FileText className="w-12 h-12 mx-auto text-claude-text-muted" />
                  <div>
                    <p className="text-sm font-medium text-claude-text mb-2">
                      Glissez-déposez un fichier ou cliquez pour sélectionner
                    </p>
                    <p className="text-xs text-claude-text-muted mb-4">
                      Formats supportés: PDF, Excel (.xlsx, .xls), Images (PNG, JPG)
                    </p>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-claude-accent focus:ring-offset-2 focus:ring-offset-claude-bg border border-claude-border text-claude-text hover:bg-claude-surface px-3 py-1.5 text-sm">
                        <Upload className="w-4 h-4" />
                        Choisir un fichier
                      </div>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-3">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                  <p className="text-sm font-medium text-green-700">{message}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatus('idle');
                      setMessage('');
                    }}
                  >
                    Importer un autre fichier
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-3">
                  <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
                  <p className="text-sm font-medium text-red-700">{message}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatus('idle');
                      setMessage('');
                    }}
                  >
                    Réessayer
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> L'extraction automatique fonctionne mieux avec des fichiers bien structurés.
            Vérifiez toujours les données extraites avant de sauvegarder.
          </p>
        </div>
      </div>
    </Card>
  );
}
