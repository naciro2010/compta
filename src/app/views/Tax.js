export function renderTax(){
  return `
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="text-xl font-semibold text-slate-900">TVA & fiscalité</h1>
        <p class="text-sm text-slate-600">Exports XML SIMPL et calculs mock pour illustrer la trajectoire produit.</p>
      </header>
      <div class="empty-state">
        <svg class="h-6 w-6 text-slate-400" aria-hidden="true">
          <use href="./src/assets/icon-pack.svg#icon-vat"></use>
        </svg>
        <p>Les déclarations officielles seront intégrées lorsque les API DGI seront disponibles. Ce POC présente les contrôles et exports prévus.</p>
      </div>
    </section>
  `
}
