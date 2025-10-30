# 🛒 BACKLOG MODULE VENTES - Marché Marocain

**Dernière mise à jour**: 29 Octobre 2025
**Version**: 1.0.0 MVP
**Statut**: 🔄 En amélioration continue

---

## 📊 Vue d'ensemble

Le module ventes est **ESSENTIEL** pour un MVP au Maroc car il constitue le cœur de toute application de comptabilité. Ce backlog documente les améliorations nécessaires pour en faire un outil moderne et adapté au marché marocain.

---

## ✅ DÉJÀ IMPLÉMENTÉ (100%)

### Epic Facturation - 7 Stories complètes

| Story | Fonctionnalité | Statut | Fichiers |
|-------|---------------|--------|----------|
| F.1 | Gestion Tiers (Clients/Fournisseurs) | ✅ | `store/invoicing.ts`, `components/invoicing/ThirdPartyForm.tsx` |
| F.2 | Création Factures multi-lignes | ✅ | `components/invoicing/InvoiceForm.tsx` |
| F.3 | Gestion Devis & Conversion | ✅ | `components/invoicing/QuoteForm.tsx` |
| F.4 | Suivi Paiements (7 modes) | ✅ | `components/invoicing/PaymentForm.tsx` |
| F.5 | Relances Automatiques (4 niveaux) | ✅ | `components/invoicing/ReminderForm.tsx` |
| F.6 | Numérotation Automatique | ✅ | `components/invoicing/InvoiceNumberingSettings.tsx` |
| F.7 | Intégration Grand Livre | ✅ | `lib/accounting/gl-integration.ts` |

### Conformité Marocaine ✅

- ✅ **Validation ICE** (15 chiffres + checksum Luhn)
- ✅ **Identifiants légaux** (IF, RC, CNSS, Patente)
- ✅ **TVA marocaine** (20%, 14%, 10%, 7%, 0%)
- ✅ **Plan comptable CGNC** (411xxx clients, 441xxx fournisseurs)
- ✅ **Journaux VTE/ACH** conformes CGNC
- ✅ **Formats dates/devises** localisés (MAD)

### Pages fonctionnelles ✅

- ✅ `/invoices` - Gestion complète factures
- ✅ `/quotes` - Gestion devis
- ✅ `/customers` - Gestion clients
- ✅ `/suppliers` - Gestion fournisseurs

---

## 🔧 AMÉLIORATIONS EN COURS

### 🎯 Priorité 1 - Dashboard Ventes Moderne

**Problème identifié**: Le module `/sales` utilise des données mockées et n'est pas connecté au store réel.

**Améliorations prévues**:

#### 1.1 Statistiques KPI en temps réel ⏳
- [ ] **CA Total** (Chiffre d'affaires) - MTD, QTD, YTD
- [ ] **Factures en attente** - Montant + nombre
- [ ] **Factures en retard** - Avec ancienneté moyenne
- [ ] **Taux de recouvrement** - % paiements dans les délais
- [ ] **Délai moyen de paiement** - En jours
- [ ] **Top 5 clients** - Par CA et par impayés

#### 1.2 Visualisations graphiques 📈
- [ ] **Graphique CA mensuel** - 12 derniers mois avec comparaison N vs N-1
- [ ] **Répartition TVA** - Pie chart par taux (20%, 14%, 10%, 7%, 0%)
- [ ] **État des factures** - Bar chart (Payées, En attente, En retard)
- [ ] **Évolution encaissements** - Line chart vs prévisions
- [ ] **Créances par ancienneté** - 0-30j, 30-60j, 60-90j, +90j
- [ ] **Top clients** - Bar chart horizontal

#### 1.3 Intégration store réel
- [ ] Remplacer `mockInvoices` par `useInvoicingStore()`
- [ ] Afficher vraies données factures/devis/clients
- [ ] Calculer statistiques réelles depuis le store
- [ ] Synchronisation temps réel avec les modifications

#### 1.4 Actions rapides
- [ ] **Boutons d'action** - Nouvelle facture, Nouveau devis, Nouveau client
- [ ] **Filtres rapides** - Aujourd'hui, Cette semaine, Ce mois, Personnalisé
- [ ] **Export rapide** - PDF, Excel, CSV
- [ ] **Recherche globale** - Across factures/clients/devis

---

## 🌍 SPÉCIFICITÉS MARCHÉ MAROCAIN

### 2.1 Conformité fiscale DGI 🇲🇦

**Déjà implémenté**:
- ✅ Validation ICE avec checksum
- ✅ TVA aux taux marocains
- ✅ Export SIMPL-TVA XML

**À améliorer**:
- [ ] **Vérification ICE en ligne** - API DGI pour valider ICE client en temps réel
- [ ] **Alerte ICE non conforme** - Warning si ICE client invalide
- [ ] **Rapport TVA mensuel** - Prêt pour déclaration DGI
- [ ] **Factures dématérialisées** - Préparer intégration e-Facture (futur)

### 2.2 Pratiques commerciales marocaines

- [ ] **Traites (LCN)** - Gestion lettres de change normalisées
- [ ] **Chèques en souffrance** - Suivi chèques impayés
- [ ] **Escompte fournisseur** - Calcul automatique 2% si paiement immédiat
- [ ] **Paiements fractionnés** - Support 30%/40%/30% (commun au Maroc)
- [ ] **Devise secondaire** - Support EUR/USD avec taux Bank Al-Maghrib

### 2.3 Secteurs économiques marocains

- [ ] **BTP** - Templates factures avec situations de travaux
- [ ] **Import/Export** - Gestion documents douaniers (DUM, EUR1)
- [ ] **Services** - Retenue à la source 10% (professionnels)
- [ ] **Hôtellerie** - Taxe de séjour automatique
- [ ] **Santé** - Factures tiers-payant CNOPS/CNSS

---

## 🎨 UI/UX MODERNE

### 3.1 Design system amélioré

**Objectif**: Interface moderne, intuitive, rapide

- [ ] **Cards statistiques** - Design glacé avec gradients subtils
- [ ] **Graphiques interactifs** - Recharts ou Chart.js avec animations
- [ ] **Dark mode** - Thème sombre/clair avec toggle
- [ ] **Responsive mobile** - Dashboard adapté tablettes/mobiles
- [ ] **Skeleton loading** - Indicateurs de chargement élégants
- [ ] **Micro-interactions** - Hover effects, transitions fluides

### 3.2 Tableaux améliorés

- [ ] **Tri multi-colonnes** - Cliquer sur headers pour trier
- [ ] **Filtres avancés** - Drawer avec filtres multiples
- [ ] **Pagination performante** - Virtual scrolling si +1000 lignes
- [ ] **Actions groupées** - Sélection multiple + actions batch
- [ ] **Export sélection** - Exporter lignes sélectionnées
- [ ] **Quick view** - Modal rapide au hover sur facture

### 3.3 Accessibilité

- [ ] **Raccourcis clavier** - Ctrl+N nouvelle facture, Ctrl+F recherche
- [ ] **ARIA labels** - Support lecteurs d'écran
- [ ] **Contraste WCAG AA** - Couleurs accessibles
- [ ] **Focus visible** - Navigation clavier claire

---

## 📱 FONCTIONNALITÉS AVANCÉES

### 4.1 Automatisation

- [ ] **Factures récurrentes** - Génération automatique mensuelles (abonnements)
- [ ] **Relances intelligentes** - Machine learning pour optimiser timing
- [ ] **Matching automatique** - Lier paiements bancaires aux factures
- [ ] **OCR factures fournisseurs** - Scanner et extraire données PDF
- [ ] **Prévisions de trésorerie** - Prédiction basée sur historique

### 4.2 Collaboration

- [ ] **Commentaires factures** - Notes internes par équipe
- [ ] **Workflow approbation** - Validation multi-niveaux avant envoi
- [ ] **Notifications** - Email/SMS pour factures envoyées/payées
- [ ] **Portail client** - Espace client pour consulter factures
- [ ] **Signature électronique** - Approbation numérique conforme

### 4.3 Intégrations

- [ ] **CMI/Maroc Telecommerce** - Paiement en ligne factures
- [ ] **Bank Al-Maghrib API** - Taux de change automatiques
- [ ] **DHL/Aramex/Amana** - Suivi colis pour BL
- [ ] **WhatsApp Business** - Envoi factures via WhatsApp
- [ ] **Sync Google Drive** - Backup automatique factures PDF

---

## 📊 ANALYTICS & REPORTING

### 5.1 Tableaux de bord spécialisés

- [ ] **Dashboard Commercial** - Performance vendeurs
- [ ] **Dashboard Financier** - Analyse marges et rentabilité
- [ ] **Dashboard Recouvrement** - Suivi créances et DSO
- [ ] **Dashboard Direction** - KPIs exécutifs

### 5.2 Rapports export

- [ ] **Rapport CA détaillé** - Par client, produit, période
- [ ] **Balance âgée** - Créances par ancienneté
- [ ] **Journal des ventes** - Conforme CGNC pour audit
- [ ] **Rapport TVA collectée** - Par taux avec détail
- [ ] **Top N clients** - Classement personnalisable

### 5.3 Prédictions IA

- [ ] **Risque impayé** - Score probabilité par client
- [ ] **Meilleur timing facturation** - Analyser historique paiements
- [ ] **Upsell opportunities** - Clients à potentiel vente croisée

---

## 🚀 PERFORMANCE

### 6.1 Optimisations

- [ ] **Lazy loading composants** - Code splitting par route
- [ ] **Memoization calculs** - Cache résultats statistiques
- [ ] **Virtual scrolling** - Listes +1000 éléments
- [ ] **Service Worker** - Offline support + cache intelligent
- [ ] **WebAssembly** - Calculs TVA complexes ultra-rapides

### 6.2 Scalabilité

- [ ] **Pagination backend** - API pagination si base >10k factures
- [ ] **Indexation** - Index sur numéros facture/ICE pour recherches
- [ ] **Compression** - Gzip/Brotli assets statiques
- [ ] **CDN** - Hébergement assets sur CDN Cloudflare

---

## 🧪 TESTS & QUALITÉ

### 7.1 Tests automatisés

- [ ] **Tests unitaires** - Vitest pour logique métier (80%+ coverage)
- [ ] **Tests composants** - React Testing Library
- [ ] **Tests E2E** - Playwright pour flux critiques
- [ ] **Tests performance** - Lighthouse CI (score >90)
- [ ] **Tests accessibilité** - Axe accessibility

### 7.2 Documentation

- [ ] **Storybook** - Documentation composants UI
- [ ] **Guide utilisateur** - PDF/vidéos tutoriels
- [ ] **API docs** - OpenAPI/Swagger si backend
- [ ] **Changelog** - CHANGELOG.md avec versions sémantiques

---

## 📅 ROADMAP

### Phase 1 (Immédiat) - Sprint 1-2 semaines
- [x] ✅ Analyse besoins module ventes
- [ ] 🔄 Dashboard moderne avec KPIs réels
- [ ] 🔄 Graphiques CA et état factures
- [ ] 🔄 Intégration store réel (pas mock)
- [ ] 🔄 Actions rapides + filtres

### Phase 2 (Court terme) - Sprint 2-4 semaines
- [ ] Dark mode
- [ ] Responsive mobile
- [ ] Traites et chèques marocains
- [ ] Vérification ICE en ligne (mock API)
- [ ] Export Excel/PDF avancés

### Phase 3 (Moyen terme) - 1-2 mois
- [ ] Factures récurrentes
- [ ] Portail client
- [ ] Analytics avancés
- [ ] Prévisions trésorerie
- [ ] Tests automatisés E2E

### Phase 4 (Long terme) - 3-6 mois
- [ ] Backend API Node.js/PostgreSQL
- [ ] Authentification multi-utilisateurs
- [ ] Intégrations paiement (CMI)
- [ ] IA prédictions impayés
- [ ] Mobile app (React Native)

---

## 🎯 OBJECTIFS MESURABLES

| KPI | Valeur Actuelle | Cible Phase 1 | Cible Phase 4 |
|-----|----------------|---------------|---------------|
| **Temps création facture** | 3 min | 1 min | 30 sec (auto) |
| **Taux satisfaction UI** | N/A | 4/5 | 4.5/5 |
| **Lighthouse Performance** | N/A | 85 | 95+ |
| **Test coverage** | 0% | 50% | 80%+ |
| **Délai moyen paiement** | N/A | Mesurer | -20% |

---

## 💡 INNOVATIONS MARCHÉ MAROCAIN

### Opportunités différenciation

1. **Intégration SIMPL-TVA native** - Seul logiciel avec export DGI 1-click
2. **Validation ICE temps réel** - Éviter erreurs de saisie
3. **Templates sectoriels** - BTP, Import/Export, Santé préconfigurés
4. **Support darija** - Interface en dialecte marocain (innovant)
5. **Paiement mobile** - CashPlus, Wafacash, Maroc Telecommerce

---

## 📞 FEEDBACK UTILISATEURS

### Demandes remontées

| Date | Utilisateur | Demande | Priorité | Statut |
|------|------------|---------|----------|--------|
| - | - | Graphiques CA visuels | 🔴 Haute | ✅ En cours |
| - | - | Export Excel factures | 🟡 Moyenne | 📋 Backlog |
| - | - | Dark mode | 🟢 Basse | 📋 Backlog |

---

## 🔗 RÉFÉRENCES

### Documentation
- [EPIC-FACTURATION.md](./EPIC-FACTURATION.md) - Spécifications complètes
- [MVP-COMPLETION.md](./MVP-COMPLETION.md) - État MVP 100%
- [README.md](./README.md) - Documentation projet

### Standards
- **CGNC** - Code Général Normalisation Comptable
- **DGI** - Direction Générale des Impôts Maroc
- **SIMPL-TVA** - Format XML déclarations TVA

---

## ✅ CRITÈRES DE SUCCÈS MVP

Le module ventes sera considéré **complet et moderne** quand:

- ✅ Dashboard avec KPIs temps réel (CA, factures, recouvrement)
- ✅ Graphiques interactifs (CA mensuel, TVA, état factures)
- ✅ Intégration store réel (plus de mock)
- ✅ Actions rapides (nouvelle facture en 1 clic)
- ✅ Conformité DGI totale (ICE, TVA, SIMPL-TVA)
- ✅ UI moderne et responsive
- ✅ Performance >85 Lighthouse
- ✅ Documentation utilisateur complète

---

**Développé avec ❤️ pour les PME marocaines**
**Framework**: Next.js 14, TypeScript, Zustand, Recharts
**Date**: 29 Octobre 2025
