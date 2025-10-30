'use client'

import React, { useState } from 'react';
import { useInvoicingStore } from '@/store/invoicing';
import { Invoice, InvoiceStatus } from '@/types/invoicing';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { FileText, Eye, Edit, Trash2, Copy, Download, AlertCircle, ArrowRight } from 'lucide-react';

interface QuoteListProps {
  onSelect?: (quote: Invoice) => void;
  onEdit?: (quote: Invoice) => void;
  onDelete?: (quote: Invoice) => void;
  onDuplicate?: (quote: Invoice) => void;
  onViewPDF?: (quote: Invoice) => void;
  onConvertToInvoice?: (invoice: Invoice) => void;
}

export default function QuoteList({
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onViewPDF,
  onConvertToInvoice,
}: QuoteListProps) {
  const { getInvoices, duplicateInvoice, getThirdParty, convertQuoteToInvoice, deleteInvoice } = useInvoicingStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');

  // Get quotes only
  const allQuotes = getInvoices({ type: 'QUOTE' });

  // Filter by search query
  const filteredQuotes = searchQuery
    ? allQuotes.filter((quote) => {
        const thirdParty = getThirdParty(quote.thirdPartyId);
        return (
          quote.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quote.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thirdParty?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thirdParty?.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : allQuotes;

  // Filter by status
  const displayedQuotes = statusFilter
    ? filteredQuotes.filter((q) => q.status === statusFilter)
    : filteredQuotes;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-MA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'Brouillon';
      case 'SENT':
        return 'Envoyé';
      case 'VIEWED':
        return 'Consulté';
      case 'CONVERTED':
        return 'Converti';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getStatusBadgeColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'VIEWED':
        return 'bg-cyan-100 text-cyan-800';
      case 'CONVERTED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (quote: Invoice) => {
    if (!quote.dueDate) return false;
    return (
      new Date(quote.dueDate) < new Date() &&
      quote.status !== 'CONVERTED' &&
      quote.status !== 'CANCELLED'
    );
  };

  // Calculate statistics
  const stats = {
    total: displayedQuotes.length,
    totalAmount: displayedQuotes.reduce((sum, q) => sum + q.totalTTC, 0),
    convertedCount: displayedQuotes.filter((q) => q.status === 'CONVERTED').length,
    expiredCount: displayedQuotes.filter((q) => isExpired(q)).length,
  };

  const handleDuplicate = (quote: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated = duplicateInvoice(quote.id);
    onDuplicate?.(duplicated);
  };

  const handleConvertToInvoice = (quote: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (quote.status === 'CONVERTED') {
      alert('Ce devis a déjà été converti en facture');
      return;
    }
    if (window.confirm(`Voulez-vous convertir le devis ${quote.number} en facture ?`)) {
      const invoice = convertQuoteToInvoice(quote.id);
      onConvertToInvoice?.(invoice);
    }
  };

  const handleDelete = (quote: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le devis ${quote.number} ?`)) {
      deleteInvoice(quote.id);
      onDelete?.(quote);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par numéro, client, référence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full md:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | '')}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'DRAFT', label: 'Brouillon' },
              { value: 'SENT', label: 'Envoyé' },
              { value: 'VIEWED', label: 'Consulté' },
              { value: 'CONVERTED', label: 'Converti' },
              { value: 'CANCELLED', label: 'Annulé' },
            ]}
          />
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total devis</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Montant total</div>
          <div className="text-2xl font-bold">{formatAmount(stats.totalAmount)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Convertis</div>
          <div className="text-2xl font-bold text-green-600">{stats.convertedCount}</div>
        </Card>
        {stats.expiredCount > 0 && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="text-sm text-red-600">Expirés</div>
            <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {stats.expiredCount}
            </div>
          </Card>
        )}
      </div>

      {/* Message si aucun devis */}
      {displayedQuotes.length === 0 && (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun devis trouvé</h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter
              ? 'Aucun devis ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre premier devis.'}
          </p>
        </Card>
      )}

      {/* Liste des devis */}
      {displayedQuotes.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Numéro
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date d'émission
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date d'expiration
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Montant TTC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedQuotes.map((quote) => {
                  const thirdParty = getThirdParty(quote.thirdPartyId);
                  const expired = isExpired(quote);

                  return (
                    <tr
                      key={quote.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelect?.(quote)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{quote.number}</div>
                        {quote.reference && (
                          <div className="text-sm text-gray-500">{quote.reference}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{thirdParty?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{thirdParty?.code}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatDate(quote.issueDate)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {quote.dueDate ? (
                          <span className={expired ? 'text-red-600 font-medium' : ''}>
                            {formatDate(quote.dueDate)}
                            {expired && ' (expiré)'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatAmount(quote.totalTTC)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            quote.status
                          )}`}
                        >
                          {getStatusLabel(quote.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {quote.status !== 'CONVERTED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleConvertToInvoice(quote, e)}
                              title="Convertir en facture"
                            >
                              <ArrowRight className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {onViewPDF && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewPDF(quote);
                              }}
                              title="Voir PDF"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEdit && quote.status !== 'CONVERTED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(quote);
                              }}
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDuplicate(quote, e)}
                            title="Dupliquer"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {onDelete && quote.status !== 'CONVERTED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDelete(quote, e)}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
