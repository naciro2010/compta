'use client';

import React, { useMemo } from 'react';
import { useAccountingStore } from '@/store/accounting';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Download, FileText } from 'lucide-react';

export const Balance: React.FC = () => {
  const { currentPeriod, getBalance, accounts } = useAccountingStore();

  const balance = useMemo(() => {
    if (!currentPeriod) return null;
    return getBalance(currentPeriod.id);
  }, [currentPeriod, getBalance]);

  const exportToCSV = () => {
    if (!balance) return;

    const headers = [
      'Compte',
      'Libellé',
      'Débit Période',
      'Crédit Période',
      'Solde Débiteur',
      'Solde Créditeur',
    ];

    const rows = balance.lines.map(line => [
      line.account?.number || '',
      line.account?.label || '',
      line.periodDebit.toFixed(2),
      line.periodCredit.toFixed(2),
      line.closingDebit.toFixed(2),
      line.closingCredit.toFixed(2),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      `TOTAUX,,,,${balance.totalDebit.toFixed(2)},${balance.totalCredit.toFixed(2)}`,
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `balance_${currentPeriod?.label.replace(/\s/g, '_')}.csv`;
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

  if (!balance || balance.lines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance Générale</CardTitle>
          <CardDescription>{currentPeriod.label}</CardDescription>
        </CardHeader>
        <div className="p-12 text-center">
          <p className="text-claude-text-muted">
            Aucune écriture comptable pour cette période
          </p>
        </div>
      </Card>
    );
  }

  // Grouper par classe
  const linesByClass = balance.lines.reduce((acc, line) => {
    const accountClass = line.account?.class || 0;
    if (!acc[accountClass]) {
      acc[accountClass] = [];
    }
    acc[accountClass].push(line);
    return acc;
  }, {} as Record<number, typeof balance.lines>);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Balance Générale</CardTitle>
            <CardDescription>{currentPeriod.label}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Compte</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead className="text-right">Débit Période</TableHead>
                <TableHead className="text-right">Crédit Période</TableHead>
                <TableHead className="text-right">Solde Débiteur</TableHead>
                <TableHead className="text-right">Solde Créditeur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(linesByClass)
                .sort()
                .map((classNumber) => {
                  const classLines = linesByClass[Number(classNumber)];
                  const classAccount = accounts.find(a => a.number === classNumber);

                  // Totaux par classe
                  const classTotals = classLines.reduce(
                    (acc, line) => ({
                      periodDebit: acc.periodDebit + line.periodDebit,
                      periodCredit: acc.periodCredit + line.periodCredit,
                      closingDebit: acc.closingDebit + line.closingDebit,
                      closingCredit: acc.closingCredit + line.closingCredit,
                    }),
                    { periodDebit: 0, periodCredit: 0, closingDebit: 0, closingCredit: 0 }
                  );

                  return (
                    <React.Fragment key={classNumber}>
                      {/* Ligne de titre de classe */}
                      <TableRow className="bg-claude-accent/10">
                        <TableCell colSpan={6} className="font-semibold text-claude-accent">
                          CLASSE {classNumber} - {classAccount?.label || ''}
                        </TableCell>
                      </TableRow>

                      {/* Lignes de comptes */}
                      {classLines.map((line) => (
                        <TableRow key={line.accountId}>
                          <TableCell className="font-mono">
                            {line.account?.number}
                          </TableCell>
                          <TableCell>{line.account?.label}</TableCell>
                          <TableCell align="right" className="font-mono">
                            {line.periodDebit > 0 ? line.periodDebit.toFixed(2) : '-'}
                          </TableCell>
                          <TableCell align="right" className="font-mono">
                            {line.periodCredit > 0 ? line.periodCredit.toFixed(2) : '-'}
                          </TableCell>
                          <TableCell align="right" className="font-mono">
                            {line.closingDebit > 0 ? line.closingDebit.toFixed(2) : '-'}
                          </TableCell>
                          <TableCell align="right" className="font-mono">
                            {line.closingCredit > 0 ? line.closingCredit.toFixed(2) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Ligne de sous-total de classe */}
                      <TableRow className="bg-claude-bg-secondary font-medium">
                        <TableCell colSpan={2} className="text-right">
                          Sous-total Classe {classNumber}
                        </TableCell>
                        <TableCell align="right" className="font-mono">
                          {classTotals.periodDebit.toFixed(2)}
                        </TableCell>
                        <TableCell align="right" className="font-mono">
                          {classTotals.periodCredit.toFixed(2)}
                        </TableCell>
                        <TableCell align="right" className="font-mono">
                          {classTotals.closingDebit.toFixed(2)}
                        </TableCell>
                        <TableCell align="right" className="font-mono">
                          {classTotals.closingCredit.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}

              {/* Ligne de total général */}
              <TableRow className="bg-claude-accent/20 font-bold text-lg">
                <TableCell colSpan={4} className="text-right">
                  TOTAUX GÉNÉRAUX
                </TableCell>
                <TableCell align="right" className="font-mono">
                  {balance.totalDebit.toFixed(2)} DH
                </TableCell>
                <TableCell align="right" className="font-mono">
                  {balance.totalCredit.toFixed(2)} DH
                </TableCell>
              </TableRow>

              {/* Vérification de l'équilibre */}
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {balance.isBalanced ? (
                    <span className="text-green-500 font-medium">
                      ✓ Balance équilibrée
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium">
                      ⚠ Balance déséquilibrée - Différence:{' '}
                      {Math.abs(balance.totalDebit - balance.totalCredit).toFixed(2)} DH
                    </span>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 text-sm text-claude-text-muted">
          <p>
            Balance générée le {balance.generatedAt.toLocaleString('fr-MA')}
          </p>
          <p className="mt-1">
            Conforme au Code Général de Normalisation Comptable (CGNC) - Maroc
          </p>
        </div>
      </div>
    </Card>
  );
};
