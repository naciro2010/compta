import { seedStore } from '../../shared/seed.js'
export function renderSettings(){
  const ds = seedStore.get()
  const co = ds.companies?.[0] || {}
  return `
    <div class="card space-y-3">
      <h2 class="font-semibold">Société (démo)</h2>
      <div class="grid md:grid-cols-2 gap-3">
        <label class="block">Raison sociale<input class="mt-1 w-full border rounded p-2" value="${co.raisonSociale||''}"></label>
        <label class="block">ICE<input class="mt-1 w-full border rounded p-2" value="${co.ICE||''}"></label>
        <label class="block">IF<input class="mt-1 w-full border rounded p-2" value="${co.IF||''}"></label>
        <label class="block">RC<input class="mt-1 w-full border rounded p-2" value="${co.RC||''}"></label>
        <label class="block">TP<input class="mt-1 w-full border rounded p-2" value="${co.TP||''}"></label>
      </div>
      <p class="text-sm text-slate-500">Formulaire complet dans Épic A.</p>
    </div>`
}
