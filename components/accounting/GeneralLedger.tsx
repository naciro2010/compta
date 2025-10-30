'use client';

import React, { useState, useMemo } from 'react';
import { useAccountingStore } from '@/store/accounting';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Download, BookOpen } from 'lucide-react';

export const GeneralLedger: React.FC = () => {
  const { currentPeriod, accounts, getGeneralLedger } = useAccountingStore();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const detailAccounts = accounts.filter(a => a.isDetailAccount);

  const ledger = useMemo(() => {
    if (!currentPeriod) return null;
    return getGeneralLedger(currentPeriod.id, selectedAccountId || undefined);
  }, [currentPeriod, selectedAccountId, getGeneralLedger]);

  const exportToCSV = () => {
    if (!ledger) return;

    const headers = [
      'Date',
      'N° Pièce',
      'Journal',
      'Compte',
      'Libellé',
      'Référence',
      'Débit',
      'Crédit',
      'Solde',
    ];

    const rows = ledger.entries.map(entry => [
      entry.date.toLocaleDateString('fr-MA'),
      entry.entryNumber,
      entry.journalCode,
      entry.accountId,
      `"${entry.description}"`,
      entry.reference || '',
      entry.debit.toFixed(2),
      entry.credit.toFixed(2),
      entry.balance.toFixed(2),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const filename = selectedAccountId
      ? `grand_livre_${selectedAccountId}_${currentPeriod?.label.replace(/\s/g, '_')}.csv`
      : `grand_livre_${currentPeriod?.label.replace(/\s/g, '_')}.csv`;
    link.download = filename;
    link.click();
  };

  if (!currentPeriod) {
    return (
      <Card>
        <div className="p-12 text-center">
          <p className="text-claude-text-muted">
            Veuillez sélectionner une période comptable
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <CardTitle>Grand Livre</CardTitle>
            <CardDescription>{currentPeriod.label}</CardDescription>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {ledger && ledger.entries.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportToCSV} className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Exporter CSV
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <div className="p-6 space-y-6">
        {/* Filtre par compte */}
        <div className="max-w-md">
          <Select
            label="Filtrer par compte"
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            options={[
              { value: '', label: 'Tous les comptes' },
              ...detailAccounts.map(acc => ({
                value: acc.id,
                label: `${acc.number} - ${acc.label}`,
              })),
            ]}
          />
        </div>

        {/* Tableau du grand livre */}
        {!ledger || ledger.entries.length === 0 ? (
          <div className="p-12 text-center bg-claude-surface rounded-lg">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-claude-text-muted opacity-50" />
            <p className="text-claude-text-muted">
              Aucune écriture comptable pour cette période
              {selectedAccountId && ' et ce compte'}
            </p>
          </div>
        ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Date</TableHead>
                  <TableHead className="min-w-[100px]">N° Pièce</TableHead>
                  <TableHead className="min-w-[100px]">Journal</TableHead>
                  {!selectedAccountId && <TableHead className="min-w-[120px]">Compte</TableHead>}
                  <TableHead className="min-w-[200px]">Libellé</TableHead>
                  <TableHead className="min-w-[100px]">Référence</TableHead>
                  <TableHead className="text-right min-w-[120px]">Débit (MAD)</TableHead>
                  <TableHead className="text-right min-w-[120px]">Crédit (MAD)</TableHead>
                  <TableHead className="text-right min-w-[120px]">Solde (MAD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Ligne de solde d'ouverture si compte filtré */}
                {selectedAccountId && (
                  <TableRow className="bg-claude-surface font-medium">
                    <TableCell colSpan={5}>Solde d'ouverture</TableCell>
                    <TableCell></TableCell>
                    <TableCell align="right">-</TableCell>
                    <TableCell align="right">-</TableCell>
                    <TableCell align="right" className="font-mono">
                      0.00
                    </TableCell>
                  </TableRow>
                )}

                {/* Lignes d'écritures */}
                {ledger.entries.map((entry, index) => (
                  <TableRow key={`${entry.entryNumber}-${index}`}>
                    <TableCell className="whitespace-nowrap">
                      {entry.date.toLocaleDateString('fr-MA')}
                    </TableCell>
                    <TableCell className="font-mono">{entry.entryNumber}</TableCell>
                    <TableCell className="font-medium">{entry.journalCode}</TableCell>
                    {!selectedAccountId && (
                      <TableCell className="font-mono text-sm">
                        {entry.accountId}
                      </TableCell>
                    )}
                    <TableCell className="max-w-md">{entry.description}</TableCell>
                    <TableCell className="text-sm text-claude-text-muted">
                      {entry.reference || '-'}
                    </TableCell>
                    <TableCell align="right" className="font-mono">
                      {entry.debit > 0 ? entry.debit.toFixed(2) : '-'}
                    </TableCell>
                    <TableCell align="right" className="font-mono">
                      {entry.credit > 0 ? entry.credit.toFixed(2) : '-'}
                    </TableCell>
                    <TableCell
                      align="right"
                      className={`font-mono font-medium ${
                        entry.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {entry.balance.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Ligne de totaux */}
                {selectedAccountId && (
                  <TableRow className="bg-claude-accent/20 font-bold">
                    <TableCell colSpan={5} className="text-right">
                      TOTAUX
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell align="right" className="font-mono">
                      {ledger.entries
                        .reduce((sum, e) => sum + e.debit, 0)
                        .toFixed(2)}
                    </TableCell>
                    <TableCell align="right" className="font-mono">
                      {ledger.entries
                        .reduce((sum, e) => sum + e.credit, 0)
                        .toFixed(2)}
                    </TableCell>
                    <TableCell align="right" className="font-mono">
                      {ledger.entries.length > 0
                        ? ledger.entries[ledger.entries.length - 1].balance.toFixed(2)
                        : '0.00'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        )}

        {/* Informations */}
        {ledger && ledger.entries.length > 0 && (
          <div className="mt-6 text-sm text-claude-text-muted space-y-1">
            <p>
              Grand Livre généré le {ledger.generatedAt.toLocaleString('fr-MA')}
            </p>
            <p>
              {ledger.entries.length} écriture(s) comptable(s)
            </p>
            {selectedAccountId && (
              <p className="font-medium text-claude-text">
                Compte:{' '}
                {detailAccounts.find(a => a.id === selectedAccountId)?.number} -{' '}
                {detailAccounts.find(a => a.id === selectedAccountId)?.label}
              </p>
            )}
            <p className="mt-2">
              Conforme au Code Général de Normalisation Comptable (CGNC) - Maroc
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
