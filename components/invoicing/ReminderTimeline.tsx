'use client';

/**
 * ReminderTimeline Component
 * EPIC Facturation - Story F.5
 * Timeline des relances envoyées pour une facture
 */

import { InvoiceReminder, ReminderLevel } from '@/types/invoicing';
import { Mail, AlertTriangle, AlertOctagon, Gavel, Clock, CheckCircle2, Eye } from 'lucide-react';

interface ReminderTimelineProps {
  reminders: InvoiceReminder[];
}

export default function ReminderTimeline({ reminders }: ReminderTimelineProps) {
  if (!reminders || reminders.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 text-center border border-gray-700">
        <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">Aucune relance envoyée pour cette facture</p>
      </div>
    );
  }

  // Trier par date (plus récent en premier)
  const sortedReminders = [...reminders].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );

  const getLevelIcon = (level?: ReminderLevel) => {
    switch (level) {
      case 'FIRST':
        return <Mail className="w-5 h-5 text-blue-400" />;
      case 'SECOND':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'THIRD':
        return <AlertOctagon className="w-5 h-5 text-orange-400" />;
      case 'FINAL':
        return <Gavel className="w-5 h-5 text-red-400" />;
      default:
        return <Mail className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLevelLabel = (level?: ReminderLevel) => {
    switch (level) {
      case 'FIRST':
        return 'Première relance';
      case 'SECOND':
        return 'Relance modérée';
      case 'THIRD':
        return 'Relance sévère';
      case 'FINAL':
        return 'Mise en demeure';
      default:
        return 'Relance';
    }
  };

  const getLevelColor = (level?: ReminderLevel) => {
    switch (level) {
      case 'FIRST':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'SECOND':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'THIRD':
        return 'border-orange-500/30 bg-orange-500/5';
      case 'FINAL':
        return 'border-red-500/30 bg-red-500/5';
      default:
        return 'border-gray-700 bg-gray-800/30';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Résumé */}
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Relances envoyées</p>
            <p className="text-xl font-semibold text-white">{reminders.length}</p>
          </div>
        </div>
        {reminders[0] && (
          <div className="text-right">
            <p className="text-sm text-gray-400">Dernière relance</p>
            <p className="text-sm text-white">
              {formatDate(sortedReminders[0].sentAt)}
            </p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {sortedReminders.map((reminder, index) => (
          <div
            key={reminder.id}
            className={`relative border-l-4 rounded-lg p-4 ${getLevelColor(reminder.level)}`}
          >
            {/* En-tête */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">{getLevelIcon(reminder.level)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">
                      {reminder.level ? getLevelLabel(reminder.level) : 'Relance'}
                    </h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        reminder.type === 'AUTOMATIC'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {reminder.type === 'AUTOMATIC' ? 'Automatique' : 'Manuelle'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {formatDate(reminder.sentAt)}
                    </div>
                    {reminder.daysOverdue > 0 && (
                      <div className="flex items-center gap-1.5 text-orange-400">
                        <AlertTriangle className="w-4 h-4" />
                        {reminder.daysOverdue} jour(s) de retard
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Statut de lecture */}
              {reminder.opened && (
                <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                  <Eye className="w-3.5 h-3.5" />
                  Lu
                  {reminder.openedAt && (
                    <span className="text-gray-400 ml-1">
                      {new Date(reminder.openedAt).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Sujet */}
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-300">
                <Mail className="w-4 h-4 inline mr-1.5 text-gray-500" />
                {reminder.subject}
              </p>
            </div>

            {/* Message */}
            <div className="mb-3 p-3 bg-gray-900/50 rounded border border-gray-700/50">
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {reminder.message}
              </p>
            </div>

            {/* Destinataires */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Envoyé à :</span>
              <div className="flex flex-wrap gap-1.5">
                {reminder.sentTo.map((email, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs"
                  >
                    {email}
                  </span>
                ))}
              </div>
            </div>

            {/* Envoyé par (si manuel) */}
            {reminder.type === 'MANUAL' && reminder.sentBy && (
              <div className="mt-2 text-xs text-gray-500">
                Envoyé par : {reminder.sentBy}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Légende des niveaux */}
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
        <p className="text-xs font-medium text-gray-400 mb-2">Niveaux de relance</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Première (J+7)</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Modérée (J+30)</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-gray-400">Sévère (J+60)</span>
          </div>
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-400">Demeure (J+90)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
