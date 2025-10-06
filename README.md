# MA‑ACC — POC
POC statique (Vite + Tailwind + Alpine), données factices marocaines, LocalStorage.  
## Démarrer
- `npm i`
- `npm run dev` → ouvrir `http://localhost:5173/`
## Pages
- `index.html` : Landing FR/AR
- `app.html` : App SPA (Dashboard, Ventes, Achats, Banque, Écritures, TVA, Paie, Paramètres)
## Données
- Seed dans LocalStorage (`maacc:dataset:v1`). Bouton “Réinitialiser la démo” dans l’app.

## Module Ventes (démo)
- Cycle Devis → Commande → BL → Facture → Avoir avec numérotation séquentielle par type/année/société.
- TVA 20/14/10/7 en mode débit ou encaissement, calculs par ligne et ventilation prorata sur encaissements.
- Encaissements multi-modes, statut auto (brouillon/confirmé/payée), lettrage client et écritures comptables (VTE/TVA/CLT, BNK/CAISSE).
- Relances automatiques (J0/J+7/J+15), marquage, export CSV, suivi des échéances.
- Fiches clients (stats CA, encours, DSO, marge) et CRUD avec validations ICE/IF/RC.
- Impression facture/avoir/BL en FR & AR (mise en page A4, mentions légales paramétrées).
- UI Vite + Tailwind + Alpine : SmartTable (tri/recherche), SelectSearch (autocomplétion), totaux live, données 100 % LocalStorage.

### Clés LocalStorage utilisées
- `maacc:sales:documents` — documents ventes.
- `maacc:sales:customers` — base clients.
- `maacc:sales:reminders` — relances planifiées.
- `maacc:settings.sales` — préférences numérotation / TVA / mentions légales.
- `maacc:numbering:{company}:{type}:{year}` — séquences par type.
## Limites
- Exports EDI TVA/IS factices. Aucune conformité production.
