import Alpine from 'alpinejs'
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

window.Alpine = Alpine
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
