import Alpine from 'alpinejs'
import { i18nStore } from '../shared/i18n.js'
import { seedStore } from '../shared/seed.js'
import '../styles/tailwind.css'
window.Alpine = Alpine
Alpine.store('i18n', i18nStore)
Alpine.store('seed', seedStore)
Alpine.start()
document.documentElement.setAttribute('dir', 'ltr')
