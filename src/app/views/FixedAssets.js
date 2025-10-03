export function renderFixedAssets(){
  return `
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="text-xl font-semibold text-slate-900">Immobilisations</h1>
        <p class="text-sm text-slate-600">Tableau d'amortissement mock prévu pour l'Épic bonus.</p>
      </header>
      <div class="empty-state">
        <svg class="h-6 w-6 text-slate-400" aria-hidden="true">
          <use href="./src/assets/icon-pack.svg#icon-report"></use>
        </svg>
        <p>Ajoutez vos propres colonnes ou exports pour illustrer la roadmap immobilisations.</p>
      </div>
    </section>
  `
}
