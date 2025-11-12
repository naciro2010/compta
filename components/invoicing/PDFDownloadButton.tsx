'use client'

import React, { useState } from 'react';
import { Download, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { downloadPDF, previewPDF } from '@/lib/pdf/pdf-generator';

interface PDFDownloadButtonProps {
  elementId: string;
  filename: string;
  buttonText?: string;
  showPreview?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Bouton pour télécharger ou prévisualiser un PDF
 * Utilise l'utilitaire pdf-generator pour convertir un élément HTML en PDF
 */
export default function PDFDownloadButton({
  elementId,
  filename,
  buttonText = 'Télécharger PDF',
  showPreview = true,
  variant = 'primary',
  size = 'md',
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      await downloadPDF(elementId, filename, {
        format: 'a4',
        orientation: 'portrait',
        quality: 0.95,
      });
    } catch (err) {
      console.error('Erreur lors de la génération du PDF:', err);
      setError('Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      await previewPDF(elementId, {
        format: 'a4',
        orientation: 'portrait',
        quality: 0.95,
      });
    } catch (err) {
      console.error('Erreur lors de la prévisualisation du PDF:', err);
      setError('Erreur lors de la prévisualisation');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleDownload}
        disabled={isGenerating}
        variant={variant}
        size={size}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Génération...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            {buttonText}
          </>
        )}
      </Button>

      {showPreview && (
        <Button
          onClick={handlePreview}
          disabled={isGenerating}
          variant="outline"
          size={size}
        >
          <Eye className="h-4 w-4 mr-2" />
          Aperçu
        </Button>
      )}

      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
}
