import Alpine from 'alpinejs'
import { i18nStore } from '../shared/i18n.js'
import { seedStore } from '../shared/seed.js'
import { router } from './router.js'
import { settingsStore } from './stores/settings.js'
import { payrollStore } from './stores/payroll.js'
import { ledgerStore } from './stores/ledger.js'
import '../styles/tailwind.css'

window.Alpine = Alpine
Alpine.store('i18n', i18nStore)
Alpine.store('seed', seedStore)
Alpine.store('settings', settingsStore)
Alpine.store('payroll', payrollStore)
Alpine.store('ledger', ledgerStore)
Alpine.start()
router.start()
