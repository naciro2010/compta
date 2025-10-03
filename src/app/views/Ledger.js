export function renderLedger(){
  return `
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="text-xl font-semibold text-slate-900">Écritures & journaux</h1>
        <p class="text-sm text-slate-600">Le moteur de partie double est simulé dans ce POC. Les actions complètes arrivent dans l'Épic B.</p>
      </header>
      <div class="empty-state">
        <svg class="h-6 w-6 text-slate-400" aria-hidden="true">
          <use href="./src/assets/icon-pack.svg#icon-ledger"></use>
        </svg>
        <p>Le module d'écritures détaillées sera branché lors de la prochaine itération. Utilisez les exports depuis Ventes/Achats pour démontrer la cohérence comptable.</p>
      </div>
    </section>
  `
}
