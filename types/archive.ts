/**
 * Types pour l'EPIC Archivage
 * Stockage légal 10 ans + Intégrité
 */

export type DocumentType = 'INVOICE' | 'ENTRY' | 'STATEMENT' | 'DECLARATION' | 'OTHER';

export interface ArchivedDocument {
  id: string;
  type: DocumentType;
  documentId: string;
  fiscalYear: number;

  // Fichier
  filename: string;
  mimeType: string;
  fileSize: number;
  fileUrl: string;

  // Intégrité
  hash: string; // SHA-256
  hashAlgorithm: 'SHA-256';
  isValid: boolean;

  // Rétention
  archiveDate: Date;
  retentionYears: number; // 10 ans par défaut au Maroc
  expiryDate: Date;
  isExpired: boolean;

  // Métadonnées
  metadata?: Record<string, any>;

  createdAt: Date;
  archivedBy: string;
}

export interface ArchivePolicy {
  id: string;
  documentType: DocumentType;
  retentionYears: number;
  autoArchive: boolean;
  isActive: boolean;
}
