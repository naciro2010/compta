import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import intersect from '@alpinejs/intersect'
import persist from '@alpinejs/persist'
import { i18nStore } from '../shared/i18n.js'
import { seedStore } from '../shared/seed.js'
import { router } from './router.js'
import { settingsStore } from './stores/settings.js'
import { payrollStore } from './stores/payroll.js'
import { ledgerStore } from './stores/ledger.js'
import { customersStore } from './stores/customers.js'
import { remindersStore } from './stores/reminders.js'
import { salesStore } from './stores/sales.js'
import '../styles/tailwind.css'
import '../styles/tokens.css'

Alpine.plugin(collapse)
Alpine.plugin(intersect)
Alpine.plugin(persist)

const toastStore = {
  items: [],
  counter: 0,
  push({ title = '', message = '', type = 'info', timeout = 4200 } = {}) {
    const id = ++this.counter
    const toast = { id, title, message, type, timeoutId: null }
    this.items = [...this.items, toast]
    if (timeout) {
      toast.timeoutId = window.setTimeout(() => this.dismiss(id), timeout)
    }
    return id
  },
  dismiss(id) {
    const toast = this.items.find((item) => item.id === id)
    if (toast?.timeoutId) window.clearTimeout(toast.timeoutId)
    this.items = this.items.filter((item) => item.id !== id)
  },
  success(message, title = '') {
    this.push({ title, message, type: 'success' })
  },
  error(message, title = '') {
    this.push({ title, message, type: 'error', timeout: 6000 })
  },
  info(message, title = '') {
    this.push({ title, message, type: 'info' })
  }
}

const layoutStore = {
  sidebarPersist: Alpine.$persist(false).as('maacc:sidebar:open'),
  get sidebarOpen() {
    return this.sidebarPersist
  },
  set sidebarOpen(value) {
    this.sidebarPersist = Boolean(value)
  },
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen
  },
  closeSidebar() {
    this.sidebarOpen = false
  }
}

window.Alpine = Alpine
window.maaccToast = (payload) => Alpine.store('toast').push(payload)

Alpine.store('toast', toastStore)
Alpine.store('layout', layoutStore)
Alpine.store('i18n', i18nStore)
Alpine.store('seed', seedStore)
Alpine.store('settings', settingsStore)
Alpine.store('payroll', payrollStore)
Alpine.store('ledger', ledgerStore)
Alpine.store('customers', customersStore)
Alpine.store('reminders', remindersStore)
Alpine.store('sales', salesStore)

Alpine.start()
router.start()
