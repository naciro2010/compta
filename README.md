# POC démo, données fictives, non conforme pour production.

## AtlasTech Compta — POC front
Application monopage statique illustrant un flux comptable marocain (facturation, achats, banque, TVA, paie) en HTML/CSS/JS vanilla avec persistance LocalStorage et bilingue FR/AR.

### Lancer la démo
1. Cloner le dépôt.
2. Servir les fichiers statiques (ex. `python -m http.server` depuis la racine).
3. Ouvrir `http://localhost:8000/index.html` dans un navigateur moderne.

### Déploiement recommandé
- Hébergement statique : GitHub Pages, Netlify, Vercel ou équivalent.
- Aucun backend requis, tout se fait côté client.

### Jeux de données
- Chargement initial via `/data/*.json` (clients, fournisseurs, factures, banque, paie...).
- À la première ouverture, les données sont copiées dans LocalStorage (`atlas-compta-poc-v1`).
- Bouton **« Réinitialiser la démo »** dans la barre latérale pour purger le stockage et relire les JSON d’origine.

### Fonctionnalités clés
- **Dashboard** KPI cash, TVA estimée, relances + sparkline SVG.
- **Ventes/Achats** : création/édition, statut, paiements, impression via CSS print, OCR factice (nom de fichier).
- **Banque** : import mock, rapprochement auto/manuel (drag & drop), annulation lettrage.
- **Écritures** : génération pré-comptable simplifiée, suivi lettrage.
- **TVA** : agrégation mensuelle/trimestrielle, export XML fictif (DGI mock + checksum).
- **Paie** : calcul net, export CSV CNSS simulé.
- **Paramètres** : identité société, plan comptable interne, i18n, thèmes, export/import dataset JSON.

### Limitations connues
- Pas de connexion aux API réelles (DGI, CNSS, banques).
- Calculs simplifiés (arrondis, devises uniques MAD, plan comptable interne réduit).
- Sécurité basique côté client (sanitisation minimale, pas d’authentification).
- PDF via `window.print` uniquement.

### Licence
Distribué sous licence MIT.
