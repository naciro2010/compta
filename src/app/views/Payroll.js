import { payrollStore } from '../stores/payroll.js'
import { settingsStore } from '../stores/settings.js'

const clone = (value) => JSON.parse(JSON.stringify(value))

function nowPeriod(){
  const now = new Date()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  return `${now.getFullYear()}-${month}`
}

function payrollView(){
  const store = window.Alpine?.store('payroll') || payrollStore
  const settings = window.Alpine?.store('settings') || settingsStore
  const i18n = window.Alpine?.store('i18n')
  const defaultPeriod = nowPeriod()
  const existingRun = store.runs.list().find((run) => run.periode === defaultPeriod)
  return {
    store,
    settings,
    i18n,
    tab: 'employees',
    period: defaultPeriod,
    selectedRunId: existingRun?.id || null,
    showEmployeeModal: false,
    editingId: null,
    employeeForm: { nom: '', matriculeCnss: '', poste: '', salaireBase: 0, primes: [], retenues: [], iban: '' },
    employeeError: '',
    notification: { visible: false, message: '', type: 'info', timeout: null },
    actionLocks: {},
    currencyDisplay: (settingsStore.getCompany().devise || 'MAD'),
    init(){
      this.$watch('showEmployeeModal', (open) => {
        this.syncScrollLock()
        if (open) this.$nextTick(() => this.focusPanel('payrollEmployeeModal'))
      })
      this.syncScrollLock()
    },
    translate(path){
      return this.i18n?.t(path) ?? path
    },
    lockKey(name, id = ''){
      return id ? `${name}:${id}` : name
    },
    isLocked(key){
      return key ? Boolean(this.actionLocks[key]) : false
    },
    withLock(key, handler, { duration = 700 } = {}){
      if (!key) return typeof handler === 'function' ? handler() : undefined
      if (this.isLocked(key)) return null
      this.actionLocks[key] = true
      const release = () => {
        window.setTimeout(() => {
          delete this.actionLocks[key]
        }, duration)
      }
      try {
        const result = typeof handler === 'function' ? handler() : undefined
        if (result && typeof result.then === 'function') {
          return result.finally(() => release())
        }
        release()
        return result
      } catch (error) {
        release()
        if (!error?.silent) {
          this.notify(error?.message || 'Action impossible', 'error')
        }
        return null
      }
    },
    notify(message, type = 'info'){
      if (!message) return
      if (this.notification.timeout) window.clearTimeout(this.notification.timeout)
      this.notification.message = message
      this.notification.type = type
      this.notification.visible = true
      this.notification.timeout = window.setTimeout(() => this.clearNotification(), 4000)
    },
    clearNotification(){
      if (this.notification.timeout) window.clearTimeout(this.notification.timeout)
      this.notification.visible = false
      this.notification.message = ''
      this.notification.type = 'info'
      this.notification.timeout = null
    },
    focusPanel(ref){
      const el = this.$refs?.[ref]
      if (el) el.focus({ preventScroll: false })
    },
    trapFocus(event, ref){
      if (event.key !== 'Tab') return
      const panel = this.$refs?.[ref]
      if (!panel) return
      const focusable = panel.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
      if (!focusable.length) {
        event.preventDefault()
        panel.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    },
    syncScrollLock(){
      const opened = this.showEmployeeModal
      document.documentElement.classList.toggle('overflow-hidden', Boolean(opened))
      document.body.classList.toggle('overflow-hidden', Boolean(opened))
    },
    get employees(){
      return this.store.state.employees
    },
    get runs(){
      return [...this.store.state.runs].sort((a, b) => (a.periode < b.periode ? 1 : -1))
    },
    get currentRun(){
      if (this.selectedRunId) return this.store.runs.getById(this.selectedRunId)
      return this.runs.find((run) => run.periode === this.period) || null
    },
    get currentLines(){
      const run = this.currentRun
      return run?.lines || []
    },
    get totals(){
      const run = this.currentRun
      if (!run) return { brut: 0, cnss: 0, ir: 0, net: 0 }
      return run.lines.reduce((acc, line) => {
        acc.brut += line.brut
        acc.cnss += line.cnssSal + line.cnssEmp
        acc.ir += line.ir
        acc.net += line.netAPayer
        return acc
      }, { brut: 0, cnss: 0, ir: 0, net: 0 })
    },
    openEmployeeModal(employee){
      this.employeeError = ''
      if (employee) {
        this.editingId = employee.id
        this.employeeForm = clone(employee)
      } else {
        this.editingId = null
        this.employeeForm = { nom: '', matriculeCnss: '', poste: '', salaireBase: 0, primes: [], retenues: [], iban: '' }
      }
      this.showEmployeeModal = true
    },
    addPrime(){
      this.employeeForm.primes.push({ label: '', amount: 0 })
    },
    removePrime(index){
      this.employeeForm.primes.splice(index, 1)
    },
    addRetenue(){
      this.employeeForm.retenues.push({ label: '', amount: 0 })
    },
    removeRetenue(index){
      this.employeeForm.retenues.splice(index, 1)
    },
    saveEmployee(){
      this.employeeError = ''
      if (!this.employeeForm.nom) {
        this.employeeError = this.translate('payroll.validation.name')
        return
      }
      if (this.employeeForm.matriculeCnss && !/^[a-zA-Z0-9-]+$/.test(this.employeeForm.matriculeCnss)) {
        this.employeeError = this.translate('payroll.validation.matricule')
        return
      }
      if (Number(this.employeeForm.salaireBase) < 0) {
        this.employeeError = this.translate('payroll.validation.salary')
        return
      }
      const payload = {
        ...this.employeeForm,
        salaireBase: Number(this.employeeForm.salaireBase) || 0,
        primes: (this.employeeForm.primes || []).map((prime) => ({
          label: prime.label,
          amount: Number(prime.amount) || 0
        })),
        retenues: (this.employeeForm.retenues || []).map((ret) => ({
          label: ret.label,
          amount: Number(ret.amount) || 0
        }))
      }
      this.withLock(this.lockKey('employee:save', this.editingId || 'new'), () => {
        if (this.editingId) {
          this.store.employees.update(this.editingId, payload)
        } else {
          this.store.employees.add(payload)
        }
        this.showEmployeeModal = false
        this.syncScrollLock()
        this.notify(`${this.translate('payroll.employees.modal.save')} ✓`, 'success')
        this.employeeForm = { nom: '', matriculeCnss: '', poste: '', salaireBase: 0, primes: [], retenues: [], iban: '' }
        this.refreshRun()
      })
    },
    deleteEmployee(id){
      if (!confirm(this.translate('payroll.validation.confirmDelete'))) return
      this.withLock(this.lockKey('employee:delete', id), () => {
        this.store.employees.remove(id)
        this.refreshRun()
        this.notify(`${this.translate('payroll.employees.actions.delete') || 'Supprimé'} ✓`, 'success')
      })
    },
    refreshRun(){
      if (this.period) {
        const run = this.store.runs.ensureComputed(this.period)
        this.selectedRunId = run.id
      }
    },
    generate(){
      if (!this.employees.length) {
        this.notify(this.translate('payroll.validation.needEmployee'), 'warning')
        return
      }
      this.withLock('payroll:generate', () => {
        const run = this.store.runs.compute(this.period)
        this.selectedRunId = run.id
        this.tab = 'runs'
        this.notify(`${this.translate('payroll.runs.generate')} ✓`, 'success')
      })
    },
    recompute(){
      if (!this.currentRun) {
        this.generate()
        return
      }
      this.withLock(this.lockKey('payroll:recompute', this.currentRun.id), () => {
        const run = this.store.runs.compute(this.currentRun.periode)
        this.selectedRunId = run.id
        this.notify(`${this.translate('payroll.runs.recompute')} ✓`, 'success')
      })
    },
    validate(){
      if (!this.currentRun) return
      this.withLock(this.lockKey('payroll:validate', this.currentRun.id), () => {
        this.store.runs.validate(this.currentRun.id)
        this.notify(`${this.translate('payroll.runs.actions.validate')} ✓`, 'success')
      })
    },
    markPaid(){
      if (!this.currentRun) return
      this.withLock(this.lockKey('payroll:markPaid', this.currentRun.id), () => {
        this.store.runs.markPaid(this.currentRun.id)
        this.notify(`${this.translate('payroll.runs.actions.markPaid')} ✓`, 'success')
      })
    },
    exportCnss(){
      if (!this.currentRun) return
      this.withLock(this.lockKey('payroll:exportCnss', this.currentRun.id), () => {
        this.store.runs.exportCnssCsv(this.currentRun.id)
        this.notify(`${this.translate('payroll.runs.actions.exportCnss')} ✓`, 'success')
      })
    },
    printPayslips(){
      if (!this.currentRun) return
      this.withLock(this.lockKey('payroll:print', this.currentRun.id), () => {
        this.store.runs.printPayslips(this.currentRun.id)
        this.notify(`${this.translate('payroll.runs.actions.print')} ✓`, 'success')
      })
    }
  }
}

if (typeof window !== 'undefined') {
  window.payrollView = payrollView
}

export function renderPayroll(){
  const company = settingsStore.getCompany()
  const currency = company.devise || 'MAD'
  return `
  <section class="space-y-10" x-data="payrollView()" @keydown.escape.window="showEmployeeModal = false; syncScrollLock()">
    <div class="pointer-events-none fixed inset-x-0 top-5 z-[60] flex justify-center px-4" aria-live="assertive">
      <div
        class="pointer-events-auto flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium shadow-lg backdrop-blur"
        x-show="notification.visible"
        x-transition.opacity
        :class="{
          'border-emerald-200 bg-emerald-50 text-emerald-700': notification.type === 'success',
          'border-amber-200 bg-amber-50 text-amber-700': notification.type === 'warning',
          'border-rose-200 bg-rose-50 text-rose-700': notification.type === 'error',
          'border-slate-200 bg-white text-slate-700': notification.type === 'info'
        }"
        role="status"
      >
        <span class="text-base" aria-hidden="true" x-text="notification.type === 'error' ? '⚠️' : notification.type === 'warning' ? '⚠️' : '✅'"></span>
        <p x-text="notification.message"></p>
        <button class="btn-link text-xs" type="button" @click="clearNotification()">Fermer</button>
      </div>
    </div>
    <header class="space-y-2">
      <p class="text-xs uppercase tracking-[0.3em] text-slate-500" x-text="$store.i18n.t('payroll.header.badge')"></p>
      <h1 class="text-2xl font-semibold text-slate-900" x-text="$store.i18n.t('payroll.header.title')"></h1>
      <p class="text-sm text-slate-600" x-text="$store.i18n.t('payroll.header.subtitle')"></p>
      <div class="flex items-center gap-2 text-xs text-slate-500">
        <span x-text="$store.i18n.t('payroll.header.currency') + ': ' + currencyDisplay"></span>
        <span aria-hidden="true">•</span>
        <a href="#/settings" class="btn-link text-xs" x-text="$store.i18n.t('payroll.header.settingsLink')"></a>
      </div>
    </header>

    <div class="tablist" role="tablist">
      <button class="tab" :class="{ 'tab--active': tab === 'employees' }" @click="tab='employees'" role="tab" x-text="$store.i18n.t('payroll.tabs.employees')"></button>
      <button class="tab" :class="{ 'tab--active': tab === 'runs' }" @click="tab='runs'" role="tab" x-text="$store.i18n.t('payroll.tabs.runs')"></button>
      <button class="tab" :class="{ 'tab--active': tab === 'exports' }" @click="tab='exports'" role="tab" x-text="$store.i18n.t('payroll.tabs.exports')"></button>
    </div>

    <div x-show="tab === 'employees'" class="card p-6 space-y-6 shadow-sm" x-cloak>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-slate-900" x-text="$store.i18n.t('payroll.employees.title')"></h2>
          <p class="text-sm text-slate-600" x-text="$store.i18n.t('payroll.employees.subtitle')"></p>
        </div>
        <button class="btn-primary" @click="openEmployeeModal()" x-text="$store.i18n.t('payroll.employees.create')"></button>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th x-text="$store.i18n.t('payroll.employees.table.name')"></th>
              <th x-text="$store.i18n.t('payroll.employees.table.role')"></th>
              <th x-text="$store.i18n.t('payroll.employees.table.cnss')"></th>
              <th class="text-right" x-text="$store.i18n.t('payroll.employees.table.salary')"></th>
              <th class="text-right" x-text="$store.i18n.t('payroll.employees.table.actions')"></th>
            </tr>
          </thead>
          <tbody>
            <template x-for="employee in employees" :key="employee.id">
              <tr>
                <td x-text="employee.nom"></td>
                <td x-text="employee.poste"></td>
                <td x-text="employee.matriculeCnss || '-' "></td>
                <td class="text-right" x-text="(employee.salaireBase || 0).toFixed(2) + ' ${currency}'"></td>
                <td class="flex justify-end gap-2">
                  <button class="btn-link" @click="openEmployeeModal(employee)" x-text="$store.i18n.t('payroll.employees.actions.edit')"></button>
                  <button class="btn-link text-rose-500" @click="deleteEmployee(employee.id)" :disabled="isLocked(lockKey('employee:delete', employee.id))" x-text="$store.i18n.t('payroll.employees.actions.delete')"></button>
                </td>
              </tr>
            </template>
            <tr x-show="employees.length === 0"><td colspan="5" class="py-6 text-center text-sm text-slate-500" x-text="$store.i18n.t('payroll.employees.table.empty')"></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div x-show="tab === 'runs'" class="space-y-6" x-cloak>
      <div class="card p-6 space-y-4 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <h2 class="text-lg font-semibold text-slate-900" x-text="$store.i18n.t('payroll.runs.title')"></h2>
            <p class="text-sm text-slate-600" x-text="$store.i18n.t('payroll.runs.subtitle')"></p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <input type="month" class="input w-40" x-model="period" />
            <button class="btn-primary" @click="generate()" :disabled="isLocked('payroll:generate')" x-text="$store.i18n.t('payroll.runs.generate')"></button>
            <button class="btn-outline" @click="recompute()" :disabled="isLocked(lockKey('payroll:recompute', currentRun?.id || ''))" x-text="$store.i18n.t('payroll.runs.recompute')"></button>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <template x-for="run in runs" :key="run.id">
            <button class="chip" :class="{ 'chip--active': currentRun && currentRun.id === run.id }" @click="selectedRunId = run.id">
              <span x-text="run.periode"></span>
              <span class="chip__status" x-text="run.statut"></span>
            </button>
          </template>
          <p x-show="runs.length === 0" class="text-sm text-slate-500" x-text="$store.i18n.t('payroll.runs.emptyRuns')"></p>
        </div>
      </div>

      <div class="card p-6 space-y-4 shadow-sm" x-show="currentRun">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold text-slate-900" x-text="$store.i18n.t('payroll.runs.panelTitle') + ' ${currency}'"></h3>
            <p class="text-sm text-slate-600">
              <span x-text="$store.i18n.t('payroll.runs.periodLabel')"></span>
              <span x-text="currentRun?.periode"></span>
              <span aria-hidden="true">·</span>
              <span x-text="$store.i18n.t('payroll.runs.statusLabel')"></span>
              <span class="font-semibold text-slate-900" x-text="currentRun?.statut"></span>
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button class="btn-outline" @click="validate()" :disabled="isLocked(lockKey('payroll:validate', currentRun?.id || ''))" x-text="$store.i18n.t('payroll.runs.actions.validate')"></button>
            <button class="btn-outline" @click="markPaid()" :disabled="isLocked(lockKey('payroll:markPaid', currentRun?.id || ''))" x-text="$store.i18n.t('payroll.runs.actions.markPaid')"></button>
            <button class="btn-outline" @click="printPayslips()" :disabled="isLocked(lockKey('payroll:print', currentRun?.id || ''))" x-text="$store.i18n.t('payroll.runs.actions.print')"></button>
            <button class="btn-outline" @click="exportCnss()" :disabled="isLocked(lockKey('payroll:exportCnss', currentRun?.id || ''))" x-text="$store.i18n.t('payroll.runs.actions.exportCnss')"></button>
          </div>
        </div>
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th x-text="$store.i18n.t('payroll.runs.table.employee')"></th>
                <th class="text-right" x-text="$store.i18n.t('payroll.runs.table.brut')"></th>
                <th class="text-right" x-text="$store.i18n.t('payroll.runs.table.cnss')"></th>
                <th class="text-right" x-text="$store.i18n.t('payroll.runs.table.ir')"></th>
                <th class="text-right" x-text="$store.i18n.t('payroll.runs.table.net')"></th>
              </tr>
            </thead>
            <tbody>
              <template x-for="line in currentLines" :key="line.id">
                <tr>
                  <td x-text="(employees.find(e => e.id === line.employeeId)?.nom) || '-' "></td>
                  <td class="text-right" x-text="line.brut.toFixed(2)"></td>
                  <td class="text-right" x-text="(line.cnssSal + line.cnssEmp).toFixed(2)"></td>
                  <td class="text-right" x-text="line.ir.toFixed(2)"></td>
                  <td class="text-right" x-text="line.netAPayer.toFixed(2)"></td>
                </tr>
              </template>
              <tr x-show="currentLines.length === 0"><td colspan="5" class="py-6 text-center text-sm text-slate-500" x-text="$store.i18n.t('payroll.runs.table.empty')"></td></tr>
            </tbody>
            <tfoot>
              <tr class="font-semibold">
                <td x-text="$store.i18n.t('payroll.runs.table.total')"></td>
                <td class="text-right" x-text="totals.brut.toFixed(2)"></td>
                <td class="text-right" x-text="totals.cnss.toFixed(2)"></td>
                <td class="text-right" x-text="totals.ir.toFixed(2)"></td>
                <td class="text-right" x-text="totals.net.toFixed(2)"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <div x-show="tab === 'exports'" class="card p-6 space-y-4 shadow-sm" x-cloak>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-slate-900" x-text="$store.i18n.t('payroll.exports.title')"></h2>
          <p class="text-sm text-slate-600" x-text="$store.i18n.t('payroll.exports.subtitle')"></p>
        </div>
        <button class="btn-primary" @click="exportCnss()" :disabled="!currentRun || isLocked(lockKey('payroll:exportCnss', currentRun?.id || ''))" x-text="$store.i18n.t('payroll.exports.action')"></button>
      </div>
      <p class="text-sm text-slate-600" x-text="$store.i18n.t('payroll.exports.hint')"></p>
    </div>

    <div x-show="showEmployeeModal" class="modal" x-cloak @click.self="showEmployeeModal=false; employeeError=''; syncScrollLock()" role="dialog" aria-modal="true" aria-labelledby="employee-modal-title">
      <div class="modal__panel" x-ref="payrollEmployeeModal" tabindex="-1" @keydown.tab="trapFocus($event, 'payrollEmployeeModal')">
        <div class="modal__header">
          <h2 class="modal__title" id="employee-modal-title" x-text="editingId ? $store.i18n.t('payroll.employees.modal.editTitle') : $store.i18n.t('payroll.employees.modal.createTitle')"></h2>
          <button class="modal__close" @click="showEmployeeModal=false; employeeError=''; syncScrollLock()">×</button>
        </div>
        <template x-if="employeeError">
          <div class="rounded-md border border-rose-300 bg-rose-50 px-4 py-2 text-sm text-rose-700" role="alert" x-text="employeeError"></div>
        </template>
        <div class="modal__body space-y-4">
          <div class="grid gap-3 md:grid-cols-2">
            <label class="field">
              <span x-text="$store.i18n.t('payroll.employees.modal.labels.name')"></span>
              <input class="input" type="text" x-model="employeeForm.nom" />
            </label>
            <label class="field">
              <span x-text="$store.i18n.t('payroll.employees.modal.labels.role')"></span>
              <input class="input" type="text" x-model="employeeForm.poste" />
            </label>
            <label class="field">
              <span x-text="$store.i18n.t('payroll.employees.modal.labels.cnss')"></span>
              <input class="input" type="text" x-model="employeeForm.matriculeCnss" />
            </label>
            <label class="field">
              <span x-text="$store.i18n.t('payroll.employees.modal.labels.salary')"></span>
              <input class="input" type="number" min="0" step="0.01" x-model.number="employeeForm.salaireBase" />
            </label>
            <label class="field md:col-span-2">
              <span x-text="$store.i18n.t('payroll.employees.modal.labels.iban')"></span>
              <input class="input" type="text" x-model="employeeForm.iban" />
            </label>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-slate-700" x-text="$store.i18n.t('payroll.employees.modal.labels.primes')"></span>
              <button class="btn-link" type="button" @click="addPrime()" x-text="$store.i18n.t('payroll.employees.modal.addPrime')"></button>
            </div>
            <template x-for="(prime, index) in employeeForm.primes" :key="index">
              <div class="grid gap-2 md:grid-cols-[1fr_auto_auto] items-center">
                <input class="input" placeholder="Libellé" x-model="prime.label" />
                <input class="input" type="number" step="0.01" placeholder="Montant" x-model.number="prime.amount" />
                <button class="btn-link text-rose-500" @click="removePrime(index)" x-text="$store.i18n.t('payroll.employees.modal.remove')"></button>
              </div>
            </template>
            <p x-show="employeeForm.primes.length===0" class="text-xs text-slate-500" x-text="$store.i18n.t('payroll.employees.modal.noPrime')"></p>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-slate-700" x-text="$store.i18n.t('payroll.employees.modal.labels.retenues')"></span>
              <button class="btn-link" type="button" @click="addRetenue()" x-text="$store.i18n.t('payroll.employees.modal.addRetenue')"></button>
            </div>
            <template x-for="(ret, index) in employeeForm.retenues" :key="index">
              <div class="grid gap-2 md:grid-cols-[1fr_auto_auto] items-center">
                <input class="input" placeholder="Libellé" x-model="ret.label" />
                <input class="input" type="number" step="0.01" placeholder="Montant" x-model.number="ret.amount" />
                <button class="btn-link text-rose-500" @click="removeRetenue(index)" x-text="$store.i18n.t('payroll.employees.modal.remove')"></button>
              </div>
            </template>
            <p x-show="employeeForm.retenues.length===0" class="text-xs text-slate-500" x-text="$store.i18n.t('payroll.employees.modal.noRetenue')"></p>
          </div>
        </div>
        <div class="modal__footer">
          <button class="btn-outline" @click="showEmployeeModal=false; employeeError=''; syncScrollLock()" x-text="$store.i18n.t('payroll.employees.modal.cancel')"></button>
          <button class="btn-primary" @click="saveEmployee()" :disabled="isLocked(lockKey('employee:save', editingId || 'new'))" x-text="$store.i18n.t('payroll.employees.modal.save')"></button>
        </div>
      </div>
    </div>
  </section>
  `
}
