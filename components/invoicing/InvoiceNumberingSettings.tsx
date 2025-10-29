/**
 * Composant de configuration de la numérotation des documents
 * Story F.6 - Système de numérotation personnalisable
 */

'use client';

import { useState, useEffect } from 'react';
import { useInvoicingStore } from '@/store/invoicing';
import { InvoiceNumberingConfig, InvoiceType } from '@/types/invoicing';
import { Button } from '@/components/ui/Button';
import { Settings, Save, RotateCcw, Eye, FileText, Receipt, FileCheck, ShoppingCart, Truck } from 'lucide-react';

interface NumberingFormData {
  type: InvoiceType;
  prefix: string;
  includeYear: boolean;
  counterDigits: number;
  separator: string;
  resetOnNewYear: boolean;
}

const DOCUMENT_TYPES: Array<{
  type: InvoiceType;
  label: string;
  icon: React.ReactNode;
  defaultPrefix: string;
  description: string;
}> = [
  {
    type: 'INVOICE',
    label: 'Factures',
    icon: <Receipt className="h-5 w-5" />,
    defaultPrefix: 'FA',
    description: 'Factures de vente clients',
  },
  {
    type: 'QUOTE',
    label: 'Devis',
    icon: <FileText className="h-5 w-5" />,
    defaultPrefix: 'DEV',
    description: 'Devis commerciaux',
  },
  {
    type: 'CREDIT_NOTE',
    label: 'Avoirs',
    icon: <FileCheck className="h-5 w-5" />,
    defaultPrefix: 'AV',
    description: 'Notes de crédit',
  },
  {
    type: 'PROFORMA',
    label: 'Pro-forma',
    icon: <FileText className="h-5 w-5" />,
    defaultPrefix: 'PRO',
    description: 'Factures pro-forma',
  },
  {
    type: 'PURCHASE_INVOICE',
    label: 'Factures Achat',
    icon: <ShoppingCart className="h-5 w-5" />,
    defaultPrefix: 'FACH',
    description: 'Factures fournisseurs',
  },
  {
    type: 'DELIVERY_NOTE',
    label: 'Bons de Livraison',
    icon: <Truck className="h-5 w-5" />,
    defaultPrefix: 'BL',
    description: 'Bons de livraison',
  },
];

export function InvoiceNumberingSettings({ companyId }: { companyId: string }) {
  const { numberingConfigs, setNumberingConfig } = useInvoicingStore();
  const [selectedType, setSelectedType] = useState<InvoiceType>('INVOICE');
  const [formData, setFormData] = useState<NumberingFormData>({
    type: 'INVOICE',
    prefix: 'FA',
    includeYear: true,
    counterDigits: 5,
    separator: '-',
    resetOnNewYear: true,
  });
  const [previewNumber, setPreviewNumber] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Charger la configuration existante pour le type sélectionné
  useEffect(() => {
    const config = numberingConfigs.find(
      (c) => c.companyId === companyId && c.type === selectedType
    );

    if (config) {
      setFormData({
        type: config.type,
        prefix: config.prefix,
        includeYear: config.includeYear,
        counterDigits: config.counterDigits,
        separator: config.separator,
        resetOnNewYear: config.resetOnNewYear,
      });
    } else {
      // Utiliser les valeurs par défaut
      const docType = DOCUMENT_TYPES.find((dt) => dt.type === selectedType);
      setFormData({
        type: selectedType,
        prefix: docType?.defaultPrefix || 'DOC',
        includeYear: true,
        counterDigits: 5,
        separator: '-',
        resetOnNewYear: true,
      });
    }
    setHasChanges(false);
  }, [selectedType, numberingConfigs, companyId]);

  // Mettre à jour l'aperçu
  useEffect(() => {
    const year = new Date().getFullYear();
    const counterStr = '1'.padStart(formData.counterDigits, '0');

    let preview = formData.prefix;
    if (formData.includeYear) {
      preview += `${formData.separator}${year}`;
    }
    preview += `${formData.separator}${counterStr}`;

    setPreviewNumber(preview);
  }, [formData]);

  const handleChange = (field: keyof NumberingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    const config = numberingConfigs.find(
      (c) => c.companyId === companyId && c.type === formData.type
    );

    const newConfig: InvoiceNumberingConfig = {
      id: config?.id || `config-${formData.type}-${companyId}`,
      companyId,
      type: formData.type,
      prefix: formData.prefix,
      includeYear: formData.includeYear,
      counterDigits: formData.counterDigits,
      separator: formData.separator,
      currentCounter: config?.currentCounter || 0,
      resetOnNewYear: formData.resetOnNewYear,
    };

    setNumberingConfig(newConfig);
    setHasChanges(false);
    setSaveSuccess(true);

    // Masquer le message de succès après 3 secondes
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    const docType = DOCUMENT_TYPES.find((dt) => dt.type === selectedType);
    setFormData({
      type: selectedType,
      prefix: docType?.defaultPrefix || 'DOC',
      includeYear: true,
      counterDigits: 5,
      separator: '-',
      resetOnNewYear: true,
    });
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const currentConfig = numberingConfigs.find(
    (c) => c.companyId === companyId && c.type === selectedType
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Settings className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Configuration de la numérotation</h2>
          <p className="text-sm text-gray-400">
            Personnalisez le format de numérotation pour chaque type de document
          </p>
        </div>
      </div>

      {/* Sélection du type de document */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          Type de document
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DOCUMENT_TYPES.map((docType) => {
            const config = numberingConfigs.find(
              (c) => c.companyId === companyId && c.type === docType.type
            );
            const isConfigured = !!config;
            const isSelected = selectedType === docType.type;

            return (
              <button
                key={docType.type}
                onClick={() => setSelectedType(docType.type)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all text-left
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                    p-2 rounded-lg
                    ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}
                  `}
                  >
                    {docType.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white">{docType.label}</h3>
                      {isConfigured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400">
                          Configuré
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{docType.description}</p>
                    {isConfigured && (
                      <p className="text-xs text-gray-500 mt-2 font-mono">
                        Prochain: {config.prefix}
                        {config.includeYear ? `${config.separator}${new Date().getFullYear()}` : ''}
                        {config.separator}
                        {String(config.currentCounter + 1).padStart(config.counterDigits, '0')}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Formulaire de configuration */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">
            Configuration - {DOCUMENT_TYPES.find((dt) => dt.type === selectedType)?.label}
          </h3>
          {currentConfig && (
            <div className="text-sm text-gray-400">
              Compteur actuel: <span className="text-white font-mono">{currentConfig.currentCounter}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Préfixe */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Préfixe <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.prefix}
              onChange={(e) => handleChange('prefix', e.target.value.toUpperCase())}
              placeholder="FA"
              maxLength={10}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <p className="text-xs text-gray-500">
              Code court pour identifier le type de document
            </p>
          </div>

          {/* Séparateur */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Séparateur <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.separator}
              onChange={(e) => handleChange('separator', e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="-">Tiret (-)</option>
              <option value="_">Underscore (_)</option>
              <option value="/">Slash (/)</option>
              <option value="">Aucun</option>
            </select>
            <p className="text-xs text-gray-500">
              Caractère de séparation entre les éléments
            </p>
          </div>

          {/* Nombre de chiffres */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Nombre de chiffres <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={formData.counterDigits}
              onChange={(e) => handleChange('counterDigits', parseInt(e.target.value) || 5)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500">
              Nombre de chiffres pour le compteur (3-10)
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">Options</label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.includeYear}
                onChange={(e) => handleChange('includeYear', e.target.checked)}
                className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Inclure l'année</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.resetOnNewYear}
                onChange={(e) => handleChange('resetOnNewYear', e.target.checked)}
                className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Réinitialiser le compteur chaque année</span>
            </label>
          </div>
        </div>

        {/* Aperçu */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="h-5 w-5 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-300">Aperçu de la numérotation</h4>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-2xl font-mono font-bold text-white">{previewNumber}</p>
              <p className="text-xs text-gray-500 mt-1">
                Exemple pour le prochain document créé
              </p>
            </div>
            <div className="text-right text-sm text-gray-400">
              <div>Format:</div>
              <div className="font-mono text-gray-300">
                {formData.prefix}
                {formData.includeYear ? `${formData.separator}YYYY` : ''}
                {formData.separator}
                {'X'.repeat(formData.counterDigits)}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </Button>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-sm text-green-400 flex items-center gap-2">
                <span className="h-2 w-2 bg-green-400 rounded-full"></span>
                Configuration enregistrée
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Enregistrer
            </Button>
          </div>
        </div>
      </div>

      {/* Avertissement pour les modifications */}
      {hasChanges && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-sm text-yellow-400">
            Les modifications ne seront appliquées qu'aux nouveaux documents créés. Les documents existants conserveront leur numérotation actuelle.
          </p>
        </div>
      )}
    </div>
  );
}
