'use client';

/**
 * ReminderForm Component
 * EPIC Facturation - Story F.5
 * Formulaire d'envoi de relances pour factures en retard
 */

import { useState } from 'react';
import { useInvoicingStore } from '@/store/invoicing';
import { ReminderLevel } from '@/types/invoicing';
import { Mail, Send, FileText, AlertCircle } from 'lucide-react';

interface ReminderFormProps {
  invoiceId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReminderForm({ invoiceId, onSuccess, onCancel }: ReminderFormProps) {
  const invoice = useInvoicingStore((state) =>
    state.invoices.find((inv) => inv.id === invoiceId)
  );
  const reminderTemplates = useInvoicingStore((state) => state.reminderTemplates);
  const sendReminder = useInvoicingStore((state) => state.sendReminder);
  const generateReminderFromTemplate = useInvoicingStore(
    (state) => state.generateReminderFromTemplate
  );
  const getDaysOverdue = useInvoicingStore((state) => state.getDaysOverdue);

  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<ReminderLevel>('FIRST');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!invoice) {
    return (
      <div className="text-red-500">
        <AlertCircle className="w-5 h-5 inline mr-2" />
        Facture introuvable
      </div>
    );
  }

  const thirdParty = invoice.thirdParty || useInvoicingStore.getState().getThirdParty(invoice.thirdPartyId);
  const daysOverdue = getDaysOverdue(invoiceId);

  // Initialiser les destinataires
  if (recipientEmails.length === 0 && thirdParty?.email) {
    setRecipientEmails([thirdParty.email]);
  }

  const activeTemplates = reminderTemplates.filter((t) => t.isActive);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = reminderTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedLevel(template.level);
      // Générer l'aperçu du message
      try {
        const reminder = generateReminderFromTemplate(invoiceId, templateId);
        setSubject(reminder.subject);
        setMessage(reminder.message);
      } catch (error) {
        console.error('Error generating reminder:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const reminderData = {
        invoiceId,
        type: useTemplate ? ('AUTOMATIC' as const) : ('MANUAL' as const),
        level: selectedLevel,
        subject,
        message,
        sentTo: recipientEmails,
        daysOverdue,
      };

      sendReminder(invoiceId, reminderData);
      onSuccess?.();
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Erreur lors de l\'envoi de la relance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1a1f2e] rounded-lg border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Envoyer une relance</h3>
            <p className="text-sm text-gray-400">
              Facture {invoice.number} • {daysOverdue} jour(s) de retard
            </p>
          </div>
        </div>

        {/* Alerte information */}
        <div className="mt-4 flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-200">
            <p className="font-medium">Attention</p>
            <p className="text-yellow-300/80 mt-1">
              Cette relance sera enregistrée dans l'historique de la facture. En production, un email
              serait envoyé aux destinataires.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Mode de relance */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Mode de relance
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setUseTemplate(true)}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                useTemplate
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <FileText className="w-5 h-5 mb-2 mx-auto" />
              <div className="text-sm font-medium">Utiliser un template</div>
              <div className="text-xs text-gray-400 mt-1">Message pré-rédigé</div>
            </button>
            <button
              type="button"
              onClick={() => setUseTemplate(false)}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                !useTemplate
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <Mail className="w-5 h-5 mb-2 mx-auto" />
              <div className="text-sm font-medium">Message personnalisé</div>
              <div className="text-xs text-gray-400 mt-1">Rédiger manuellement</div>
            </button>
          </div>
        </div>

        {/* Sélection du template */}
        {useTemplate && (
          <div>
            <label htmlFor="template" className="text-sm font-medium text-gray-300 mb-2 block">
              Template de relance
            </label>
            <select
              id="template"
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Sélectionner un template --</option>
              {activeTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.daysOverdue}+ jours)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Niveau de relance */}
        <div>
          <label htmlFor="level" className="text-sm font-medium text-gray-300 mb-2 block">
            Niveau de relance
          </label>
          <select
            id="level"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as ReminderLevel)}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={useTemplate && !!selectedTemplateId}
          >
            <option value="FIRST">Première relance</option>
            <option value="SECOND">Relance modérée</option>
            <option value="THIRD">Relance sévère</option>
            <option value="FINAL">Mise en demeure</option>
          </select>
        </div>

        {/* Destinataires */}
        <div>
          <label htmlFor="recipients" className="text-sm font-medium text-gray-300 mb-2 block">
            Destinataires
          </label>
          <input
            type="text"
            id="recipients"
            value={recipientEmails.join(', ')}
            onChange={(e) => setRecipientEmails(e.target.value.split(',').map((s) => s.trim()))}
            placeholder="email@exemple.ma"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Séparer plusieurs emails par des virgules
          </p>
        </div>

        {/* Sujet */}
        <div>
          <label htmlFor="subject" className="text-sm font-medium text-gray-300 mb-2 block">
            Sujet
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Objet de la relance"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={useTemplate && !selectedTemplateId}
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="text-sm font-medium text-gray-300 mb-2 block">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Contenu de la relance..."
            rows={10}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
            disabled={useTemplate && !selectedTemplateId}
          />
          <p className="text-xs text-gray-400 mt-1">
            Variables disponibles : {'{invoice_number}'}, {'{customer_name}'}, {'{amount_due}'}, {'{due_date}'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || (useTemplate && !selectedTemplateId)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer la relance'}
          </button>
        </div>
      </form>
    </div>
  );
}
