'use client';

import React, { useState } from 'react';
import { useAccountingStore } from '@/store/accounting';
import { Account, AccountClass, AccountType } from '@/types/accounting';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Search, BookMarked } from 'lucide-react';

export const ChartOfAccounts: React.FC = () => {
  const { accounts, addCustomAccount } = useAccountingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Formulaire de création de compte personnalisé
  const [customAccount, setCustomAccount] = useState({
    number: '',
    label: '',
    class: 1 as AccountClass,
    type: 'ASSET' as AccountType,
    isDetailAccount: true,
    justification: '',
  });

  // Filtrer les comptes
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch =
      searchTerm === '' ||
      account.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.label.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === '' || account.class.toString() === selectedClass;

    return matchesSearch && matchesClass;
  });

  // Grouper par classe
  const accountsByClass = filteredAccounts.reduce((acc, account) => {
    const classNumber = account.class;
    if (!acc[classNumber]) {
      acc[classNumber] = [];
    }
    acc[classNumber].push(account);
    return acc;
  }, {} as Record<number, Account[]>);

  const handleCreateCustomAccount = () => {
    if (!customAccount.number || !customAccount.label) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    addCustomAccount({
      ...customAccount,
      isMandatory: false,
      isActive: true,
      currency: 'MAD',
      createdBy: 'user-1', // À remplacer par l'utilisateur connecté
    });

    // Réinitialiser le formulaire
    setCustomAccount({
      number: '',
      label: '',
      class: 1,
      type: 'ASSET',
      isDetailAccount: true,
      justification: '',
    });
    setShowCustomForm(false);

    alert('Compte personnalisé créé avec succès !');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Plan de Comptes CGNC</CardTitle>
              <CardDescription>
                Code Général de Normalisation Comptable - Classes 1 à 8
              </CardDescription>
            </div>
            <Button onClick={() => setShowCustomForm(!showCustomForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un compte
            </Button>
          </div>
        </CardHeader>

        <div className="p-6 space-y-6">
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-claude-text-muted" />
              <Input
                placeholder="Rechercher par numéro ou libellé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={[
                { value: '', label: 'Toutes les classes' },
                { value: '1', label: 'Classe 1 - Financement permanent' },
                { value: '2', label: 'Classe 2 - Actif immobilisé' },
                { value: '3', label: 'Classe 3 - Actif circulant' },
                { value: '4', label: 'Classe 4 - Passif circulant' },
                { value: '5', label: 'Classe 5 - Trésorerie' },
                { value: '6', label: 'Classe 6 - Charges' },
                { value: '7', label: 'Classe 7 - Produits' },
                { value: '8', label: 'Classe 8 - Résultats' },
              ]}
            />
          </div>

          {/* Résumé */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-claude-surface">
              <div className="text-sm text-claude-text-muted">Total comptes</div>
              <div className="text-2xl font-bold text-claude-text">{accounts.length}</div>
            </div>
            <div className="p-4 rounded-lg bg-claude-surface">
              <div className="text-sm text-claude-text-muted">Comptes de détail</div>
              <div className="text-2xl font-bold text-claude-text">
                {accounts.filter(a => a.isDetailAccount).length}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-claude-surface">
              <div className="text-sm text-claude-text-muted">Comptes CGNC</div>
              <div className="text-2xl font-bold text-claude-text">
                {accounts.filter(a => !a.isCustom).length}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-claude-surface">
              <div className="text-sm text-claude-text-muted">Comptes personnalisés</div>
              <div className="text-2xl font-bold text-claude-accent">
                {accounts.filter(a => a.isCustom).length}
              </div>
            </div>
          </div>

          {/* Liste des comptes */}
          {Object.keys(accountsByClass).length === 0 ? (
            <div className="p-12 text-center bg-claude-surface rounded-lg">
              <BookMarked className="w-12 h-12 mx-auto mb-4 text-claude-text-muted opacity-50" />
              <p className="text-claude-text-muted">Aucun compte trouvé</p>
            </div>
          ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Détail</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(accountsByClass)
                    .sort()
                    .map((classNumber) => {
                      const classAccounts = accountsByClass[Number(classNumber)];
                      const classAccount = accounts.find(a => a.number === classNumber);

                      return (
                        <React.Fragment key={classNumber}>
                          {/* En-tête de classe */}
                          <TableRow className="bg-claude-accent/10">
                            <TableCell colSpan={6} className="font-bold text-claude-accent">
                              CLASSE {classNumber} - {classAccount?.label || ''}
                            </TableCell>
                          </TableRow>

                          {/* Comptes de la classe */}
                          {classAccounts
                            .sort((a, b) => a.number.localeCompare(b.number))
                            .map((account) => (
                              <TableRow
                                key={account.id}
                                className={account.isCustom ? 'bg-yellow-50/50' : ''}
                              >
                                <TableCell className="font-mono font-medium">
                                  {account.number}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span
                                      style={{
                                        paddingLeft: `${(account.number.length - 1) * 12}px`,
                                      }}
                                    >
                                      {account.label}
                                    </span>
                                    {account.isCustom && (
                                      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-200 text-yellow-800">
                                        Personnalisé
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{account.class}</TableCell>
                                <TableCell>
                                  <span className="text-xs px-2 py-1 rounded bg-claude-surface">
                                    {account.type}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {account.isDetailAccount ? (
                                    <span className="text-green-600">✓ Oui</span>
                                  ) : (
                                    <span className="text-claude-text-muted">Non</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {account.isActive ? (
                                    <span className="text-green-600">Actif</span>
                                  ) : (
                                    <span className="text-red-600">Inactif</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                        </React.Fragment>
                      );
                    })}
                </TableBody>
              </Table>
          )}
        </div>
      </Card>

      {/* Formulaire de création de compte personnalisé */}
      {showCustomForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un compte personnalisé</CardTitle>
            <CardDescription>
              Les comptes personnalisés seront audités (utilisateur, date, justification)
            </CardDescription>
          </CardHeader>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Numéro de compte *"
                value={customAccount.number}
                onChange={(e) =>
                  setCustomAccount({ ...customAccount, number: e.target.value })
                }
                placeholder="Ex: 6128"
              />

              <Select
                label="Classe *"
                value={customAccount.class.toString()}
                onChange={(e) =>
                  setCustomAccount({
                    ...customAccount,
                    class: parseInt(e.target.value) as AccountClass,
                  })
                }
                options={[
                  { value: '1', label: 'Classe 1 - Financement permanent' },
                  { value: '2', label: 'Classe 2 - Actif immobilisé' },
                  { value: '3', label: 'Classe 3 - Actif circulant' },
                  { value: '4', label: 'Classe 4 - Passif circulant' },
                  { value: '5', label: 'Classe 5 - Trésorerie' },
                  { value: '6', label: 'Classe 6 - Charges' },
                  { value: '7', label: 'Classe 7 - Produits' },
                  { value: '8', label: 'Classe 8 - Résultats' },
                ]}
              />
            </div>

            <Input
              label="Libellé *"
              value={customAccount.label}
              onChange={(e) =>
                setCustomAccount({ ...customAccount, label: e.target.value })
              }
              placeholder="Ex: Autres achats de fournitures"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Type de compte *"
                value={customAccount.type}
                onChange={(e) =>
                  setCustomAccount({
                    ...customAccount,
                    type: e.target.value as AccountType,
                  })
                }
                options={[
                  { value: 'ASSET', label: 'Actif' },
                  { value: 'LIABILITY', label: 'Passif' },
                  { value: 'EQUITY', label: 'Capitaux propres' },
                  { value: 'REVENUE', label: 'Produits' },
                  { value: 'EXPENSE', label: 'Charges' },
                  { value: 'SPECIAL', label: 'Spécial' },
                ]}
              />

              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="isDetailAccount"
                  checked={customAccount.isDetailAccount}
                  onChange={(e) =>
                    setCustomAccount({
                      ...customAccount,
                      isDetailAccount: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="isDetailAccount" className="text-sm text-claude-text">
                  Compte de détail (peut recevoir des écritures)
                </label>
              </div>
            </div>

            <Input
              label="Justification (recommandé)"
              value={customAccount.justification}
              onChange={(e) =>
                setCustomAccount({ ...customAccount, justification: e.target.value })
              }
              placeholder="Pourquoi ce compte est-il nécessaire ?"
            />

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowCustomForm(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateCustomAccount}>Créer le compte</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
