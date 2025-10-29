'use client'

import React, { useState } from 'react';
import { useInvoicingStore } from '@/store/invoicing';
import { Invoice, InvoiceType, InvoiceStatus } from '@/types/invoicing';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { FileText, Eye, Edit, Trash2, Copy, Download, AlertCircle } from 'lucide-react';

interface InvoiceListProps {
  type?: InvoiceType;
  onSelect?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
  onDuplicate?: (invoice: Invoice) => void;
  onViewPDF?: (invoice: Invoice) => void;
}

export default function InvoiceList({
  type,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onViewPDF,
}: InvoiceListProps) {
  const { getInvoices, duplicateInvoice, getThirdParty } = useInvoicingStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<InvoiceType | ''>(type || '');

  // Get invoices with filters
  const allInvoices = getInvoices({
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  });

  // Filter by search query
  const filteredInvoices = searchQuery
    ? allInvoices.filter((inv) => {
        const thirdParty = getThirdParty(inv.thirdPartyId);
        return (
          inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thirdParty?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thirdParty?.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : allInvoices;

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

  const getTypeLabel = (invType: InvoiceType) => {
    switch (invType) {
      case 'INVOICE':
        return 'Facture';
      case 'QUOTE':
        return 'Devis';
      case 'CREDIT_NOTE':
        return 'Avoir';
      case 'PROFORMA':
        return 'Pro-forma';
      case 'PURCHASE_INVOICE':
        return 'Facture achat';
      case 'DELIVERY_NOTE':
        return 'Bon de livraison';
    }
  };

  const getTypeBadgeColor = (invType: InvoiceType) => {
    switch (invType) {
      case 'INVOICE':
        return 'bg-blue-100 text-blue-800';
      case 'QUOTE':
        return 'bg-purple-100 text-purple-800';
      case 'CREDIT_NOTE':
        return 'bg-red-100 text-red-800';
      case 'PROFORMA':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'Brouillon';
      case 'SENT':
        return 'Envoyée';
      case 'VIEWED':
        return 'Vue';
      case 'PARTIALLY_PAID':
        return 'Payée partiellement';
      case 'PAID':
        return 'Payée';
      case 'OVERDUE':
        return 'En retard';
      case 'CANCELLED':
        return 'Annulée';
      case 'CONVERTED':
        return 'Convertie';
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
      case 'PARTIALLY_PAID':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-600';
      case 'CONVERTED':
        return 'bg-purple-100 text-purple-800';
    }
  };

  const isOverdue = (invoice: Invoice) => {
    if (!invoice.dueDate) return false;
    return (
      new Date(invoice.dueDate) < new Date() &&
      invoice.status !== 'PAID' &&
      invoice.status !== 'CANCELLED'
    );
  };

  // Calculate statistics
  const stats = {
    total: filteredInvoices.length,
    totalAmount: filteredInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0),
    totalPaid: filteredInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
    totalDue: filteredInvoices.reduce((sum, inv) => sum + inv.amountDue, 0),
    overdueCount: filteredInvoices.filter((inv) => isOverdue(inv)).length,
  };

  const handleDuplicate = (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated = duplicateInvoice(invoice.id);
    onDuplicate?.(duplicated);
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

        {!type && (
          <div className="w-full md:w-48">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as InvoiceType | '')}
              options={[
                { value: '', label: 'Tous les types' },
                { value: 'INVOICE', label: 'Factures' },
                { value: 'QUOTE', label: 'Devis' },
                { value: 'CREDIT_NOTE', label: 'Avoirs' },
                { value: 'PROFORMA', label: 'Pro-forma' },
              ]}
            />
          </div>
        )}

        <div className="w-full md:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | '')}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'DRAFT', label: 'Brouillon' },
              { value: 'SENT', label: 'Envoyée' },
              { value: 'PAID', label: 'Payée' },
              { value: 'OVERDUE', label: 'En retard' },
              { value: 'CANCELLED', label: 'Annulée' },
            ]}
          />
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <p className="text-sm text-claude-text-muted">Total</p>
          <p className="text-2xl font-semibold text-claude-text">
            {stats.total}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-sm text-claude-text-muted">Montant total</p>
          <p className="text-lg font-semibold text-blue-600">
            {formatAmount(stats.totalAmount)}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-sm text-claude-text-muted">Payé</p>
          <p className="text-lg font-semibold text-green-600">
            {formatAmount(stats.totalPaid)}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-sm text-claude-text-muted">Restant dû</p>
          <p className="text-lg font-semibold text-orange-600">
            {formatAmount(stats.totalDue)}
          </p>
        </Card>
        {stats.overdueCount > 0 && (
          <Card className="p-3 bg-red-50 border-red-200">
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              En retard
            </p>
            <p className="text-2xl font-semibold text-red-700">
              {stats.overdueCount}
            </p>
          </Card>
        )}
      </div>

      {/* Tableau */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-claude-border">
                <th className="text-left p-3 text-sm font-medium text-claude-text-muted">
                  Numéro
                </th>
                {!type && (
                  <th className="text-left p-3 text-sm font-medium text-claude-text-muted">
                    Type
                  </th>
                )}
                <th className="text-left p-3 text-sm font-medium text-claude-text-muted">
                  Client
                </th>
                <th className="text-left p-3 text-sm font-medium text-claude-text-muted">
                  Date
                </th>
                <th className="text-left p-3 text-sm font-medium text-claude-text-muted">
                  Échéance
                </th>
                <th className="text-right p-3 text-sm font-medium text-claude-text-muted">
                  Montant TTC
                </th>
                <th className="text-right p-3 text-sm font-medium text-claude-text-muted">
                  Restant dû
                </th>
                <th className="text-left p-3 text-sm font-medium text-claude-text-muted">
                  Statut
                </th>
                <th className="text-right p-3 text-sm font-medium text-claude-text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={type ? 8 : 9}
                    className="p-8 text-center text-claude-text-muted"
                  >
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune facture trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const thirdParty = getThirdParty(invoice.thirdPartyId);
                  const overdue = isOverdue(invoice);

                  return (
                    <tr
                      key={invoice.id}
                      className={`border-b border-claude-border hover:bg-claude-bg-hover cursor-pointer transition-colors ${
                        overdue ? 'bg-red-50' : ''
                      }`}
                      onClick={() => onSelect?.(invoice)}
                    >
                      <td className="p-3">
                        <span className="font-mono text-sm font-medium text-claude-text">
                          {invoice.number}
                        </span>
                        {invoice.reference && (
                          <p className="text-xs text-claude-text-muted">
                            Réf: {invoice.reference}
                          </p>
                        )}
                      </td>
                      {!type && (
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${getTypeBadgeColor(
                              invoice.type
                            )}`}
                          >
                            {getTypeLabel(invoice.type)}
                          </span>
                        </td>
                      )}
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-claude-text">
                            {thirdParty?.name || 'Client inconnu'}
                          </p>
                          <p className="text-xs text-claude-text-muted">
                            {thirdParty?.code}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-claude-text">
                          {formatDate(invoice.issueDate)}
                        </span>
                      </td>
                      <td className="p-3">
                        {invoice.dueDate ? (
                          <span
                            className={`text-sm ${
                              overdue ? 'text-red-600 font-semibold' : 'text-claude-text'
                            }`}
                          >
                            {formatDate(invoice.dueDate)}
                          </span>
                        ) : (
                          <span className="text-sm text-claude-text-muted">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <span className="font-semibold text-claude-text">
                          {formatAmount(invoice.totalTTC)}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={`font-semibold ${
                            invoice.amountDue > 0
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {formatAmount(invoice.amountDue)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(
                            invoice.status
                          )}`}
                        >
                          {getStatusLabel(invoice.status)}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          {onViewPDF && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewPDF(invoice);
                              }}
                              title="Voir PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(invoice);
                              }}
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDuplicate(invoice, e)}
                            title="Dupliquer"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          {onDelete && invoice.status === 'DRAFT' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(invoice);
                              }}
                              title="Supprimer"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
