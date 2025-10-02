import { settingsStore } from '../stores/settings.js'

const clone = (value) => JSON.parse(JSON.stringify(value))

function settingsController(){
  const store = window.Alpine?.store('settings') || settingsStore
  const i18n = window.Alpine?.store('i18n')
  return {
    company: clone(store.getCompany()),
    payroll: clone(store.getPayroll()),
    errors: {},
    message: '',
    addTvaRate(){
      this.company.tvaTaux.push(0)
    },
    removeTvaRate(index){
      this.company.tvaTaux.splice(index, 1)
    },
    translate(path){
      return i18n?.t(path) ?? path
    },
    validate(){
      const errors = {}
      const iceMsg = this.translate('settings.companyCard.errors.ice')
      if (!/^[0-9]{15}$/.test(this.company.ICE || '')) {
        errors.ICE = iceMsg
      }
      const flexTemplate = this.translate('settings.companyCard.errors.flex')
      const flexiblePattern = /^[a-zA-Z0-9-]{6,20}$/
      ;['IF','RC','TP'].forEach((field) => {
        const value = this.company[field] || ''
        if (value && !flexiblePattern.test(value)) {
          errors[field] = flexTemplate.replace('{field}', field)
        }
      })
      this.errors = errors
      return Object.keys(errors).length === 0
    },
    save(){
      if (!this.validate()) return
      const normalizedRates = this.company.tvaTaux
        .map((rate) => Number(rate))
        .filter((rate) => !Number.isNaN(rate) && rate >= 0)
      this.company.tvaTaux = [...new Set(normalizedRates)]
      store.updateCompany(this.company)
      store.updatePayroll(this.payroll)
      this.message = this.translate('settings.payrollCard.messageSaved')
      i18n?.init(this.company.langue)
      setTimeout(() => { this.message = '' }, 2500)
    },
    reset(){
      store.reset()
      this.company = clone(store.getCompany())
      this.payroll = clone(store.getPayroll())
    }
  }
}

if (typeof window !== 'undefined') {
  window.settingsController = settingsController
}

function renderTvaTable(company){
  return company.tvaTaux.map((rate, index) => `
    <tr>
      <td class=\"py-2 pr-3\"><input type=\"number\" step=\"0.1\" class=\"input\" x-model.number=\"company.tvaTaux[${index}]\" /></td>
      <td class=\"py-2\"><button type=\"button\" class=\"btn-link\" @click=\"removeTvaRate(${index})\" x-text=\"$store.i18n.t('settings.companyCard.actions.removeRate')\"></button></td>
    </tr>
  `).join('')
}

export function renderSettings(){
  const { company } = settingsStore.state
  return `
  <section class="space-y-8" x-data="settingsController()">
    <header class="flex flex-col gap-2">
      <p class="text-xs uppercase tracking-[0.3em] text-primary-300" x-text="company.raisonSociale || 'MA-ACC'"></p>
      <h1 class="text-2xl font-semibold text-white" x-text="$store.i18n.t('settings.title')"></h1>
      <p class="text-sm text-slate-300" x-text="$store.i18n.t('settings.subtitle')"></p>
      <div x-show="message" class="inline-flex items-center gap-2 px-3 py-1 text-sm rounded bg-emerald-500/20 text-emerald-200">✅ <span x-text="message"></span></div>
    </header>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="panel">
        <div class="panel__header">
          <div>
            <h2 class="panel__title" x-text="$store.i18n.t('settings.companyCard.title')"></h2>
            <p class="panel__subtitle" x-text="$store.i18n.t('settings.companyCard.subtitle')"></p>
          </div>
          <button type="button" class="btn-secondary" @click="reset()" x-text="$store.i18n.t('settings.companyCard.reset')"></button>
        </div>
        <form class="space-y-6" @submit.prevent="save()">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="field">
              <span x-text="$store.i18n.t('settings.companyCard.labels.name')"></span>
              <input class="input" type="text" required x-model="company.raisonSociale" />
            </label>
            <label class="field">
              <span x-text="$store.i18n.t('settings.companyCard.labels.city')"></span>
              <input class="input" type="text" x-model="company.ville" />
            </label>
            <label class="field" :class="{'field-error': errors.ICE}">
              <span x-text="$store.i18n.t('settings.companyCard.labels.ice')"></span>
              <input class="input" type="text" inputmode="numeric" maxlength="15" x-model="company.ICE" />
              <p class="field-hint" x-show="errors.ICE" x-text="errors.ICE"></p>
            </label>
            <label class="field" :class="{'field-error': errors.IF}">
              <span x-text="$store.i18n.t('settings.companyCard.labels.if')"></span>
              <input class="input" type="text" x-model="company.IF" />
              <p class="field-hint" x-show="errors.IF" x-text="errors.IF"></p>
            </label>
            <label class="field" :class="{'field-error': errors.RC}">
              <span x-text="$store.i18n.t('settings.companyCard.labels.rc')"></span>
              <input class="input" type="text" x-model="company.RC" />
              <p class="field-hint" x-show="errors.RC" x-text="errors.RC"></p>
            </label>
            <label class="field" :class="{'field-error': errors.TP}">
              <span x-text="$store.i18n.t('settings.companyCard.labels.tp')"></span>
              <input class="input" type="text" x-model="company.TP" />
              <p class="field-hint" x-show="errors.TP" x-text="errors.TP"></p>
            </label>
            <label class="field">
              <span x-text="$store.i18n.t('settings.companyCard.labels.currency')"></span>
              <input class="input" type="text" x-model="company.devise" />
            </label>
            <label class="field">
              <span x-text="$store.i18n.t('settings.companyCard.labels.language')"></span>
              <select class="input" x-model="company.langue">
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            </label>
            <label class="field">
              <span x-text="$store.i18n.t('settings.companyCard.labels.theme')"></span>
              <select class="input" x-model="company.theme">
                <option value="clair">Clair</option>
                <option value="sombre">Sombre</option>
              </select>
            </label>
            <label class="field">
              <span x-text="$store.i18n.t('settings.companyCard.labels.tvaPeriod')"></span>
              <select class="input" x-model="company.tvaPeriode">
                <option value="mensuel">Mensuelle</option>
                <option value="trimestriel">Trimestrielle</option>
              </select>
            </label>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <span class="font-medium text-sm text-slate-200" x-text="$store.i18n.t('settings.companyCard.labels.tvaRates')"></span>
              <button type="button" class="btn-link" @click="addTvaRate()" x-text="$store.i18n.t('settings.companyCard.actions.addRate')"></button>
            </div>
            <table class="table mt-3">
              <thead><tr><th>Taux</th><th></th></tr></thead>
              <tbody>
                ${renderTvaTable(company)}
                <tr x-show="company.tvaTaux.length === 0"><td colspan="2" class="py-4 text-sm text-slate-400" x-text="$store.i18n.t('settings.companyCard.noRate')"></td></tr>
              </tbody>
            </table>
          </div>

          <div class="flex items-center justify-end gap-3">
            <button type="button" class="btn-secondary" @click="reset()" x-text="$store.i18n.t('settings.companyCard.actions.cancel')"></button>
            <button type="submit" class="btn" :disabled="Object.keys(errors).length" x-text="$store.i18n.t('settings.companyCard.actions.save')"></button>
          </div>
        </form>
      </div>

      <div class="panel">
        <div class="panel__header">
          <div>
            <h2 class="panel__title" x-text="$store.i18n.t('settings.payrollCard.title')"></h2>
            <p class="panel__subtitle" x-text="$store.i18n.t('settings.payrollCard.subtitle')"></p>
          </div>
          <a href="#/payroll" class="btn-secondary" x-text="$store.i18n.t('settings.payrollCard.goToPayroll')"></a>
        </div>
        <form class="space-y-6" @submit.prevent="save()">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="field">
              <span x-text="$store.i18n.t('settings.payrollCard.labels.txCnssSal')"></span>
              <input class="input" type="number" step="0.01" min="0" x-model.number="payroll.txCnssSal" />
            </label>
            <label class="field">
              <span x-text="$store.i18n.t('settings.payrollCard.labels.txCnssEmp')"></span>
              <input class="input" type="number" step="0.01" min="0" x-model.number="payroll.txCnssEmp" />
            </label>
            <label class="field">
              <span x-text="$store.i18n.t('settings.payrollCard.labels.txIR')"></span>
              <input class="input" type="number" step="0.01" min="0" x-model.number="payroll.txIR" />
            </label>
            <label class="field">
              <span x-text="$store.i18n.t('settings.payrollCard.labels.rounding')"></span>
              <input class="input" type="number" step="0.01" min="0.01" x-model.number="payroll.rounding" />
            </label>
            <label class="field md:col-span-2">
              <span x-text="$store.i18n.t('settings.payrollCard.labels.payDateRule')"></span>
              <select class="input" x-model="payroll.payDateRule">
                <option value="last-day" x-text="$store.i18n.t('settings.payrollCard.payDateOptions.lastDay')"></option>
              </select>
            </label>
          </div>
          <div class="rounded border border-white/10 bg-white/5 p-4 text-sm text-slate-300" x-text="$store.i18n.t('settings.payrollCard.note')"></div>
          <div class="flex items-center justify-end gap-3">
            <button type="submit" class="btn" x-text="$store.i18n.t('settings.payrollCard.action')"></button>
          </div>
        </form>
      </div>
    </div>
  </section>
  `
}
