# ComptaFlow Maroc – POC Epic 1

Preuve de concept pour une solution de comptabilité marocaine moderne conforme CGNC.

## 🚀 Démarrage rapide

```bash
npm install
npm run dev
```

Le serveur Vite s'ouvre sur [http://localhost:5173](http://localhost:5173) avec la landing page bilingue.

## 🏗️ Scripts

- `npm run dev` – Serveur de développement Vite
- `npm run build` – Build de production
- `npm run preview` – Prévisualisation du build

## 🎨 Stack & outils

- Vite 5
- Tailwind CSS 3.4
- Alpine.js 3
- Chart.js 4 (disponible pour les dashboards à venir)

## 📁 Structure

```
.
├── index.html          # Landing page FR/AR
├── app.html            # Shell SPA (placeholder)
├── src/
│   ├── data/landing.json
│   ├── js/
│   │   ├── i18n.js
│   │   └── landing.js
│   └── styles/main.css
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## ✅ Fonctionnalités livrées (Epic 1)

- Landing page marketing FR/AR avec bascule instantanée et gestion RTL
- Mode sombre avec persistance
- Animations Intersection Observer et glassmorphism
- Formulaire de contact validé, stockage local et export CSV
- Toasts, modale, CTA brochure imprimable
- SEO optimisé (meta + JSON-LD)

## 🔜 Suite des epics

Epic 2 introduira le shell SPA complet et l'architecture modulaire.
