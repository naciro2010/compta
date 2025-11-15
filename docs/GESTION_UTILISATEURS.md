# Système de Gestion des Utilisateurs - MizanPro

## Vue d'ensemble

MizanPro intègre un système complet de gestion des utilisateurs avec une hiérarchie de rôles, des permissions granulaires, un système d'approbation des modifications et un suivi des versions. Ce système est spécialement adapté au marché marocain et conforme aux normes de sécurité et de traçabilité comptable.

## Hiérarchie des Rôles

### 1. Super Administrateur (SUPER_ADMIN)
**Niveau le plus élevé** - Contrôle total du système

**Permissions :**
- ✅ Tous les droits sur toutes les fonctionnalités
- ✅ Gestion de tous les utilisateurs (création, modification, suppression)
- ✅ Attribution de tous les rôles, y compris Super Admin
- ✅ Gestion des paramètres système critiques
- ✅ Approbation des modifications de tous les niveaux
- ✅ Restauration des versions antérieures
- ✅ Accès complet à l'audit et aux logs

**Cas d'usage :**
- Propriétaire de l'entreprise
- Directeur général
- Responsable informatique

### 2. Administrateur (ADMIN)
**Gestion complète** - Tous les droits sauf la gestion des Super Admins

**Permissions :**
- ✅ Gestion des utilisateurs (sauf Super Admin)
- ✅ Attribution des rôles (Gestionnaire, Consultant)
- ✅ Gestion comptable complète
- ✅ Validation et verrouillage des écritures
- ✅ Clôture des périodes comptables
- ✅ Gestion des déclarations fiscales
- ✅ Approbation des demandes des gestionnaires
- ✅ Accès aux rapports et statistiques
- ✅ Gestion des établissements

**Cas d'usage :**
- Chef comptable
- Directeur financier
- Responsable administratif

### 3. Gestionnaire (MANAGER)
**Gestion courante** - Travail quotidien avec approbation requise pour certaines actions

**Permissions :**
- ✅ Consultation de tous les utilisateurs
- ✅ Création et modification de comptes comptables (avec approbation)
- ✅ Saisie et modification d'écritures comptables (avec approbation)
- ✅ Consultation des périodes comptables
- ✅ Gestion des factures (création, modification)
- ✅ Gestion des tiers (clients/fournisseurs)
- ✅ Gestion de la trésorerie
- ✅ Création de déclarations fiscales (sans validation)
- ✅ Génération et export de rapports
- ❌ Suppression définitive
- ❌ Validation des écritures
- ❌ Clôture des périodes

**Cas d'usage :**
- Comptable
- Assistant comptable
- Gestionnaire de paie

### 4. Consultant (CONSULTANT)
**Lecture seule** - Consultation et export uniquement

**Permissions :**
- ✅ Consultation de tous les comptes et écritures
- ✅ Consultation des périodes comptables
- ✅ Consultation des factures
- ✅ Consultation des tiers
- ✅ Consultation de la trésorerie
- ✅ Consultation des déclarations fiscales
- ✅ Génération et export de rapports
- ❌ Aucune modification
- ❌ Aucune création
- ❌ Aucune suppression

**Cas d'usage :**
- Expert-comptable externe
- Auditeur
- Consultant financier
- Commissaire aux comptes

## Système d'Approbation

### Principe
Les **Gestionnaires** doivent soumettre leurs modifications critiques pour approbation. Les **Admins** et **Super Admins** approuvent ou rejettent ces demandes.

### Actions nécessitant une approbation

Pour le rôle **MANAGER** :
- ✓ Création de comptes comptables
- ✓ Modification de comptes comptables
- ✓ Création d'écritures comptables
- ✓ Modification d'écritures comptables
- ✓ Modification des paramètres

### Workflow d'approbation

```
1. GESTIONNAIRE crée/modifie une entité
   ↓
2. Demande d'approbation créée (statut: PENDING)
   ↓
3. Notification envoyée aux approbateurs
   ↓
4. ADMIN/SUPER_ADMIN examine la demande
   ↓
5. Décision:
   - APPROUVÉE → Modification appliquée
   - REJETÉE → Modification annulée (avec raison)
   - ANNULÉE → Demandeur annule sa demande
```

### Priorités des demandes

- 🔴 **URGENT** : Modifications critiques (correction d'erreurs graves)
- 🟠 **HIGH** : Modifications importantes (ajout de comptes, écritures significatives)
- 🟡 **MEDIUM** : Modifications standard (modifications mineures)
- 🔵 **LOW** : Modifications non prioritaires

## Gestion des Versions

### Principe
Chaque modification d'une entité crée une nouvelle version. L'historique complet est conservé pour traçabilité et restauration.

### Entités versionnées

- Comptes comptables
- Écritures comptables
- Factures
- Paiements
- Tiers (clients/fournisseurs)
- Utilisateurs
- Paramètres
- Établissements

### Informations stockées par version

- **Numéro de version** : Incrémental (1, 2, 3...)
- **Données complètes** : Snapshot de l'entité
- **Changements** : Différences avec la version précédente
- **Action** : CREATE, UPDATE, DELETE, RESTORE
- **Auteur** : Utilisateur ayant effectué la modification
- **Date** : Horodatage précis
- **Commentaire** : Optionnel, expliquant la modification
- **Approbation liée** : Si la modification provient d'une approbation

### Restauration de versions

Les **Super Admins** peuvent restaurer une version antérieure :
1. Consulter l'historique des versions
2. Sélectionner la version à restaurer
3. Confirmer la restauration
4. Une nouvelle version est créée (action: RESTORE)

## Audit et Traçabilité

### Logs d'activité utilisateur

Toutes les actions importantes sont enregistrées :

**Authentification :**
- LOGIN : Connexion réussie
- LOGOUT : Déconnexion
- LOGIN_FAILED : Tentative de connexion échouée
- ACCOUNT_LOCKED : Compte verrouillé
- ACCOUNT_UNLOCKED : Compte déverrouillé

**Gestion de compte :**
- PASSWORD_CHANGE : Changement de mot de passe
- PASSWORD_RESET : Réinitialisation de mot de passe
- PROFILE_UPDATE : Modification du profil
- PERMISSION_CHANGE : Modification des permissions
- ROLE_CHANGE : Changement de rôle
- EMAIL_VERIFIED : Email vérifié

### Journal d'audit global

Pour chaque action comptable :
- Type d'action (CREATE, UPDATE, DELETE, VALIDATE, etc.)
- Utilisateur
- Entité affectée
- Horodatage
- Adresse IP
- User agent (navigateur)
- Détails complets des changements (avant/après)

### Conformité

Le système d'audit est **immuable** et conforme aux exigences :
- ✅ Code Général de Normalisation Comptable (CGNC) marocain
- ✅ Loi 15-95 sur les obligations comptables
- ✅ Traçabilité complète des opérations
- ✅ Conservation des preuves

## Sécurité

### Authentification

- Email + mot de passe
- Hashage sécurisé (bcrypt recommandé en production)
- Tentatives échouées limitées (5 max)
- Verrouillage automatique après 5 échecs
- Changement de mot de passe forcé au premier login

### Protection des routes

Toutes les pages du dashboard sont protégées par le composant `AuthGuard` qui vérifie :
1. ✅ L'utilisateur est-il authentifié ?
2. ✅ La session est-elle valide ?
3. ✅ A-t-il les permissions requises ?
4. ✅ A-t-il le rôle requis ?

### Sessions

- Stockage sécurisé (localStorage avec encryption recommandée)
- Expiration configurable
- Révocation possible

## Utilisation

### Connexion

**URL :** `/login`

**Compte par défaut :**
- Email : `admin@mizanpro.ma`
- Mot de passe : `admin123`
- Rôle : Super Administrateur

### Gestion des utilisateurs

**URL :** `/users`

**Accès :** Admins et Super Admins uniquement

**Fonctionnalités :**
- 👤 Liste de tous les utilisateurs
- ➕ Créer un nouvel utilisateur
- ✏️ Modifier un utilisateur
- 🗑️ Supprimer un utilisateur
- 🔒 Verrouiller/Déverrouiller un compte
- ✅ Activer/Désactiver un compte
- 🎭 Changer le rôle
- 🔍 Recherche et filtres

### Validation des approbations

**URL :** `/approvals`

**Accès :** Admins et Super Admins

**Fonctionnalités :**
- 📋 Liste des demandes en attente
- 👍 Approuver une demande
- 👎 Rejeter une demande (avec raison obligatoire)
- 👁️ Examiner les détails d'une demande
- 📊 Statistiques des approbations
- 🔍 Filtres par statut et type

### Menu utilisateur

**Accès :** En haut à droite de toutes les pages

**Options :**
- 👤 Mon profil
- 🔔 Notifications (approbations en attente)
- 📊 Mon activité
- ⚙️ Paramètres
- 🚪 Se déconnecter

## Architecture Technique

### Fichiers principaux

```
types/
  └── auth.ts                    # Types TypeScript pour l'authentification

store/
  └── auth.ts                    # Store Zustand pour l'authentification

components/
  └── auth/
      ├── AuthGuard.tsx          # Protection des routes
      └── UserMenu.tsx           # Menu utilisateur

app/
  ├── (auth)/
  │   └── login/
  │       └── page.tsx           # Page de connexion
  └── (dashboard)/
      ├── layout.tsx             # Layout avec authentification
      ├── users/
      │   └── page.tsx           # Gestion des utilisateurs
      └── approvals/
          └── page.tsx           # Validation des approbations
```

### Technologies utilisées

- **Next.js 14** : Framework React
- **Zustand** : Gestion d'état
- **TypeScript** : Typage fort
- **Tailwind CSS** : Styles
- **Lucide React** : Icônes

### Stockage

**Données persistées (localStorage) :**
- Utilisateur connecté
- Session active
- Liste des utilisateurs
- Demandes d'approbation
- Historique des versions (100 dernières)
- Logs d'activité (500 derniers)

**⚠️ Note de production :**
En production, il est fortement recommandé d'utiliser un backend sécurisé avec :
- Base de données (PostgreSQL, MongoDB)
- API REST ou GraphQL
- JWT pour les sessions
- Encryption des données sensibles

## Adaptations au marché marocain

### Langue
- 🇫🇷 Interface en français
- 🇲🇦 Support de l'arabe prévu (future version)

### Conformité
- ✅ CGNC (Code Général de Normalisation Comptable)
- ✅ Plan comptable marocain
- ✅ TVA marocaine
- ✅ Déclarations fiscales marocaines (SIMPL)

### Fuseaux horaires
- 🕐 Africa/Casablanca par défaut

### Formats
- 📅 Dates : format français (dd/mm/yyyy)
- 💰 Devise : Dirham marocain (MAD/DH)

## Roadmap

### Version 2.1 (En cours)
- ✅ Système de rôles et permissions
- ✅ Système d'approbation
- ✅ Gestion des versions
- ✅ Audit et traçabilité

### Version 2.2 (Planifiée)
- 🔜 Backend sécurisé (API)
- 🔜 Base de données
- 🔜 JWT et sessions sécurisées
- 🔜 2FA (authentification à deux facteurs)
- 🔜 Notifications en temps réel
- 🔜 Support de l'arabe

### Version 2.3 (Future)
- 🔮 Intégration LDAP/Active Directory
- 🔮 SSO (Single Sign-On)
- 🔮 Signature électronique
- 🔮 Mobile app

## Support

Pour toute question ou assistance :
- 📧 Email : support@mizanpro.ma
- 📱 Téléphone : +212 5XX-XXXXXX
- 🌐 Site web : https://mizanpro.ma

## Licence

© 2025 MizanPro - Tous droits réservés

---

**Dernière mise à jour :** 30 octobre 2025
**Version du document :** 1.0
