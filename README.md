# AtlasCompta — Landing + SPA POC (CGNC Maroc)

Prototype statique illustrant une solution de comptabilité générale marocaine conforme au CGNC.
Le projet comprend :
- **Une landing page bilingue FR/AR** avec argumentaire marketing, formulaire de contact (LocalStorage) et brochure imprimable.
- **Une application SPA démonstrative** (dashboard, ventes, achats, banque, écritures, TVA, paie, immobilisations, paramètres) en HTML/CSS/JS vanilla.

> ⚠️ POC démo — données fictives — non conforme production. Aucun service backend ni stockage serveur.

## Démarrer
1. Cloner ce dépôt.
2. Lancer un serveur statique (ex. `python -m http.server` depuis la racine).
3. Ouvrir `http://localhost:8000/index.html` pour la landing, puis accéder à la SPA via le bouton **« Ouvrir la démo »** (`app.html`).

## Déploiement
- Compatible GitHub Pages, Netlify, Vercel ou tout hébergement statique.
- Aucune dépendance externe, assets et données fournis dans le dépôt (`/assets`, `/data`, `/i18n`).

## Jeux de données & persistance
- Jeu initial chargé depuis `/data/*.json` (sociétés, clients, fournisseurs, ventes, achats, banque, paie, immobilisations).
- Au premier chargement, les données sont copiées dans `localStorage` (`atlas-compta-poc-v1`).
- Bouton **« Réinitialiser la démo »** dans la SPA pour purger le stockage et relire les JSON d’origine.
- Le formulaire contact de la landing stocke les demandes dans `localStorage` (`landing.contacts`) avec export CSV.

## Fonctionnalités clés
- **Landing FR/AR** : bascule RTL, FAQ, témoignages, export contacts, impression brochure.
- **Dashboard** : KPIs cash & TVA, relances et sparkline.
- **Ventes / Achats** : saisie partie double, paiements, impression CSS, OCR mock fournisseurs.
- **Banque** : import JSON, rapprochement auto (score ≥0,7) et manuel, annulation.
- **Écritures** : journaux/lettres, grand livre simplifié.
- **TVA** : calcul collectée/déductible mensuel ou trimestriel, export XML POC (mock DGI + checksum).
- **Paie** : 5 salariés fictifs, calcul net, export CNSS mock (CSV).
- **Immobilisations** : actifs linéaires, tableau d’amortissement, écritures d’inventaire, export CSV/print.
- **Paramètres** : identité société, plan comptable, préférences thème/langue, export/import dataset, section conformité CGNC/SIMPL/CNSS.

## Ce que ce n’est pas
- Pas de connecteurs officiels (DGI, CNSS, banques).
- Pas de signature légale ni de contrôles fiscaux avancés.
- Pas de multi-utilisateurs ni d’authentification.

## Limites connues
- Calculs simplifiés (arrondis, devise MAD uniquement, plan comptable réduit).
- Données mock uniquement, sans sauvegarde serveur.
- Génération PDF via `window.print`.

## Licence
MIT — voir `LICENSE` si présent, sinon considérer ce dépôt comme MIT par défaut.
