'use client'

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  BookOpen,
  UserCheck,
  FileText,
  Calculator,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Users,
  Receipt,
  AlertCircle,
  Truck
} from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <header className="text-center py-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-claude-accent rounded-2xl flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-claude-text mb-3">
          Guide Utilisateur CGNC Flow
        </h1>
        <p className="text-xl text-claude-text-muted max-w-2xl mx-auto">
          Guide complet pour utiliser l'application de comptabilité marocaine de A à Z
        </p>
      </header>

      {/* Table des matières */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Table des matières</CardTitle>
        </CardHeader>
        <div className="p-6 pt-0">
          <nav className="space-y-2 text-sm">
            <a href="#introduction" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <ArrowRight className="w-4 h-4" />
              1. Introduction et premiers pas
            </a>
            <a href="#clients" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <ArrowRight className="w-4 h-4" />
              2. Gestion des clients
            </a>
            <a href="#fournisseurs" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <ArrowRight className="w-4 h-4" />
              3. Gestion des fournisseurs
            </a>
            <a href="#factures" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <ArrowRight className="w-4 h-4" />
              4. Création de factures
            </a>
            <a href="#calculs" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <ArrowRight className="w-4 h-4" />
              5. Calculs automatiques et TVA
            </a>
            <a href="#pdf" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <ArrowRight className="w-4 h-4" />
              6. Génération de documents PDF
            </a>
            <a href="#grand-livre" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <ArrowRight className="w-4 h-4" />
              7. Grand livre comptable
            </a>
            <a href="#etats-financiers" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <ArrowRight className="w-4 h-4" />
              8. États de synthèse
            </a>
            <a href="#tva" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <ArrowRight className="w-4 h-4" />
              9. TVA et déclarations fiscales
            </a>
            <a href="#workflow" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <ArrowRight className="w-4 h-4" />
              10. Workflow complet
            </a>
            <a href="#bonnes-pratiques" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <ArrowRight className="w-4 h-4" />
              11. Bonnes pratiques
            </a>
          </nav>
        </div>
      </Card>

      {/* 1. Introduction */}
      <section id="introduction">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold">
                1
              </span>
              Introduction et premiers pas
            </CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            <p className="text-claude-text">
              CGNC Flow est une application de comptabilité moderne conçue spécifiquement pour les TPE/PME marocaines.
              Elle respecte les normes du Code Général de Normalisation Comptable (CGNC) et inclut tous les identifiants
              légaux requis au Maroc.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Fonctionnalités principales
              </h4>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" />
                  Gestion complète des clients et fournisseurs avec identifiants légaux (ICE, IF, RC, CNSS)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" />
                  Création de factures avec calculs automatiques HT/TVA/TTC
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" />
                  Support des taux de TVA marocains (20%, 14%, 10%, 7%, 0%)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" />
                  Remises par ligne et remise globale
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" />
                  Numérotation automatique des documents (FA-2025-00001)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" />
                  Templates PDF conformes CGNC
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Premier démarrage</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>Créez au moins un client dans la section <strong>Clients</strong></li>
                <li>Créez votre première facture dans la section <strong>Factures</strong></li>
                <li>Générez le PDF et envoyez-le à votre client</li>
              </ol>
            </div>
          </div>
        </Card>
      </section>

      {/* 2. Gestion des clients */}
      <section id="clients">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold">
                2
              </span>
              <UserCheck className="w-6 h-6" />
              Gestion des clients
            </CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 space-y-6">
            <p className="text-claude-text">
              La gestion des clients est la première étape avant de créer des factures.
              Chaque client contient les informations nécessaires pour la facturation.
            </p>

            <div>
              <h4 className="font-semibold text-claude-text mb-3">Étapes pour créer un client</h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-accent text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h5 className="font-medium text-claude-text">Accédez à la page Clients</h5>
                    <p className="text-sm text-claude-text-muted">
                      Cliquez sur <strong>Clients</strong> dans le menu latéral gauche
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-accent text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h5 className="font-medium text-claude-text">Cliquez sur "Nouveau client"</h5>
                    <p className="text-sm text-claude-text-muted">
                      Le bouton bleu en haut à droite de la page
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-accent text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h5 className="font-medium text-claude-text">Remplissez le formulaire</h5>
                    <div className="mt-2 space-y-2 text-sm text-claude-text-muted">
                      <div className="bg-claude-subtle p-3 rounded">
                        <strong className="text-claude-text">Informations obligatoires :</strong>
                        <ul className="mt-1 space-y-1 ml-4 list-disc">
                          <li>Type : Client</li>
                          <li>Code : Auto-généré (ex: CLI-0001)</li>
                          <li>Raison sociale</li>
                        </ul>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <strong className="text-yellow-900">Fortement recommandé :</strong>
                        <ul className="mt-1 space-y-1 ml-4 list-disc text-yellow-800">
                          <li><strong>ICE</strong> - Obligatoire pour factures B2B (15 chiffres)</li>
                          <li>Adresse complète</li>
                          <li>Email et téléphone</li>
                          <li>Conditions de paiement (Net 30 jours par défaut)</li>
                        </ul>
                      </div>
                      <div className="bg-claude-subtle p-3 rounded">
                        <strong className="text-claude-text">Optionnel :</strong>
                        <ul className="mt-1 space-y-1 ml-4 list-disc">
                          <li>IF (Identifiant Fiscal)</li>
                          <li>RC (Registre de Commerce)</li>
                          <li>CNSS</li>
                          <li>Limite d'encours</li>
                          <li>Remise par défaut</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-accent text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h5 className="font-medium text-claude-text">Validez l'ICE (si fourni)</h5>
                    <p className="text-sm text-claude-text-muted">
                      L'application valide automatiquement le format et le checksum de l'ICE
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-accent text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h5 className="font-medium text-claude-text">Cliquez sur "Créer"</h5>
                    <p className="text-sm text-claude-text-muted">
                      Le client apparaît immédiatement dans la liste
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-orange-900 mb-1">Validation de l'ICE</h5>
                  <p className="text-sm text-orange-800">
                    L'ICE doit contenir exactement 15 chiffres. L'application vérifie automatiquement :
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-orange-800 ml-4 list-disc">
                    <li>Le format (15 chiffres)</li>
                    <li>Le checksum (2 derniers chiffres)</li>
                    <li>La structure (9 chiffres + 4 chiffres + 2 chiffres checksum)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 3. Fournisseurs */}
      <section id="fournisseurs">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-full font-bold">
                3
              </span>
              <Truck className="w-6 h-6" />
              Gestion des fournisseurs
            </CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            <p className="text-claude-text">
              La gestion des fournisseurs fonctionne exactement comme celle des clients,
              mais permet de suivre vos achats et vos dettes fournisseurs.
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h5 className="font-semibold text-purple-900 mb-2">Différences avec les clients</h5>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Le code est préfixé par <strong>FRS</strong> au lieu de CLI (ex: FRS-0001)
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Les statistiques affichent le <strong>Total Achats</strong> au lieu du CA
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Pas de limite d'encours (paramètre client uniquement)
                </li>
              </ul>
            </div>

            <p className="text-sm text-claude-text-muted italic">
              💡 Un tiers peut être à la fois client ET fournisseur en sélectionnant l'option "Client et Fournisseur"
            </p>
          </div>
        </Card>
      </section>

      {/* 4. Création de factures */}
      <section id="factures">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold">
                4
              </span>
              <FileText className="w-6 h-6" />
              Création de factures
            </CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 space-y-6">
            <p className="text-claude-text">
              Une fois vos clients créés, vous pouvez émettre des factures professionnelles
              conformes aux normes marocaines.
            </p>

            <div>
              <h4 className="font-semibold text-claude-text mb-3">Étapes pour créer une facture</h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h5 className="font-medium text-claude-text">Accédez aux Factures</h5>
                    <p className="text-sm text-claude-text-muted">
                      Menu latéral → <strong>Factures</strong>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h5 className="font-medium text-claude-text">Cliquez sur "Nouvelle facture"</h5>
                    <p className="text-sm text-claude-text-muted">
                      Si aucun client n'existe, vous serez redirigé vers la page Clients
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h5 className="font-medium text-claude-text">Remplissez l'en-tête</h5>
                    <div className="mt-2 bg-claude-subtle p-3 rounded text-sm">
                      <ul className="space-y-1 ml-4 list-disc">
                        <li><strong>Type :</strong> Facture, Devis, Avoir, Pro-forma</li>
                        <li><strong>Client :</strong> Sélectionnez dans la liste</li>
                        <li><strong>Date d'émission :</strong> Date du jour par défaut</li>
                        <li><strong>Conditions de paiement :</strong> Héritées du client</li>
                        <li><strong>Date d'échéance :</strong> Calculée automatiquement</li>
                        <li><strong>Référence :</strong> Votre référence interne (optionnel)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h5 className="font-medium text-claude-text">Ajoutez les lignes de facturation</h5>
                    <div className="mt-2 space-y-2 text-sm">
                      <p className="text-claude-text-muted">
                        Pour chaque produit/service :
                      </p>
                      <div className="bg-claude-subtle p-3 rounded">
                        <ul className="space-y-1 ml-4 list-disc">
                          <li><strong>Description :</strong> Nom du produit/service</li>
                          <li><strong>Quantité :</strong> Nombre d'unités (décimales acceptées)</li>
                          <li><strong>Prix unitaire HT :</strong> Prix hors taxes</li>
                          <li><strong>TVA :</strong> Choisir le taux (20%, 14%, 10%, 7%, 0%)</li>
                          <li><strong>Remise :</strong> Remise en % sur cette ligne (optionnel)</li>
                        </ul>
                      </div>
                      <p className="text-claude-text-muted">
                        Les totaux se calculent automatiquement à chaque modification
                      </p>
                      <div className="flex items-center gap-2 text-blue-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">Cliquez sur "+ Ajouter une ligne" pour ajouter d'autres produits</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h5 className="font-medium text-claude-text">Appliquez une remise globale (optionnel)</h5>
                    <p className="text-sm text-claude-text-muted">
                      Dans la section "Totaux", saisissez un pourcentage de remise qui s'appliquera à toutes les lignes
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    6
                  </div>
                  <div>
                    <h5 className="font-medium text-claude-text">Ajoutez des notes (optionnel)</h5>
                    <ul className="mt-2 space-y-1 text-sm text-claude-text-muted ml-4 list-disc">
                      <li><strong>Notes publiques :</strong> Visibles sur le PDF (conditions, délais, etc.)</li>
                      <li><strong>Notes internes :</strong> Non visibles sur la facture (rappels internes)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    7
                  </div>
                  <div>
                    <h5 className="font-medium text-claude-text">Créez la facture</h5>
                    <p className="text-sm text-claude-text-muted">
                      Cliquez sur "Créer la facture". Un numéro unique est généré automatiquement (ex: FA-2025-00001)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Numérotation automatique
              </h5>
              <p className="text-sm text-green-800">
                Chaque facture reçoit un numéro unique au format <strong>FA-ANNÉE-NUMÉRO</strong>.
                Le compteur s'incrémente automatiquement et peut être réinitialisé chaque année.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* 5. Calculs */}
      <section id="calculs">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 rounded-full font-bold">
                5
              </span>
              <Calculator className="w-6 h-6" />
              Calculs automatiques et TVA
            </CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 space-y-6">
            <p className="text-claude-text">
              L'application effectue tous les calculs automatiquement conformément aux règles CGNC.
            </p>

            <div>
              <h4 className="font-semibold text-claude-text mb-3">Formules de calcul</h4>

              <div className="space-y-4">
                <div className="bg-claude-subtle p-4 rounded-lg">
                  <h5 className="font-medium text-claude-text mb-2">1. Calcul par ligne</h5>
                  <div className="font-mono text-sm space-y-1 text-claude-text-muted">
                    <div>Sous-total brut = Quantité × Prix unitaire</div>
                    <div>Remise ligne = Sous-total brut × (Taux remise% / 100)</div>
                    <div className="font-semibold text-claude-text">Sous-total HT = Sous-total brut - Remise ligne</div>
                    <div>TVA ligne = Sous-total HT × (Taux TVA% / 100)</div>
                    <div className="font-semibold text-claude-text">Total TTC ligne = Sous-total HT + TVA ligne</div>
                  </div>
                </div>

                <div className="bg-claude-subtle p-4 rounded-lg">
                  <h5 className="font-medium text-claude-text mb-2">2. Calcul global</h5>
                  <div className="font-mono text-sm space-y-1 text-claude-text-muted">
                    <div>Sous-total HT = Σ Sous-totaux HT de toutes les lignes</div>
                    <div>Remise globale = Sous-total HT × (Taux remise globale% / 100)</div>
                    <div className="font-semibold text-claude-text">Total HT = Sous-total HT - Remise globale</div>
                  </div>
                </div>

                <div className="bg-claude-subtle p-4 rounded-lg">
                  <h5 className="font-medium text-claude-text mb-2">3. Calcul TVA par taux</h5>
                  <div className="font-mono text-sm space-y-1 text-claude-text-muted">
                    <div>Pour chaque taux de TVA utilisé:</div>
                    <div className="ml-4">Base HT = Somme des lignes après remise globale</div>
                    <div className="ml-4">TVA = Base HT × (Taux% / 100)</div>
                    <div className="font-semibold text-claude-text mt-2">Total TVA = Σ TVA de tous les taux</div>
                    <div className="font-semibold text-claude-text">Total TTC = Total HT + Total TVA</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-claude-text mb-3">Taux de TVA au Maroc</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { rate: '20%', desc: 'Taux normal' },
                  { rate: '14%', desc: 'Taux réduit 1' },
                  { rate: '10%', desc: 'Taux réduit 2' },
                  { rate: '7%', desc: 'Taux réduit 3' },
                  { rate: '0%', desc: 'Exonéré' },
                ].map((tva) => (
                  <div key={tva.rate} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{tva.rate}</div>
                    <div className="text-sm text-blue-800">{tva.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-900 mb-2">Exemple de calcul</h5>
              <div className="text-sm text-yellow-800 space-y-2">
                <div className="font-mono">
                  Ligne 1: 10 unités × 100 MAD = 1 000 MAD HT (TVA 20%)
                  <div className="ml-4">→ TVA: 200 MAD → Total: 1 200 MAD TTC</div>
                </div>
                <div className="font-mono">
                  Ligne 2: 5 unités × 50 MAD - 10% remise = 225 MAD HT (TVA 20%)
                  <div className="ml-4">→ TVA: 45 MAD → Total: 270 MAD TTC</div>
                </div>
                <div className="border-t border-yellow-300 pt-2 mt-2 font-mono font-semibold">
                  Sous-total HT: 1 225 MAD
                  <div>Remise globale 5%: -61.25 MAD</div>
                  <div>Total HT: 1 163.75 MAD</div>
                  <div>Total TVA: 232.75 MAD</div>
                  <div className="text-lg">Total TTC: 1 396.50 MAD</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 6. PDF */}
      <section id="pdf">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 bg-red-100 text-red-600 rounded-full font-bold">
                6
              </span>
              <Receipt className="w-6 h-6" />
              Génération de documents PDF
            </CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            <p className="text-claude-text">
              L'application génère des documents PDF conformes aux normes CGNC avec toutes les mentions légales obligatoires.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2">Mentions légales incluses</h5>
              <ul className="space-y-1 text-sm text-green-800 ml-4 list-disc">
                <li>Informations complètes de l'émetteur (ICE, RC, IF)</li>
                <li>Informations complètes du destinataire</li>
                <li>Numéro de facture unique</li>
                <li>Dates (émission, échéance, livraison)</li>
                <li>Détail des lignes avec TVA par taux</li>
                <li>Totaux HT, TVA, TTC</li>
                <li>Conditions de paiement</li>
                <li>Mentions légales de bas de page</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">Pour générer le PDF</h5>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Cliquez sur l'icône "Œil" dans la liste des factures</li>
                <li>Le document s'affiche dans une nouvelle fenêtre</li>
                <li>Utilisez Ctrl+P ou Cmd+P pour imprimer ou enregistrer en PDF</li>
              </ol>
            </div>

            <p className="text-sm text-claude-text-muted italic">
              💡 Le template HTML/CSS est prêt pour une intégration future avec des bibliothèques de génération PDF automatique
              (jsPDF, react-pdf, ou API backend).
            </p>
          </div>
        </Card>
      </section>

      {/* 7. Workflow */}
      <section id="workflow">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-full font-bold">
                7
              </span>
              <TrendingUp className="w-6 h-6" />
              Workflow complet
            </CardTitle>
          </CardHeader>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: 'Créez vos clients',
                  desc: 'Enregistrez vos clients avec leurs informations légales',
                  icon: Users,
                },
                {
                  step: 2,
                  title: 'Créez une facture',
                  desc: 'Sélectionnez un client et ajoutez les lignes de facturation',
                  icon: FileText,
                },
                {
                  step: 3,
                  title: 'Vérifiez les calculs',
                  desc: 'Les totaux HT/TVA/TTC se calculent automatiquement',
                  icon: Calculator,
                },
                {
                  step: 4,
                  title: 'Générez le PDF',
                  desc: 'Créez un document professionnel conforme CGNC',
                  icon: Receipt,
                },
                {
                  step: 5,
                  title: 'Envoyez à votre client',
                  desc: 'Imprimez ou envoyez le PDF par email',
                  icon: TrendingUp,
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-5 h-5 text-purple-600" />
                      <h5 className="font-medium text-claude-text">{item.title}</h5>
                    </div>
                    <p className="text-sm text-claude-text-muted mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* 8. Bonnes pratiques */}
      <section id="bonnes-pratiques">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold">
                8
              </span>
              <CheckCircle2 className="w-6 h-6" />
              Bonnes pratiques
            </CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            <div className="space-y-3">
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h5 className="font-semibold text-green-900 mb-1">✅ Toujours vérifier l'ICE</h5>
                <p className="text-sm text-green-800">
                  Demandez l'ICE à vos clients B2B. C'est obligatoire pour les transactions entre entreprises au Maroc.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h5 className="font-semibold text-green-900 mb-1">✅ Numérotation séquentielle</h5>
                <p className="text-sm text-green-800">
                  Ne jamais sauter de numéros. L'application garantit une numérotation continue et conforme.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h5 className="font-semibold text-green-900 mb-1">✅ Dates cohérentes</h5>
                <p className="text-sm text-green-800">
                  La date d'échéance doit toujours être postérieure à la date d'émission.
                  L'application la calcule automatiquement selon les conditions de paiement.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h5 className="font-semibold text-green-900 mb-1">✅ Descriptions claires</h5>
                <p className="text-sm text-green-800">
                  Utilisez des descriptions précises pour chaque ligne. Cela facilite la compréhension et évite les litiges.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h5 className="font-semibold text-green-900 mb-1">✅ Vérification avant envoi</h5>
                <p className="text-sm text-green-800">
                  Vérifiez toujours le PDF généré avant de l'envoyer : nom du client, montants, taux de TVA, dates.
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <h5 className="font-semibold text-yellow-900 mb-1">⚠️ Factures en brouillon</h5>
                <p className="text-sm text-yellow-800">
                  Seules les factures en statut "Brouillon" peuvent être supprimées.
                  Une fois envoyées, utilisez un avoir pour annuler.
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <h5 className="font-semibold text-yellow-900 mb-1">⚠️ Sauvegarde des données</h5>
                <p className="text-sm text-yellow-800">
                  Les données sont actuellement stockées localement. Pensez à exporter régulièrement vos factures en PDF.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 7. Grand Livre */}
      <section id="grand-livre">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full font-bold">
                7
              </span>
              <BookOpen className="w-6 h-6" />
              Grand Livre Comptable
            </CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            <p className="text-claude-text">
              Le Grand Livre est un document comptable fondamental qui regroupe l'ensemble des écritures
              comptables de votre entreprise, classées par compte. Il constitue la base de votre comptabilité.
            </p>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h5 className="font-semibold text-indigo-900 mb-3">Qu'est-ce que le Grand Livre ?</h5>
              <p className="text-sm text-indigo-800 mb-3">
                Le Grand Livre présente, pour chaque compte du plan comptable :
              </p>
              <ul className="space-y-2 text-sm text-indigo-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Toutes les écritures</strong> : Chaque mouvement comptable (débit/crédit)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Le solde progressif</strong> : L'évolution du solde après chaque écriture</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Les références</strong> : Numéro de pièce, journal, date, libellé</span>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-claude-text mb-3">Utilisation du Grand Livre</h5>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-accent text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h6 className="font-medium text-claude-text">Accédez au Grand Livre</h6>
                    <p className="text-sm text-claude-text-muted">
                      Cliquez sur <strong>Grand livre</strong> dans le menu latéral
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-accent text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h6 className="font-medium text-claude-text">Sélectionnez une période</h6>
                    <p className="text-sm text-claude-text-muted">
                      Choisissez l'exercice comptable à consulter (ex: 2025)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-accent text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h6 className="font-medium text-claude-text">Filtrez par compte (optionnel)</h6>
                    <p className="text-sm text-claude-text-muted">
                      Vous pouvez afficher soit tous les comptes, soit un compte spécifique (ex: 3421 - Clients)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-accent text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h6 className="font-medium text-claude-text">Exportez en CSV</h6>
                    <p className="text-sm text-claude-text-muted">
                      Cliquez sur "Exporter CSV" pour obtenir un fichier exploitable dans Excel
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                À quoi sert le Grand Livre ?
              </h5>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Contrôle de gestion</strong> : Vérifier tous les mouvements d'un compte</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Audit</strong> : Justifier chaque écriture avec ses pièces comptables</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Réconciliation bancaire</strong> : Comparer avec vos relevés bancaires</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Clôture annuelle</strong> : Document légal obligatoire à conserver</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">💡 Bon à savoir</h5>
              <p className="text-sm text-blue-800">
                Le Grand Livre est <strong>obligatoire</strong> selon le CGNC. Il doit être conservé pendant
                10 ans minimum. L'export CSV vous permet de sauvegarder facilement vos données comptables.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* 8. États de Synthèse */}
      <section id="etats-financiers">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 bg-teal-100 text-teal-600 rounded-full font-bold">
                8
              </span>
              <Calculator className="w-6 h-6" />
              États de Synthèse
            </CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            <p className="text-claude-text">
              Les états de synthèse regroupent les documents comptables de fin d'exercice conformes au CGNC :
              Bilan, Compte de Résultat, Balance, et Tableau de Financement.
            </p>

            <div className="grid gap-4">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h5 className="font-semibold text-teal-900 mb-2">📊 La Balance Comptable</h5>
                <p className="text-sm text-teal-800 mb-2">
                  Récapitulatif de tous les comptes avec leurs totaux débit/crédit et soldes.
                </p>
                <p className="text-sm text-teal-800">
                  <strong>Usage :</strong> Vérifier l'équilibre comptable avant d'établir le bilan
                </p>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h5 className="font-semibold text-teal-900 mb-2">📈 Le Bilan</h5>
                <p className="text-sm text-teal-800 mb-2">
                  Photo du patrimoine de l'entreprise à une date donnée (Actif vs Passif).
                </p>
                <p className="text-sm text-teal-800">
                  <strong>Usage :</strong> Analyser la santé financière et la solvabilité
                </p>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h5 className="font-semibold text-teal-900 mb-2">💰 Le Compte de Résultat</h5>
                <p className="text-sm text-teal-800 mb-2">
                  Récapitulatif des produits et charges de l'exercice pour calculer le résultat net.
                </p>
                <p className="text-sm text-teal-800">
                  <strong>Usage :</strong> Mesurer la rentabilité de l'activité
                </p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-orange-900 mb-1">Période de consultation</h5>
                  <p className="text-sm text-orange-800">
                    Les états de synthèse sont généralement établis annuellement (31/12), mais peuvent être
                    consultés en cours d'exercice pour le pilotage de l'entreprise.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 9. TVA et Déclarations */}
      <section id="tva">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 bg-red-100 text-red-600 rounded-full font-bold">
                9
              </span>
              <Receipt className="w-6 h-6" />
              TVA et Déclarations Fiscales
            </CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            <p className="text-claude-text">
              Le module TVA vous permet de générer automatiquement vos déclarations de TVA mensuelles ou
              trimestrielles et d'exporter le fichier XML SIMPL-TVA pour la télédéclaration.
            </p>

            <div>
              <h5 className="font-semibold text-claude-text mb-3">Créer une déclaration TVA</h5>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-accent text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h6 className="font-medium text-claude-text">Accédez au module TVA</h6>
                    <p className="text-sm text-claude-text-muted">
                      Cliquez sur <strong>TVA</strong> dans le menu latéral
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-accent text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h6 className="font-medium text-claude-text">Créez une nouvelle déclaration</h6>
                    <p className="text-sm text-claude-text-muted">
                      Cliquez sur "Nouvelle Déclaration" et sélectionnez l'année et le mois (ou trimestre)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-accent text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h6 className="font-medium text-claude-text">Vérifiez les calculs automatiques</h6>
                    <p className="text-sm text-claude-text-muted">
                      L'application calcule automatiquement la TVA collectée et déductible par taux (20%, 14%, 10%, 7%, 0%)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-accent text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h6 className="font-medium text-claude-text">Exportez le fichier XML SIMPL-TVA</h6>
                    <p className="text-sm text-claude-text-muted">
                      Cliquez sur "Export XML" pour télécharger le fichier à soumettre sur le portail SIMPL
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-accent text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h6 className="font-medium text-claude-text">Soumettez la déclaration</h6>
                    <p className="text-sm text-claude-text-muted">
                      Une fois vérifiée, cliquez sur "Soumettre" pour marquer la déclaration comme prête
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="font-semibold text-red-900 mb-2">📋 Relevé de déductions</h5>
              <p className="text-sm text-red-800 mb-2">
                Le relevé de déductions détaille toutes les factures fournisseurs avec TVA déductible.
                Il est obligatoire pour justifier la TVA déduite.
              </p>
              <p className="text-sm text-red-800">
                <strong>Important :</strong> Vérifiez que tous vos fournisseurs ont un ICE valide pour
                bénéficier de la déduction de TVA.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Taux de TVA au Maroc
              </h5>
              <ul className="space-y-1 text-sm text-green-800">
                <li><strong>20%</strong> - Taux normal (la plupart des biens et services)</li>
                <li><strong>14%</strong> - Taux intermédiaire (transport, énergie...)</li>
                <li><strong>10%</strong> - Taux réduit (restauration, hôtellerie...)</li>
                <li><strong>7%</strong> - Taux super réduit (eau, produits pharmaceutiques...)</li>
                <li><strong>0%</strong> - Exonéré ou hors champ d'application</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <Card className="bg-claude-accent text-white">
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Besoin d'aide ?</h3>
          <p className="text-blue-100">
            Pour toute question, consultez la documentation technique dans les fichiers
            README.md et EPIC-FACTURATION.md du projet.
          </p>
        </div>
      </Card>
    </div>
  );
}
