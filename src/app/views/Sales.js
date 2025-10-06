import '../styles/sales.css'
import { salesStore } from '../stores/sales.js'
import { customersStore } from '../stores/customers.js'
import { remindersStore } from '../stores/reminders.js'
import { settingsStore } from '../stores/settings.js'
import { formatMoney as formatMAD } from '../components/Money.js'
import '../components/SmartTable.js'
import '../components/SelectSearch.js'
import { toast } from '../components/Toast.js'
import { toggleBodyScroll, trapFocus as modalTrapFocus, focusPanel as modalFocusPanel } from '../components/Modal.js'
import { printDocument } from './Sales.PrintInvoice.js'
import { validators } from '../utils/validators.js'
import { docTotals, lineTotals } from '../utils/tax.js'

function clone(value){
  return JSON.parse(JSON.stringify(value))
}

function emptyDocumentForm(){
  const today = new Date().toISOString().slice(0, 10)
  const due = new Date()
  due.setDate(due.getDate() + 30)
  return {
    id: null,
    type: 'INVOICE',
    customerId: null,
    customerName: '',
    dates: { issue: today, due: due.toISOString().slice(0, 10), delivery: null },
    lines: [{ label: '', qty: 1, unit: 'unité', unitPrice: 0, vatRate: 20, discountPct: 0 }],
    notes: ''
  }
}

function emptyCustomerForm(){
  return {
    name: '',
    ICE: '',
    IF: '',
    RC: '',
    address: '',
    city: '',
    email: '',
    phone: '',
    paymentTerms: '30J',
    creditLimit: 0
  }
}

function salesComponent(){
  const store = window.Alpine?.store('sales') || salesStore
  const customers = window.Alpine?.store('customers') || customersStore
  const reminders = window.Alpine?.store('reminders') || remindersStore
  const i18n = window.Alpine?.store('i18n')
  const company = settingsStore.getCompany()
  return {
    store,
    customers,
    reminders,
    i18n,
    company,
    tab: 'invoices',
    tabMap: { QUOTE: 'quotes', ORDER: 'orders', DELIVERY: 'deliveries', INVOICE: 'invoices', CREDIT: 'credits' },
    filters: { search: '', customerId: '', status: '' },
    showDocumentModal: false,
    showPaymentModal: false,
    showReminderModal: false,
    showCustomerModal: false,
    documentForm: emptyDocumentForm(),
    paymentForm: { docId: null, amount: 0, date: new Date().toISOString().slice(0, 10), mode: 'bank' },
    transformSourceId: null,
    transformTarget: null,
    formError: '',
    customerEditingId: null,
    customerForm: emptyCustomerForm(),
    customerError: '',
    actionLocks: {},
    init(){
      this.closeAllModals()
      this.$watch('showDocumentModal', (value) => {
        this.syncScrollLock()
        if (value) this.$nextTick(() => this.focusPanel('documentModalPanel'))
      })
      this.$watch('showPaymentModal', (value) => {
        this.syncScrollLock()
        if (value) this.$nextTick(() => this.focusPanel('paymentModalPanel'))
      })
      this.$watch('showCustomerModal', (value) => {
        this.syncScrollLock()
        if (value) this.$nextTick(() => this.focusPanel('customerModalPanel'))
      })
      this.syncScrollLock()
    },
    get vatRates(){
      return this.store.state.settings.vatRates
    },
    get currency(){
      return this.company.devise || 'MAD'
    },
    formatMoney(value, currency){
      const locale = this.i18n?.lang === 'ar' ? 'ar-MA' : 'fr-MA'
      return formatMAD(value, currency || this.currency, locale)
    },
    t(path){
      return this.i18n?.t?.(path) || path
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
    notify(message, type = 'info', title = ''){
      if (!message) return
      toast({ message, type, title })
    },
    focusPanel(ref){
      const el = this.$refs?.[ref]
      if (el) modalFocusPanel(el)
    },
    trapFocus(event, ref){
      const panel = this.$refs?.[ref]
      if (panel) modalTrapFocus(event, panel)
    },
    syncScrollLock(){
      const opened = this.showDocumentModal || this.showPaymentModal || this.showCustomerModal
      toggleBodyScroll(Boolean(opened))
    },
    get allDocuments(){
      return this.store.state.documents
    },
    documentsByType(type){
      return this.store.list({ type, search: this.filters.search || undefined, customerId: this.filters.customerId || undefined })
    },
    get quotes(){ return this.documentsByType('QUOTE') },
    get orders(){ return this.documentsByType('ORDER') },
    get deliveries(){ return this.documentsByType('DELIVERY') },
    get invoices(){ return this.documentsByType('INVOICE') },
    get credits(){ return this.documentsByType('CREDIT') },
    get customerRows(){
      return this.customers.list().map((customer) => {
        const stats = this.store.state.documents.length ? this.customers.stats(customer.id, this.store.state.documents) : { caHt: 0, encours: 0, dso: 0, marginRate: 0 }
        return {
          id: customer.id,
          raw: customer,
          name: customer.name,
          ice: customer.ICE,
          email: customer.email,
          phone: customer.phone,
          paymentTerms: customer.paymentTerms,
          creditLimit: customer.creditLimit || 0,
          caHt: stats.caHt,
          encours: stats.encours,
          dso: stats.dso,
          marginRate: stats.marginRate
        }
      })
    },
    get reminderRows(){
      const invoices = this.invoices
      return this.reminders.state.reminders.map((reminder) => {
        const invoice = invoices.find((inv) => inv.id === reminder.invoiceId) || this.allDocuments.find((doc) => doc.id === reminder.invoiceId)
        return {
          id: reminder.id,
          invoiceId: reminder.invoiceId,
          level: reminder.level,
          customer: customers.byId(reminder.customerId)?.name || invoice?.customerSnapshot?.name || '',
          datePlanned: reminder.datePlanned,
          sent: reminder.sent,
          channel: reminder.channel,
          amount: invoice?.totals?.ttc || 0
        }
      })
    },
    get columns(){
      const t = (path, fallback = '') => this.t(path) || fallback
      return {
        documents: [
          { key: 'id', label: '#', sortable: true },
          { key: 'customer', label: t('sales.labels.customer') },
          { key: 'issue', label: t('sales.labels.issue', 'Émission') },
          { key: 'due', label: t('sales.labels.dueDate') },
          { key: 'ht', label: t('sales.totals.ht') },
          { key: 'tva', label: t('sales.totals.vat') },
          { key: 'ttc', label: t('sales.totals.ttc') },
          { key: 'dueLeft', label: t('sales.totals.due') },
          { key: 'status', label: t('sales.labels.status', 'Statut') }
        ],
        customers: [
          { key: 'name', label: t('customers.form.name') },
          { key: 'ice', label: 'ICE' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Téléphone' },
          { key: 'paymentTerms', label: t('customers.form.terms') },
          { key: 'creditLimit', label: t('customers.form.credit') },
          { key: 'caHt', label: 'CA HT' },
          { key: 'encours', label: t('sales.totals.due') },
          { key: 'dso', label: 'DSO' },
          { key: 'marginRate', label: 'Marge %' }
        ],
        reminders: [
          { key: 'invoiceId', label: t('sales.tabs.invoices', 'Facture') },
          { key: 'customer', label: t('sales.labels.customer') },
          { key: 'level', label: t('reminders.plan') },
          { key: 'datePlanned', label: t('sales.labels.dueDate') },
          { key: 'amount', label: t('sales.totals.ttc') },
          { key: 'sent', label: t('sales.labels.status') }
        ]
      }
    },
    mapDoc(doc){
      return {
        raw: doc,
        id: doc.id,
        customer: doc.customerSnapshot?.name || '',
        issue: doc.dates?.issue,
        due: doc.dates?.due,
        ht: this.formatMoney(doc.totals?.ht || 0, doc.currency),
        tva: this.formatMoney(doc.totals?.tva || 0, doc.currency),
        ttc: this.formatMoney(doc.totals?.ttc || 0, doc.currency),
        dueLeft: this.formatMoney(doc.totals?.dueLeft || 0, doc.currency),
        status: doc.status,
        statusLabel: this.t(`sales.statuses.${doc.status}`) || doc.status
      }
    },
    tableRows(type){
      return this.documentsByType(type).map((doc) => this.mapDoc(doc))
    },
    openNew(type){
      this.documentForm = emptyDocumentForm()
      this.documentForm.type = type
      this.documentForm.lines = [{ label: '', qty: 1, unit: 'unité', unitPrice: 0, vatRate: this.vatRates[0] || 20, discountPct: 0 }]
      this.documentForm.customerName = ''
      this.showDocumentModal = true
    },
    editDocument(id){
      const doc = this.store.byId(id)
      if (!doc) return
      this.documentForm = clone({
        id: doc.id,
        type: doc.type,
        customerId: doc.customerId,
        dates: clone(doc.dates),
        lines: clone(doc.lines),
        notes: doc.notes || '',
        customerName: doc.customerSnapshot?.name || ''
      })
      this.showDocumentModal = true
    },
    addLine(){
      this.documentForm.lines.push({ label: '', qty: 1, unit: 'unité', unitPrice: 0, vatRate: this.vatRates[0] || 20, discountPct: 0 })
    },
    removeLine(index){
      this.documentForm.lines.splice(index, 1)
      if (!this.documentForm.lines.length) this.addLine()
    },
    saveDocument(){
      this.formError = ''
      if (!this.documentForm.customerId) {
        this.formError = this.t('customers.form.name') + ' ?'
        return
      }
      const linesValid = this.documentForm.lines.every((line) =>
        validators.required(line.label) && Number.isFinite(Number(line.unitPrice)) && validators.isPositiveQuantity(Number(line.qty))
      )
      if (!linesValid) {
        this.formError = 'Vérifiez libellés, quantités et montants.'
        return
      }

      const key = this.lockKey('document:save', this.documentForm.id || 'new')
      this.withLock(key, () => {
        if (this.documentForm.id) {
          this.store.update(this.documentForm.id, {
            customerId: this.documentForm.customerId,
            lines: this.documentForm.lines,
            dates: this.documentForm.dates,
            notes: this.documentForm.notes
          })
        } else {
          this.store.create(this.documentForm.type, {
            customerId: this.documentForm.customerId,
            lines: this.documentForm.lines,
            dates: this.documentForm.dates,
            notes: this.documentForm.notes
          })
        }
        this.showDocumentModal = false
        this.notify(`${this.t('sales.actions.save') || 'Enregistré'} ✓`, 'success')
      })
    },
    confirmDocument(id){
      this.withLock(this.lockKey('confirm', id), () => {
        this.store.confirm(id)
        this.notify(`${this.t('sales.actions.confirm') || 'Confirmé'} · ${id}`, 'success')
      })
    },
    transformDocument(id, target){
      this.withLock(this.lockKey('transform', `${id}-${target}`), () => {
        const doc = this.store.transform(id, target)
        const targetTab = this.tabMap[target] || this.tab
        this.tab = targetTab
        this.notify(`${this.t('sales.actions.transform') || 'Transformé'} · ${doc.id}`, 'success')
      })
    },
    askPayment(id){
      const doc = this.store.byId(id)
      if (!doc) return
      this.paymentForm = { docId: doc.id, amount: doc.totals?.dueLeft || 0, date: new Date().toISOString().slice(0, 10), mode: 'bank' }
      this.showPaymentModal = true
    },
    recordPayment(){
      if (!this.paymentForm.docId) return
      this.withLock('payment:record', () => {
        this.store.recordPayment(this.paymentForm.docId, this.paymentForm)
        this.showPaymentModal = false
        this.notify(`${this.t('sales.actions.pay') || 'Paiement'} ✓`, 'success')
      })
    },
    createCredit(id){
      this.withLock(this.lockKey('credit', id), () => {
        const credit = this.store.createCredit(id)
        this.notify(`${this.t('sales.actions.refund') || 'Avoir'} · ${credit.id}`, 'success')
      })
    },
    print(id, locale = null){
      const doc = this.store.byId(id)
      if (!doc) return
      const lang = locale || this.i18n?.lang || 'fr'
      printDocument(doc, lang)
    },
    selectCustomer(customer){
      this.documentForm.customerId = customer.id
      this.documentForm.customerName = customer.name
    },
    reminderPlan(id){
      const invoice = this.store.byId(id)
      if (!invoice) return
      const plan = this.reminders.generatePlan(invoice)
      const dates = plan.map((item) => item.datePlanned).join(', ')
      const label = this.t('reminders.plan') || 'Relances'
      this.notify(`${label} · ${dates || '—'}`, plan.length ? 'success' : 'info')
    },
    markReminder(reminderId){
      this.withLock(this.lockKey('reminder', reminderId), () => {
        this.reminders.markSent(reminderId)
        this.notify(`${this.t('reminders.sendMark') || 'Marqué'} ✓`, 'success')
      })
    },
    exportReminders(){
      this.withLock('reminder:export', () => {
        this.reminders.exportCsv()
        this.notify(`${this.t('reminders.export') || 'Export'} ✓`, 'success')
      })
    },
    alertPendingReminders(){
      const pending = this.reminders.pending()
      const type = pending.length ? 'warning' : 'success'
      const label = this.t('reminders.title') || 'Relances'
      this.notify(`${pending.length} · ${label}`, type)
    },
    lineTotal(line){
      const totals = lineTotals(line)
      return this.formatMoney(totals.ttc, this.currency)
    },
    get draftTotals(){
      const draft = {
        type: this.documentForm.type,
        lines: this.documentForm.lines,
        payments: [],
        totals: {}
      }
      return docTotals(draft, this.store.state.settings.vatMode)
    },
    vatBreakdown(){
      return Object.entries(this.draftTotals.vatByRate || {})
    },
    statusBadge(status){
      return this.t(`sales.statuses.${status}`) || status
    },
    closeAllModals(){
      this.showDocumentModal = false
      this.showCustomerModal = false
      this.showPaymentModal = false
      this.formError = ''
      this.customerError = ''
      this.syncScrollLock()
    },
    resetCustomerForm(){
      this.customerForm = emptyCustomerForm()
      this.customerEditingId = null
      this.customerError = ''
      this.showCustomerModal = false
      this.syncScrollLock()
    },
    openCustomerModal(customer = null){
      this.customerError = ''
      if (customer) {
        this.customerEditingId = customer.id
        this.customerForm = { ...emptyCustomerForm(), ...clone(customer) }
      } else {
        this.resetCustomerForm()
      }
      this.showCustomerModal = true
    },
    saveCustomer(){
      this.customerError = ''
      const payload = {
        ...this.customerForm,
        creditLimit: Number(this.customerForm.creditLimit || 0)
      }
      if (!validators.required(payload.name)) {
        this.customerError = this.t('customers.form.name') + ' ?'
        return
      }
      if (payload.ICE && !validators.isICE(payload.ICE)) {
        this.customerError = 'ICE invalide'
        return
      }
      if (payload.IF && !validators.isIF(payload.IF)) {
        this.customerError = 'IF invalide'
        return
      }
      if (payload.RC && !validators.isRC(payload.RC)) {
        this.customerError = 'RC invalide'
        return
      }
      const attempt = () => {
        try {
          if (this.customerEditingId) {
            this.customers.update(this.customerEditingId, payload)
          } else {
            this.customers.add(payload)
          }
          this.showCustomerModal = false
          this.syncScrollLock()
          this.notify(`${this.t('customers.actions.save') || 'Client'} ✓`, 'success')
          this.resetCustomerForm()
        } catch (error) {
          this.customerError = error?.message?.replace('customers:', '').trim() || 'Erreur'
          if (error) error.silent = true
          return null
        }
      }
      this.withLock(this.lockKey('customer', this.customerEditingId || 'new'), attempt)
    },
    deleteCustomer(id){
      if (!confirm(this.t('customers.deleteConfirm') || 'Supprimer ce client ?')) return
      this.customers.remove(id)
      this.notify(`${this.t('customers.actions.delete') || 'Supprimé'} ✓`, 'success')
    }
  }
}

if (typeof window !== 'undefined') {
  window.salesView = salesComponent
}

function renderTable(sectionId, type){
  return `
    <section x-show="tab === '${sectionId}'" x-cloak>
      <div class="flex items-center justify-between gap-2 mb-4">
        <h2 class="text-lg font-semibold text-slate-900" x-text="t('sales.tabs.${sectionId}') ?? '${sectionId}'"></h2>
        <div class="flex items-center gap-2">
          ${['customers', 'reminders'].includes(sectionId) ? '' : `<button class="btn-secondary" type="button" @click="openNew('${type}')" x-text="t('sales.actions.new${type.charAt(0) + type.slice(1).toLowerCase()}') ?? 'Nouveau'"></button>`}
        </div>
      </div>
      <div class="sales-table-wrapper" x-data="smartTable({ columns: $root.columns.documents, rows: [] })" x-init="$nextTick(() => { options.rows = $root.tableRows('${type}') })" x-effect="options.rows = $root.tableRows('${type}')">
        <div class="flex items-center justify-between gap-2 mb-3">
          <input type="search" class="input" placeholder="Filtrer" x-model="search" />
          <div class="flex items-center gap-1 text-xs text-slate-500">
            <button class="btn-secondary btn-compact" type="button" @click="prevPage()" :disabled="page <= 1">‹</button>
            <span x-text="page"></span>
            <span>/</span>
            <span x-text="pageCount"></span>
            <button class="btn-secondary btn-compact" type="button" @click="nextPage()" :disabled="page >= pageCount">›</button>
          </div>
        </div>
        <table class="table text-sm">
          <thead :class="options.stickyHeader ? 'sticky top-0 bg-white shadow-sm' : ''">
            <tr>
              <template x-for="column in columns" :key="column.key">
                <th @click="sortBy(column.key)" class="cursor-pointer select-none">
                  <span x-text="column.label"></span>
                </th>
              </template>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <template x-for="row in paginated" :key="row.id">
              <tr>
                <td x-text="row.id"></td>
                <td x-text="row.customer"></td>
                <td x-text="row.issue"></td>
                <td x-text="row.due"></td>
                <td x-text="row.ht"></td>
                <td x-text="row.tva"></td>
                <td x-text="row.ttc"></td>
                <td x-text="row.dueLeft"></td>
                <td><span class="sales-status--badge" :data-status="row.status" x-text="row.statusLabel"></span></td>
                <td class="flex flex-wrap gap-1">
                  <button class="btn-link text-xs" type="button" @click="$root.editDocument(row.id)" x-text="$root.t('sales.actions.edit')"></button>
                  <button class="btn-link text-xs" type="button" @click="$root.confirmDocument(row.id)" :disabled="$root.isLocked($root.lockKey('confirm', row.id))" x-text="$root.t('sales.actions.confirm')"></button>
                  <button class="btn-link text-xs" type="button" @click="$root.print(row.id)" x-text="$root.t('sales.actions.print')"></button>
                  <template x-if="$root.tab === 'invoices'">
                    <button class="btn-link text-xs" type="button" @click="$root.askPayment(row.id)" :disabled="$root.isLocked('payment:record')" x-text="$root.t('sales.actions.pay')"></button>
                  </template>
                  <template x-if="$root.tab === 'invoices'">
                    <button class="btn-link text-xs" type="button" @click="$root.createCredit(row.id)" :disabled="$root.isLocked($root.lockKey('credit', row.id))" x-text="$root.t('sales.actions.refund')"></button>
                  </template>
                  <template x-if="$root.tab === 'invoices'">
                    <button class="btn-link text-xs" type="button" @click="$root.reminderPlan(row.id)" x-text="$root.t('sales.actions.reminder')"></button>
                  </template>
                  <template x-if="$root.tab === 'quotes'">
                    <button class="btn-link text-xs" type="button" @click="$root.transformDocument(row.id, 'ORDER')" :disabled="$root.isLocked($root.lockKey('transform', row.id + '-ORDER'))" x-text="'→ ' + $root.t('sales.tabs.orders')"></button>
                  </template>
                  <template x-if="$root.tab === 'orders'">
                    <button class="btn-link text-xs" type="button" @click="$root.transformDocument(row.id, 'DELIVERY')" :disabled="$root.isLocked($root.lockKey('transform', row.id + '-DELIVERY'))" x-text="'→ ' + $root.t('sales.tabs.deliveries')"></button>
                  </template>
                  <template x-if="$root.tab === 'deliveries'">
                    <button class="btn-link text-xs" type="button" @click="$root.transformDocument(row.id, 'INVOICE')" :disabled="$root.isLocked($root.lockKey('transform', row.id + '-INVOICE'))" x-text="'→ ' + $root.t('sales.tabs.invoices')"></button>
                  </template>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>
  `
}

export function renderSales(){
  return `
  <section class="space-y-8" x-data="salesView()" @keydown.escape.window="closeAllModals()">
    <header class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900" x-text="t('sales.header.title') || 'Module ventes'"></h1>
          <p class="text-sm text-slate-600" x-text="t('sales.header.subtitle') || 'Cycle complet Devis → Facture → Encaissements'"></p>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-secondary" type="button" @click="openNew('INVOICE')" x-text="t('sales.actions.newInvoice') || 'Nouvelle facture'"></button>
        </div>
      </div>
      <nav class="sales-tabs">
        <button class="sales-tab" :data-active="tab === 'quotes'" @click="tab='quotes'" x-text="t('sales.tabs.quotes')"></button>
        <button class="sales-tab" :data-active="tab === 'orders'" @click="tab='orders'" x-text="t('sales.tabs.orders')"></button>
        <button class="sales-tab" :data-active="tab === 'deliveries'" @click="tab='deliveries'" x-text="t('sales.tabs.deliveries')"></button>
        <button class="sales-tab" :data-active="tab === 'invoices'" @click="tab='invoices'" x-text="t('sales.tabs.invoices')"></button>
        <button class="sales-tab" :data-active="tab === 'credits'" @click="tab='credits'" x-text="t('sales.tabs.credits')"></button>
        <button class="sales-tab" :data-active="tab === 'customers'" @click="tab='customers'" x-text="t('sales.tabs.customers')"></button>
        <button class="sales-tab" :data-active="tab === 'reminders'" @click="tab='reminders'" x-text="t('sales.tabs.reminders')"></button>
      </nav>
    </header>

    ${renderTable('quotes', 'QUOTE')}
    ${renderTable('orders', 'ORDER')}
    ${renderTable('deliveries', 'DELIVERY')}
    ${renderTable('invoices', 'INVOICE')}
    ${renderTable('credits', 'CREDIT')}

    <section x-show="tab === 'customers'" x-cloak>
      <div class="flex items-center justify-between gap-2 mb-4">
        <h2 class="text-lg font-semibold" x-text="t('customers.title')"></h2>
        <button class="btn-secondary" type="button" @click="openCustomerModal()" x-text="t('customers.new')"></button>
      </div>
      <div x-data="smartTable({ columns: $root.columns.customers, rows: [], pageSize: 12 })" x-init="$nextTick(() => { options.rows = $root.customerRows })" x-effect="options.rows = $root.customerRows">
        <div class="flex items-center justify-between gap-2 mb-3">
          <input type="search" class="input" placeholder="Rechercher" x-model="search" />
          <div class="flex items-center gap-1 text-xs text-slate-500">
            <button class="btn-secondary btn-compact" type="button" @click="prevPage()" :disabled="page <= 1">‹</button>
            <span x-text="page"></span>
            <span>/</span>
            <span x-text="pageCount"></span>
            <button class="btn-secondary btn-compact" type="button" @click="nextPage()" :disabled="page >= pageCount">›</button>
          </div>
        </div>
        <table class="table text-sm">
          <thead class="sticky top-0 bg-white shadow-sm">
            <tr>
              <template x-for="column in columns" :key="column.key">
                <th x-text="column.label"></th>
              </template>
              <th x-text="$root.t('sales.labels.actions') || 'Actions'"></th>
            </tr>
          </thead>
          <tbody>
            <template x-for="row in paginated" :key="row.id">
              <tr>
                <template x-for="column in columns" :key="column.key">
                  <td x-text="column.key === 'caHt' || column.key === 'encours' || column.key === 'creditLimit' ? $root.formatMoney(row[column.key]) : (column.key === 'marginRate' ? row[column.key] + ' %' : row[column.key])"></td>
                </template>
                <td class="flex flex-wrap gap-1">
                  <button class="btn-link text-xs" type="button" @click="$root.openCustomerModal(row.raw)" x-text="$root.t('customers.actions.edit')"></button>
                  <button class="btn-link text-xs text-rose-600" type="button" @click="$root.deleteCustomer(row.id)" x-text="$root.t('customers.actions.delete')"></button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>

    <section x-show="tab === 'reminders'" x-cloak>
      <div class="flex items-center justify-between gap-2 mb-4">
        <h2 class="text-lg font-semibold" x-text="t('reminders.title')"></h2>
        <div class="flex gap-2">
          <button class="btn-secondary" type="button" @click="$root.alertPendingReminders()" x-text="t('reminders.plan')"></button>
          <button class="btn-secondary" type="button" @click="exportReminders()" :disabled="isLocked('reminder:export')" x-text="t('reminders.export')"></button>
        </div>
      </div>
      <div x-data="smartTable({ columns: $root.columns.reminders, rows: [] , pageSize: 15 })" x-init="$nextTick(() => { options.rows = $root.reminderRows })" x-effect="options.rows = $root.reminderRows">
        <div class="flex items-center justify-between gap-2 mb-3">
          <input type="search" class="input" placeholder="Filtrer" x-model="search" />
          <div class="flex items-center gap-1 text-xs text-slate-500">
            <button class="btn-secondary btn-compact" type="button" @click="prevPage()" :disabled="page <= 1">‹</button>
            <span x-text="page"></span>
            <span>/</span>
            <span x-text="pageCount"></span>
            <button class="btn-secondary btn-compact" type="button" @click="nextPage()" :disabled="page >= pageCount">›</button>
          </div>
        </div>
        <table class="table text-sm">
          <thead class="sticky top-0 bg-white shadow-sm">
            <tr>
              <template x-for="column in columns" :key="column.key">
                <th x-text="column.label"></th>
              </template>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <template x-for="row in paginated" :key="row.id">
              <tr>
                <td x-text="row.invoiceId"></td>
                <td x-text="row.customer"></td>
                <td x-text="row.level"></td>
                <td x-text="row.datePlanned"></td>
                <td x-text="$root.formatMoney(row.amount)"></td>
                <td>
                  <span class="sales-status--badge" :data-status="row.sent ? 'CONFIRMED' : 'DRAFT'" x-text="row.sent ? '✓' : 'À faire'"></span>
                </td>
                <td>
                  <button class="btn-link text-xs" type="button" @click="$root.markReminder(row.id)" :disabled="$root.isLocked($root.lockKey('reminder', row.id))">Marquer</button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>

    <div class="sales-modal" x-show="showDocumentModal" x-cloak @click.self="showDocumentModal=false" role="dialog" aria-modal="true" aria-labelledby="document-modal-title">
      <div class="sales-modal__panel space-y-6" x-ref="documentModalPanel" tabindex="-1" @keydown.tab="trapFocus($event, 'documentModalPanel')">
        <header class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-semibold" id="document-modal-title">Document ventes</h2>
            <p class="text-sm text-slate-500">Cycle Maroc – stocké dans le navigateur.</p>
          </div>
          <button class="btn-secondary" type="button" @click="showDocumentModal=false">×</button>
        </header>

        <template x-if="formError">
          <div class="rounded-md border border-rose-300 bg-rose-50 px-4 py-2 text-sm text-rose-700" role="alert" x-text="formError"></div>
        </template>

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="label">Client</label>
            <div x-data="selectSearch({ items: customers.list(), onSelect: (item) => $root.selectCustomer(item), clearOnSelect: false })" class="relative">
              <input type="text" class="input" placeholder="Rechercher..." x-model="query" @focus="open=true" @keydown="onKeydown($event)" x-init="query = $root.documentForm.customerName || ''" x-effect="if($root.showDocumentModal){ query = $root.documentForm.customerName || query }" />
              <ul class="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-white shadow" x-show="open">
                <template x-for="item in filtered" :key="item.id">
                  <li class="px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer" @mousedown.prevent="select(item)" @click.prevent>
                    <div class="font-medium" x-text="item.name"></div>
                    <div class="text-xs text-slate-500" x-text="item.ICE"></div>
                  </li>
                </template>
              </ul>
            </div>
          </div>
          <div>
            <label class="label">Date d'émission</label>
            <input type="date" class="input" x-model="documentForm.dates.issue" />
          </div>
          <div>
            <label class="label">Échéance</label>
            <input type="date" class="input" x-model="documentForm.dates.due" />
          </div>
        </div>

        <div>
          <label class="label">Notes</label>
          <textarea class="input" rows="3" x-model="documentForm.notes" placeholder="Mentions internes ou conditions particulières"></textarea>
        </div>

        <div class="sales-form__lines">
          <template x-for="(line, index) in documentForm.lines" :key="index">
            <div class="sales-line">
              <div>
                <label class="label">Libellé</label>
                <input type="text" class="input" x-model="line.label" />
              </div>
              <div>
                <label class="label">Qté</label>
                <input type="number" step="0.01" class="input" x-model.number="line.qty" />
              </div>
              <div>
                <label class="label">Unité</label>
                <input type="text" class="input" x-model="line.unit" />
              </div>
              <div>
                <label class="label">PU HT</label>
                <input type="number" step="0.01" class="input" x-model.number="line.unitPrice" />
              </div>
              <div>
                <label class="label">Remise %</label>
                <input type="number" step="0.01" class="input" x-model.number="line.discountPct" />
              </div>
              <div>
                <label class="label">TVA</label>
                <select class="input" x-model.number="line.vatRate">
                  <template x-for="rate in vatRates" :key="rate">
                    <option :value="rate" x-text="rate + ' %'"></option>
                  </template>
                </select>
              </div>
              <div class="flex flex-col items-end gap-2">
                <span class="text-xs text-slate-500" x-text="line.label ? Number(line.qty || 0).toFixed(2) + '×' + Number(line.unitPrice || 0).toFixed(2) + ' → ' + lineTotal(line) : ''"></span>
                <button class="btn-secondary" type="button" @click="removeLine(index)">−</button>
              </div>
            </div>
          </template>
          <button class="btn-secondary" type="button" @click="addLine()">Ajouter une ligne</button>
        </div>

        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          <h3 class="font-semibold text-slate-700">Totaux</h3>
          <div class="mt-2 grid gap-1">
            <div class="flex items-center justify-between"><span>HT</span><span x-text="formatMoney(draftTotals.ht)"></span></div>
            <template x-for="([rate, amount]) in vatBreakdown()" :key="rate">
              <div class="flex items-center justify-between"><span x-text="'TVA ' + rate + ' %'"></span><span x-text="formatMoney(amount)"></span></div>
            </template>
            <div class="flex items-center justify-between font-semibold"><span>TTC</span><span x-text="formatMoney(draftTotals.ttc)"></span></div>
          </div>
        </div>

        <footer class="flex items-center justify-end gap-2">
          <button class="btn-secondary" type="button" @click="showDocumentModal=false" x-text="t('sales.actions.cancel')"></button>
          <button class="btn-primary" type="button" @click="saveDocument()" :disabled="isLocked(lockKey('document:save', documentForm.id || 'new'))" x-text="t('sales.actions.save')"></button>
        </footer>
      </div>
    </div>

    <div class="sales-modal" x-show="showPaymentModal" x-cloak @click.self="showPaymentModal=false" role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
      <div class="sales-modal__panel space-y-4 max-w-md" x-ref="paymentModalPanel" tabindex="-1" @keydown.tab="trapFocus($event, 'paymentModalPanel')">
        <header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold" id="payment-modal-title">Paiement</h2>
          <button class="btn-secondary" type="button" @click="showPaymentModal=false">×</button>
        </header>
        <div>
          <label class="label">Montant</label>
          <input type="number" step="0.01" class="input" x-model.number="paymentForm.amount" />
        </div>
        <div>
          <label class="label">Date</label>
          <input type="date" class="input" x-model="paymentForm.date" />
        </div>
        <div>
          <label class="label">Mode</label>
          <select class="input" x-model="paymentForm.mode">
            <option value="bank">Virement</option>
            <option value="cash">Espèces</option>
            <option value="cheque">Chèque</option>
          </select>
        </div>
        <footer class="flex items-center justify-end gap-2">
          <button class="btn-secondary" type="button" @click="showPaymentModal=false" x-text="t('sales.actions.cancel')"></button>
          <button class="btn-primary" type="button" @click="recordPayment()" :disabled="isLocked('payment:record')" x-text="t('sales.actions.save')"></button>
        </footer>
      </div>
    </div>

    <div class="sales-modal" x-show="showCustomerModal" x-cloak @click.self="resetCustomerForm()" role="dialog" aria-modal="true" aria-labelledby="customer-modal-title">
      <div class="sales-modal__panel space-y-6 max-w-3xl" x-ref="customerModalPanel" tabindex="-1" @keydown.tab="trapFocus($event, 'customerModalPanel')">
        <header class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold" id="customer-modal-title" x-text="customerEditingId ? t('customers.actions.edit') : t('customers.new')"></h2>
            <p class="text-sm text-slate-500">Fiche client utilisée dans le module ventes.</p>
          </div>
          <button class="btn-secondary" type="button" @click="showCustomerModal=false; resetCustomerForm()">×</button>
        </header>

        <template x-if="customerError">
          <div class="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-700" role="alert" x-text="customerError"></div>
        </template>

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="label" x-text="t('customers.form.name')"></label>
            <input type="text" class="input" x-model="customerForm.name" required placeholder="Nom du client" />
          </div>
          <div>
            <label class="label">ICE</label>
            <input type="text" class="input" x-model="customerForm.ICE" placeholder="15 chiffres" maxlength="15" inputmode="numeric" />
          </div>
          <div>
            <label class="label">IF</label>
            <input type="text" class="input" x-model="customerForm.IF" placeholder="Identifiant fiscal" />
          </div>
          <div>
            <label class="label">RC</label>
            <input type="text" class="input" x-model="customerForm.RC" placeholder="Registre de commerce" />
          </div>
          <div>
            <label class="label" x-text="t('customers.form.address')"></label>
            <input type="text" class="input" x-model="customerForm.address" placeholder="Adresse complète" />
          </div>
          <div>
            <label class="label" x-text="t('customers.form.city')"></label>
            <input type="text" class="input" x-model="customerForm.city" placeholder="Ville" />
          </div>
          <div>
            <label class="label" x-text="t('customers.form.email')"></label>
            <input type="email" class="input" x-model="customerForm.email" placeholder="contact@client.ma" />
          </div>
          <div>
            <label class="label" x-text="t('customers.form.phone')"></label>
            <input type="text" class="input" x-model="customerForm.phone" placeholder="05xx xx xx xx" />
          </div>
          <div>
            <label class="label" x-text="t('customers.form.terms')"></label>
            <input type="text" class="input" x-model="customerForm.paymentTerms" placeholder="30J, comptant..." />
          </div>
          <div>
            <label class="label" x-text="t('customers.form.credit')"></label>
            <input type="number" step="0.01" class="input" x-model.number="customerForm.creditLimit" placeholder="Encours autorisé" />
          </div>
        </div>

        <footer class="flex items-center justify-end gap-2">
          <button class="btn-secondary" type="button" @click="showCustomerModal=false; resetCustomerForm()" x-text="t('sales.actions.cancel')"></button>
          <button class="btn-primary" type="button" @click="saveCustomer()" :disabled="isLocked(lockKey('customer', customerEditingId || 'new'))" x-text="t('customers.actions.save')"></button>
        </footer>
      </div>
    </div>
  </section>
  `
}
