'use client';

/**
 * Page de gestion des approbations
 * Permet aux admins d'approuver ou rejeter les demandes de modification
 */

import { useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuthStore } from '@/store/auth';
import { ApprovalRequest, ApprovalEntityType } from '@/types/auth';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Filter,
} from 'lucide-react';

const ENTITY_TYPE_LABELS: Record<ApprovalEntityType, string> = {
  ACCOUNT: 'Compte comptable',
  ENTRY: 'Écriture comptable',
  INVOICE: 'Facture',
  PAYMENT: 'Paiement',
  THIRD_PARTY: 'Tiers',
  USER: 'Utilisateur',
  SETTINGS: 'Paramètres',
};

const ACTION_LABELS = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  DELETE: 'Suppression',
};

const PRIORITY_COLORS = {
  LOW: 'text-blue-400',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-orange-400',
  URGENT: 'text-red-400',
};

const PRIORITY_LABELS = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  URGENT: 'Urgente',
};

export default function ApprovalsPage() {
  const {
    approvalRequests,
    users,
    approveRequest,
    rejectRequest,
    cancelRequest,
    currentUser,
    hasPermission,
  } = useAuthStore();

  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [filterEntityType, setFilterEntityType] = useState<ApprovalEntityType | 'ALL'>('ALL');

  // Filtrer les demandes
  const filteredRequests = approvalRequests.filter((request) => {
    const matchesStatus = filterStatus === 'ALL' || request.status === filterStatus;
    const matchesType = filterEntityType === 'ALL' || request.entityType === filterEntityType;
    return matchesStatus && matchesType;
  });

  // Séparer les demandes en attente et traitées
  const pendingRequests = filteredRequests.filter((r) => r.status === 'PENDING');
  const processedRequests = filteredRequests.filter((r) => r.status !== 'PENDING');

  const handleApprove = async (requestId: string) => {
    try {
      await approveRequest(requestId, reviewComment);
      setSelectedRequest(null);
      setReviewComment('');
      alert('Demande approuvée avec succès');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (requestId: string) => {
    if (!reviewComment.trim()) {
      alert('Veuillez fournir une raison pour le rejet');
      return;
    }

    try {
      await rejectRequest(requestId, reviewComment);
      setSelectedRequest(null);
      setReviewComment('');
      alert('Demande rejetée');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors du rejet');
    }
  };

  const getRequesterName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return 'Utilisateur inconnu';
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  };

  const getReviewerName = (userId?: string) => {
    if (!userId) return '-';
    const user = users.find((u) => u.id === userId);
    if (!user) return 'Utilisateur inconnu';
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  };

  return (
    <AuthGuard requiredPermission="approvals:read">
      <div className="container mx-auto py-8 px-4">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestion des approbations
          </h1>
          <p className="text-claude-muted">
            Gérer les demandes de validation des modifications
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-claude-surface rounded-lg border border-claude-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {pendingRequests.length}
                </div>
                <div className="text-sm text-claude-muted">En attente</div>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-claude-surface rounded-lg border border-claude-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {approvalRequests.filter((r) => r.status === 'APPROVED').length}
                </div>
                <div className="text-sm text-claude-muted">Approuvées</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-claude-surface rounded-lg border border-claude-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {approvalRequests.filter((r) => r.status === 'REJECTED').length}
                </div>
                <div className="text-sm text-claude-muted">Rejetées</div>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div className="bg-claude-surface rounded-lg border border-claude-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-claude-accent">
                  {approvalRequests.filter((r) => r.priority === 'URGENT').length}
                </div>
                <div className="text-sm text-claude-muted">Urgentes</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-claude-accent" />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-claude-surface rounded-lg border border-claude-border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-claude-text mb-2">
                Statut
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-claude-bg border border-claude-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-claude-accent"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="APPROVED">Approuvées</option>
                <option value="REJECTED">Rejetées</option>
              </select>
            </div>

            {/* Filtre par type d'entité */}
            <div>
              <label className="block text-sm font-medium text-claude-text mb-2">
                Type
              </label>
              <select
                value={filterEntityType}
                onChange={(e) => setFilterEntityType(e.target.value as any)}
                className="w-full px-3 py-2 bg-claude-bg border border-claude-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-claude-accent"
              >
                <option value="ALL">Tous les types</option>
                <option value="ACCOUNT">Comptes comptables</option>
                <option value="ENTRY">Écritures comptables</option>
                <option value="INVOICE">Factures</option>
                <option value="PAYMENT">Paiements</option>
                <option value="THIRD_PARTY">Tiers</option>
                <option value="USER">Utilisateurs</option>
                <option value="SETTINGS">Paramètres</option>
              </select>
            </div>
          </div>
        </div>

        {/* Demandes en attente */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Demandes en attente ({pendingRequests.length})
            </h2>

            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-claude-surface rounded-lg border border-claude-border p-4 hover:border-claude-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <FileText className="w-3 h-3" />
                          {ENTITY_TYPE_LABELS[request.entityType]}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {ACTION_LABELS[request.action]}
                        </span>
                        <span className={`text-xs font-medium ${PRIORITY_COLORS[request.priority]}`}>
                          {PRIORITY_LABELS[request.priority]}
                        </span>
                      </div>

                      <div className="text-sm text-claude-muted mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Demandé par : <span className="text-white">{getRequesterName(request.requestedBy)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(request.requestedAt).toLocaleString('fr-MA')}
                        </div>
                      </div>

                      {request.reason && (
                        <div className="text-sm text-claude-text mt-2">
                          <strong>Raison :</strong> {request.reason}
                        </div>
                      )}
                    </div>

                    {hasPermission('approvals:approve') && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                          className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Examiner
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            // Ouvrir un modal pour demander la raison
                          }}
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demandes traitées */}
        {processedRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Demandes traitées ({processedRequests.length})
            </h2>

            <div className="space-y-4">
              {processedRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-claude-surface rounded-lg border border-claude-border p-4 opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <FileText className="w-3 h-3" />
                          {ENTITY_TYPE_LABELS[request.entityType]}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {ACTION_LABELS[request.action]}
                        </span>
                        {request.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            <CheckCircle className="w-3 h-3" />
                            Approuvée
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <XCircle className="w-3 h-3" />
                            Rejetée
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-claude-muted">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Demandé par : <span className="text-white">{getRequesterName(request.requestedBy)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            Traité par : <span className="text-white">{getReviewerName(request.reviewedBy)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {request.reviewedAt && new Date(request.reviewedAt).toLocaleString('fr-MA')}
                          </div>
                        </div>
                      </div>

                      {request.reviewComment && (
                        <div className="text-sm text-claude-text mt-2 p-2 bg-claude-bg rounded">
                          <strong>Commentaire :</strong> {request.reviewComment}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-claude-muted mx-auto mb-4" />
            <p className="text-claude-muted">Aucune demande d'approbation</p>
          </div>
        )}

        {/* Modal d'examen détaillé (simplifié) */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-claude-surface rounded-lg border border-claude-border p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">
                Détails de la demande
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-claude-muted">Type</label>
                  <p className="text-white">{ENTITY_TYPE_LABELS[selectedRequest.entityType]}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-claude-muted">Action</label>
                  <p className="text-white">{ACTION_LABELS[selectedRequest.action]}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-claude-muted">Demandé par</label>
                  <p className="text-white">{getRequesterName(selectedRequest.requestedBy)}</p>
                </div>

                {selectedRequest.reason && (
                  <div>
                    <label className="text-sm font-medium text-claude-muted">Raison</label>
                    <p className="text-white">{selectedRequest.reason}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-claude-muted">Données proposées</label>
                  <pre className="mt-2 p-4 bg-claude-bg rounded text-xs text-white overflow-x-auto">
                    {JSON.stringify(selectedRequest.proposedData, null, 2)}
                  </pre>
                </div>

                {selectedRequest.status === 'PENDING' && hasPermission('approvals:approve') && (
                  <div>
                    <label className="text-sm font-medium text-claude-muted mb-2 block">
                      Commentaire (optionnel pour approbation, requis pour rejet)
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3 py-2 bg-claude-bg border border-claude-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-claude-accent"
                      rows={3}
                      placeholder="Votre commentaire..."
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {selectedRequest.status === 'PENDING' && hasPermission('approvals:approve') && (
                  <>
                    <Button
                      onClick={() => handleApprove(selectedRequest.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Approuver
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedRequest.id)}
                      variant="outline"
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null);
                    setReviewComment('');
                  }}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
