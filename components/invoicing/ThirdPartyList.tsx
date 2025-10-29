'use client'

import React, { useState } from 'react';
import { useInvoicingStore } from '@/store/invoicing';
import { ThirdParty, ThirdPartyType } from '@/types/invoicing';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface ThirdPartyListProps {
  type?: ThirdPartyType;
  onSelect?: (thirdParty: ThirdParty) => void;
  onEdit?: (thirdParty: ThirdParty) => void;
  onDelete?: (thirdParty: ThirdParty) => void;
}

export default function ThirdPartyList({
  type,
  onSelect,
  onEdit,
  onDelete,
}: ThirdPartyListProps) {
  const { thirdParties, searchThirdParties } = useInvoicingStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les tiers
  const filteredThirdParties = searchQuery
    ? searchThirdParties(searchQuery, type)
    : thirdParties.filter((tp) => {
        if (!type) return tp.isActive;
        return (tp.type === type || tp.type === 'BOTH') && tp.isActive;
      });

  const formatAmount = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount);
  };

  const getTypeLabel = (tpType: ThirdPartyType) => {
    switch (tpType) {
      case 'CLIENT':
        return 'Client';
      case 'SUPPLIER':
        return 'Fournisseur';
      case 'BOTH':
        return 'Client & Fournisseur';
    }
  };

  const getTypeBadgeColor = (tpType: ThirdPartyType) => {
    switch (tpType) {
      case 'CLIENT':
        return 'bg-green-100 text-green-800';
      case 'SUPPLIER':
        return 'bg-blue-100 text-blue-800';
      case 'BOTH':
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par nom, code, ICE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <p className="text-sm text-claude-text-muted">Total</p>
          <p className="text-2xl font-semibold text-claude-text">
            {filteredThirdParties.length}
          </p>
        </Card>
        {type === 'CLIENT' && (
          <>
            <Card className="p-3">
              <p className="text-sm text-claude-text-muted">CA Total</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatAmount(
                  filteredThirdParties.reduce((sum, tp) => sum + (tp.totalSales || 0), 0)
                )}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-sm text-claude-text-muted">Encours</p>
              <p className="text-2xl font-semibold text-orange-600">
                {formatAmount(
                  filteredThirdParties.reduce(
                    (sum, tp) => sum + (tp.outstandingBalance || 0),
                    0
                  )
                )}
              </p>
            </Card>
          </>
        )}
        {type === 'SUPPLIER' && (
          <Card className="p-3">
            <p className="text-sm text-claude-text-muted">Total Achats</p>
            <p className="text-2xl font-semibold text-blue-600">
              {formatAmount(
                filteredThirdParties.reduce((sum, tp) => sum + (tp.totalPurchases || 0), 0)
              )}
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
                  Code
                </th>
                <th className="text-left p-3 text-sm font-medium text-claude-text-muted">
                  Raison sociale
                </th>
                {!type && (
                  <th className="text-left p-3 text-sm font-medium text-claude-text-muted">
                    Type
                  </th>
                )}
                <th className="text-left p-3 text-sm font-medium text-claude-text-muted">
                  ICE
                </th>
                <th className="text-left p-3 text-sm font-medium text-claude-text-muted">
                  Ville
                </th>
                <th className="text-left p-3 text-sm font-medium text-claude-text-muted">
                  Contact
                </th>
                {type === 'CLIENT' && (
                  <th className="text-right p-3 text-sm font-medium text-claude-text-muted">
                    Encours
                  </th>
                )}
                {type === 'SUPPLIER' && (
                  <th className="text-right p-3 text-sm font-medium text-claude-text-muted">
                    Total Achats
                  </th>
                )}
                <th className="text-right p-3 text-sm font-medium text-claude-text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredThirdParties.length === 0 ? (
                <tr>
                  <td
                    colSpan={type ? 7 : 8}
                    className="p-8 text-center text-claude-text-muted"
                  >
                    Aucun tiers trouvé
                  </td>
                </tr>
              ) : (
                filteredThirdParties.map((tp) => (
                  <tr
                    key={tp.id}
                    className="border-b border-claude-border hover:bg-claude-bg-hover cursor-pointer transition-colors"
                    onClick={() => onSelect?.(tp)}
                  >
                    <td className="p-3">
                      <span className="font-mono text-sm text-claude-text">
                        {tp.code}
                      </span>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-claude-text">{tp.name}</p>
                        {tp.commercialName && (
                          <p className="text-sm text-claude-text-muted">
                            {tp.commercialName}
                          </p>
                        )}
                      </div>
                    </td>
                    {!type && (
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${getTypeBadgeColor(
                            tp.type
                          )}`}
                        >
                          {getTypeLabel(tp.type)}
                        </span>
                      </td>
                    )}
                    <td className="p-3">
                      <span className="font-mono text-sm text-claude-text">
                        {tp.ice || '-'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-claude-text">{tp.city || '-'}</span>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {tp.email && (
                          <p className="text-claude-text">{tp.email}</p>
                        )}
                        {tp.phone && (
                          <p className="text-claude-text-muted">{tp.phone}</p>
                        )}
                      </div>
                    </td>
                    {type === 'CLIENT' && (
                      <td className="p-3 text-right">
                        <span
                          className={`font-semibold ${
                            (tp.outstandingBalance || 0) > 0
                              ? 'text-orange-600'
                              : 'text-claude-text-muted'
                          }`}
                        >
                          {formatAmount(tp.outstandingBalance)}
                        </span>
                      </td>
                    )}
                    {type === 'SUPPLIER' && (
                      <td className="p-3 text-right">
                        <span className="font-semibold text-claude-text">
                          {formatAmount(tp.totalPurchases)}
                        </span>
                      </td>
                    )}
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(tp);
                            }}
                          >
                            Modifier
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(tp);
                            }}
                          >
                            Supprimer
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
