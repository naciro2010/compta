/**
 * Store Archivage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ArchivedDocument, ArchivePolicy, DocumentType } from '@/types/archive';

interface ArchiveState {
  documents: ArchivedDocument[];
  policies: ArchivePolicy[];

  archiveDocument: (doc: Omit<ArchivedDocument, 'id' | 'createdAt' | 'isValid' | 'isExpired'>) => ArchivedDocument;
  verifyDocumentIntegrity: (id: string) => boolean;
  searchDocuments: (filters: {
    type?: DocumentType;
    fiscalYear?: number;
    startDate?: Date;
    endDate?: Date;
  }) => ArchivedDocument[];
  deleteExpiredDocuments: () => number;

  clearAll: () => void;
}

export const useArchiveStore = create<ArchiveState>()(
  persist(
    (set, get) => ({
      documents: [],
      policies: [
        // Politiques par défaut (Maroc: 10 ans)
        { id: '1', documentType: 'INVOICE', retentionYears: 10, autoArchive: true, isActive: true },
        { id: '2', documentType: 'ENTRY', retentionYears: 10, autoArchive: true, isActive: true },
        { id: '3', documentType: 'DECLARATION', retentionYears: 10, autoArchive: true, isActive: true },
      ],

      archiveDocument: (docData) => {
        // Calculer hash SHA-256 (simulation)
        const hash = `sha256_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const expiryDate = new Date(docData.archiveDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + docData.retentionYears);

        const newDoc: ArchivedDocument = {
          ...docData,
          id: `archive-${Date.now()}`,
          hash,
          hashAlgorithm: 'SHA-256',
          isValid: true,
          expiryDate,
          isExpired: false,
          createdAt: new Date(),
        };

        set((state) => ({
          documents: [...state.documents, newDoc],
        }));

        return newDoc;
      },

      verifyDocumentIntegrity: (id) => {
        // TODO: Implémenter vérification hash réelle
        const doc = get().documents.find((d) => d.id === id);
        return doc?.isValid || false;
      },

      searchDocuments: (filters) => {
        let results = get().documents;

        if (filters.type) {
          results = results.filter((d) => d.type === filters.type);
        }

        if (filters.fiscalYear) {
          results = results.filter((d) => d.fiscalYear === filters.fiscalYear);
        }

        return results;
      },

      deleteExpiredDocuments: () => {
        const now = new Date();
        const { documents } = get();

        const expired = documents.filter((d) => d.expiryDate < now);

        set({
          documents: documents.filter((d) => d.expiryDate >= now),
        });

        return expired.length;
      },

      clearAll: () => {
        set({ documents: [] });
      },
    }),
    {
      name: 'archive-storage',
    }
  )
);
