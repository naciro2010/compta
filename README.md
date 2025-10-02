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
## Limites
- Exports EDI TVA/IS factices. Aucune conformité production.
