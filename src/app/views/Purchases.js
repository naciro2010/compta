import { getDataset } from './_utils.js'
export function renderPurchases(){
  const ds = getDataset()
  return `
    <div class="card">
      <h2 class="font-semibold">Achats (POC)</h2>
      <ul class="mt-2 list-disc pl-6 text-sm text-slate-600"><li>Formulaire OCR mock dans Épic E</li></ul>
      <div class="mt-4 overflow-auto">
        <table class="min-w-full text-sm">
          <thead><tr><th class="p-2 text-left">#</th><th class="p-2 text-left">Fournisseur</th><th class="p-2 text-left">Date</th><th class="p-2 text-left">TTC</th></tr></thead>
          <tbody>${ds.purchases.slice(0,30).map(p=>`
            <tr class="border-t"><td class="p-2">${p.id}</td><td class="p-2">${p.supplierName}</td><td class="p-2">${p.date}</td><td class="p-2">${p.totalTtc.toFixed(2)}</td></tr>
          `).join('')}</tbody>
        </table>
      </div>
    </div>`
}
