'use client';

import React, { useState, useEffect } from 'react';
import { useAccountingStore } from '@/store/accounting';
import { EntryLine, Account, Journal } from '@/types/accounting';
import { validateBalance, calculateMADAmount } from '@/lib/accounting/validation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Plus, Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react';

export const EntryForm: React.FC = () => {
  const {
    accounts,
    journals,
    currentPeriod,
    currencies,
    currentEntry,
    setCurrentEntry,
    createEntry,
  } = useAccountingStore();

  const [journalId, setJournalId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [lines, setLines] = useState<Partial<EntryLine>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Comptes de détail seulement
  const detailAccounts = accounts.filter(a => a.isDetailAccount && a.isActive);

  // Ajouter une nouvelle ligne
  const addLine = () => {
    setLines([
      ...lines,
      {
        id: crypto.randomUUID(),
        accountId: '',
        label: description,
        debit: 0,
        credit: 0,
        currency: 'MAD',
        exchangeRate: 1,
        debitMAD: 0,
        creditMAD: 0,
      },
    ]);
  };

  // Mettre à jour une ligne
  const updateLine = (index: number, field: keyof EntryLine, value: any) => {
    const newLines = [...lines];
    const line = newLines[index];

    if (field === 'accountId') {
      line.accountId = value;
    } else if (field === 'label') {
      line.label = value;
    } else if (field === 'debit') {
      const debit = parseFloat(value) || 0;
      line.debit = debit;
      line.credit = 0; // Réinitialiser le crédit

      if (line.currency === 'MAD') {
        line.debitMAD = debit;
      } else {
        line.debitMAD = calculateMADAmount(debit, line.currency || 'MAD', line.exchangeRate);
      }
    } else if (field === 'credit') {
      const credit = parseFloat(value) || 0;
      line.credit = credit;
      line.debit = 0; // Réinitialiser le débit

      if (line.currency === 'MAD') {
        line.creditMAD = credit;
      } else {
        line.creditMAD = calculateMADAmount(credit, line.currency || 'MAD', line.exchangeRate);
      }
    } else if (field === 'currency') {
      line.currency = value;
      line.exchangeRate = currencies.find(c => c.code === value)?.exchangeRate || 1;

      // Recalculer les montants MAD
      if (line.debit && line.debit > 0) {
        line.debitMAD = calculateMADAmount(line.debit, value, line.exchangeRate);
      }
      if (line.credit && line.credit > 0) {
        line.creditMAD = calculateMADAmount(line.credit, value, line.exchangeRate);
      }
    }

    setLines(newLines);
  };

  // Supprimer une ligne
  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  // Calculer les totaux
  const totals = lines.reduce<{ debit: number; credit: number }>(
    (acc, line) => ({
      debit: acc.debit + (line.debitMAD || 0),
      credit: acc.credit + (line.creditMAD || 0),
    }),
    { debit: 0, credit: 0 }
  );

  const balance = validateBalance(lines.filter(l => l.accountId) as EntryLine[]);

  // Sauvegarder l'écriture
  const handleSave = () => {
    setErrors([]);

    // Validations de base
    const newErrors: string[] = [];

    if (!journalId) newErrors.push('Veuillez sélectionner un journal');
    if (!date) newErrors.push('Veuillez saisir une date');
    if (!description) newErrors.push('Veuillez saisir une description');
    if (lines.length === 0) newErrors.push('Veuillez ajouter au moins une ligne');
    if (lines.some(l => !l.accountId)) newErrors.push('Tous les comptes doivent être sélectionnés');
    if (lines.some(l => !l.label)) newErrors.push('Tous les libellés doivent être remplis');
    if (!balance.isBalanced) {
      newErrors.push(
        `L'écriture n'est pas équilibrée: Débit ${totals.debit.toFixed(2)} DH ≠ Crédit ${totals.credit.toFixed(2)} DH`
      );
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Créer l'écriture
    try {
      createEntry({
        journalId,
        date: new Date(date),
        periodId: currentPeriod?.id || '',
        reference,
        description,
        lines: lines as EntryLine[],
        createdBy: 'user-1', // À remplacer par l'utilisateur connecté
      });

      // Réinitialiser le formulaire
      setJournalId('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setReference('');
      setLines([]);
      setErrors([]);

      alert('Écriture enregistrée avec succès !');
    } catch (error) {
      setErrors([`Erreur lors de l'enregistrement: ${error}`]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle écriture comptable</CardTitle>
        <CardDescription>
          Saisie guidée en partie double - Conforme au CGNC
        </CardDescription>
      </CardHeader>

      <div className="p-6 space-y-6">
        {/* En-tête de l'écriture */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Journal *"
            value={journalId}
            onChange={(e) => setJournalId(e.target.value)}
            options={[
              { value: '', label: 'Sélectionner un journal' },
              ...journals.map(j => ({ value: j.id, label: `${j.code} - ${j.label}` })),
            ]}
          />

          <Input
            type="date"
            label="Date *"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Input
            label="Référence"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="N° facture, etc."
          />

          <div className="flex items-end">
            <div className="text-sm">
              <div className="font-medium text-claude-text">Période</div>
              <div className="text-claude-text-muted">
                {currentPeriod?.label || 'Non définie'}
              </div>
            </div>
          </div>
        </div>

        <Input
          label="Description *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description de l'opération"
        />

        {/* Lignes d'écriture */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-claude-text">Lignes d'écriture</h3>
            <Button onClick={addLine} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une ligne
            </Button>
          </div>

          {lines.length === 0 ? (
            <div className="text-center py-12 bg-claude-surface rounded-lg">
              <p className="text-claude-text-muted">
                Aucune ligne. Cliquez sur "Ajouter une ligne" pour commencer.
              </p>
            </div>
          ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Compte *</TableHead>
                    <TableHead className="min-w-[200px]">Libellé *</TableHead>
                    <TableHead className="min-w-[100px]">Devise</TableHead>
                    <TableHead className="text-right min-w-[120px]">Débit</TableHead>
                    <TableHead className="text-right min-w-[120px]">Crédit</TableHead>
                    <TableHead className="text-right min-w-[120px]">Débit (MAD)</TableHead>
                    <TableHead className="text-right min-w-[120px]">Crédit (MAD)</TableHead>
                    <TableHead className="min-w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line, index) => (
                    <TableRow key={line.id || index}>
                      <TableCell>
                        <select
                          value={line.accountId || ''}
                          onChange={(e) => updateLine(index, 'accountId', e.target.value)}
                          className="w-full px-2 py-1.5 rounded bg-claude-surface border border-claude-border text-claude-text text-sm focus:outline-none focus:ring-2 focus:ring-claude-accent cursor-pointer"
                        >
                          <option value="" className="bg-claude-surface text-claude-text">Sélectionner</option>
                          {detailAccounts.map(acc => (
                            <option key={acc.id} value={acc.id} className="bg-claude-surface text-claude-text">
                              {acc.number} - {acc.label}
                            </option>
                          ))}
                        </select>
                      </TableCell>

                      <TableCell>
                        <Input
                          value={line.label || ''}
                          onChange={(e) => updateLine(index, 'label', e.target.value)}
                          placeholder="Libellé"
                          className="min-w-[200px]"
                        />
                      </TableCell>

                      <TableCell>
                        <select
                          value={line.currency || 'MAD'}
                          onChange={(e) => updateLine(index, 'currency', e.target.value)}
                          className="w-full px-2 py-1.5 rounded bg-claude-surface border border-claude-border text-claude-text text-sm focus:outline-none focus:ring-2 focus:ring-claude-accent cursor-pointer"
                        >
                          {currencies.map(c => (
                            <option key={c.code} value={c.code} className="bg-claude-surface text-claude-text">
                              {c.code}
                            </option>
                          ))}
                        </select>
                      </TableCell>

                      <TableCell align="right">
                        <Input
                          type="number"
                          step="0.01"
                          value={line.debit || ''}
                          onChange={(e) => updateLine(index, 'debit', e.target.value)}
                          disabled={!!line.credit && line.credit > 0}
                          className="text-right w-32"
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Input
                          type="number"
                          step="0.01"
                          value={line.credit || ''}
                          onChange={(e) => updateLine(index, 'credit', e.target.value)}
                          disabled={!!line.debit && line.debit > 0}
                          className="text-right w-32"
                        />
                      </TableCell>

                      <TableCell align="right" className="font-mono">
                        {line.debitMAD ? line.debitMAD.toFixed(2) : '-'}
                      </TableCell>

                      <TableCell align="right" className="font-mono">
                        {line.creditMAD ? line.creditMAD.toFixed(2) : '-'}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Ligne de total */}
                  <TableRow className="font-semibold bg-claude-surface">
                    <TableCell colSpan={5} className="text-right">TOTAUX (MAD)</TableCell>
                    <TableCell align="right" className="font-mono">
                      {totals.debit.toFixed(2)} DH
                    </TableCell>
                    <TableCell align="right" className="font-mono">
                      {totals.credit.toFixed(2)} DH
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
          )}
        </div>

        {/* État de l'équilibre */}
        {lines.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-4 rounded-lg bg-claude-surface">
            {balance.isBalanced ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-green-500 font-medium text-sm sm:text-base">
                  Écriture équilibrée ✓
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-500 font-medium text-sm sm:text-base">
                  Déséquilibre: {balance.difference.toFixed(2)} DH
                </span>
              </>
            )}
          </div>
        )}

        {/* Erreurs */}
        {errors.length > 0 && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Erreurs de validation</h4>
                <ul className="mt-2 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setLines([]);
              setDescription('');
              setReference('');
              setErrors([]);
            }}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!balance.isBalanced} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Enregistrer l'écriture
          </Button>
        </div>
      </div>
    </Card>
  );
};
