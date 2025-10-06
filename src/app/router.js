import { debugLog } from '../shared/debug.js'
import { renderDashboard } from './views/Dashboard.js'
import { renderSales } from './views/Sales.js'
import { renderPurchases } from './views/Purchases.js'
import { renderBank } from './views/Bank.js'
import { renderLedger } from './views/Ledger.js'
import { renderTax } from './views/Tax.js'
import { renderPayroll } from './views/Payroll.js'
import { renderSettings } from './views/Settings.js'
import { renderFixedAssets } from './views/FixedAssets.js'

const DEFAULT_ROUTE = '#/dashboard'

const ROUTES = new Map([
  ['#/dashboard', { render: renderDashboard }],
  ['#/sales', { render: renderSales }],
  ['#/purchases', { render: renderPurchases }],
  ['#/bank', { render: renderBank }],
  ['#/ledger', { render: renderLedger }],
  ['#/tax', { render: renderTax }],
  ['#/payroll', { render: renderPayroll }],
  ['#/settings', { render: renderSettings }],
  ['#/fixed-assets', { render: renderFixedAssets }]
])

function resolveRoute(hash){
  return ROUTES.get(hash) || ROUTES.get(DEFAULT_ROUTE)
}

function normalizedHash(){
  const hash = window.location.hash || DEFAULT_ROUTE
  return ROUTES.has(hash) ? hash : DEFAULT_ROUTE
}

function normalizeViewPayload(result, hash){
  if (typeof result === 'string') {
    return { template: result, init: null }
  }
  if (result && typeof result === 'object') {
    const template = result.template ?? result.html ?? ''
    const init = typeof result.init === 'function' ? result.init : null
    const cleanup = typeof result.cleanup === 'function' ? result.cleanup : null
    return { template, init, cleanup }
  }
  debugLog('router', 'empty view payload for', hash)
  return {
    template: '<section class="p-6 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg">Vue introuvable.</section>',
    init: null,
    cleanup: null
  }
}

function locateContainer(){
  return document.querySelector('[data-router-view]') || document.getElementById('view')
}

function destroyTree(target){
  if (!window.Alpine || typeof window.Alpine.destroyTree !== 'function') return
  Array.from(target.children).forEach((child) => {
    try {
      window.Alpine.destroyTree(child)
    } catch (error) {
      debugLog('router', 'destroyTree error', error)
    }
  })
}

function initTree(target){
  if (!window.Alpine) return
  if (typeof window.Alpine.initTree === 'function') {
    window.Alpine.initTree(target)
    return
  }
  // Fallback: re-scan children when initTree is unavailable
  Array.from(target.children).forEach((child) => {
    try {
      window.Alpine.discoverUninitializedComponents(child, (component) => {
        window.Alpine.initializeComponent(component)
      })
    } catch (error) {
      debugLog('router', 'fallback initTree error', error)
    }
  })
}

export const router = {
  started: false,
  container: null,
  current: null,
  cleanup: null,
  start(){
    if (this.started) return
    this.started = true

    const boot = () => {
      this.container = locateContainer()
      if (!this.container) {
        debugLog('router', 'no container found for view mounting')
        return
      }
      if (!window.location.hash || !ROUTES.has(window.location.hash)) {
        window.location.hash = DEFAULT_ROUTE
      }
      this.render(normalizedHash(), { force: true })
      window.addEventListener('hashchange', () => this.onHashChange())
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot, { once: true })
    } else {
      boot()
    }
  },
  stop(){
    if (!this.started) return
    this.started = false
    if (typeof this.cleanup === 'function') {
      try { this.cleanup() } catch (error) { debugLog('router', 'cleanup error on stop', error) }
    }
    this.cleanup = null
  },
  onHashChange(){
    const hash = normalizedHash()
    if (hash === this.current) {
      debugLog('router', 'skip render for identical hash', hash)
      return
    }
    this.render(hash)
  },
  render(hash, { force = false } = {}){
    if (!this.container) {
      debugLog('router', 'render requested without container ready')
      return
    }
    if (!force && hash === this.current) return

    const route = resolveRoute(hash)
    if (!route) {
      debugLog('router', 'no route handler for', hash)
      return
    }

    let payload
    try {
      payload = route.render({ hash })
    } catch (error) {
      debugLog('router', 'render error', hash, error)
      payload = {
        template: '<section class="p-6 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg">Erreur de chargement de la vue.</section>'
      }
    }

    const view = normalizeViewPayload(payload, hash)
    const template = (view.template || '').trim()
    if (!template) {
      debugLog('router', 'route produced empty template', hash)
      return
    }

    if (typeof this.cleanup === 'function') {
      try { this.cleanup() } catch (error) { debugLog('router', 'cleanup hook error', error) }
      this.cleanup = null
    }

    destroyTree(this.container)

    const fragment = document.createElement('template')
    fragment.innerHTML = template
    this.container.replaceChildren(fragment.content.cloneNode(true))

    initTree(this.container)

    if (typeof view.init === 'function') {
      try {
        const maybeCleanup = view.init(this.container, { hash })
        if (typeof maybeCleanup === 'function') {
          this.cleanup = maybeCleanup
        }
      } catch (error) {
        debugLog('router', 'view init error', error)
      }
    } else if (typeof view.cleanup === 'function') {
      this.cleanup = view.cleanup
    }

    this.current = hash
    this.container.setAttribute('data-route', hash)
    this.container.dispatchEvent(new CustomEvent('maacc:route-changed', {
      detail: { hash }
    }))
  }
}

export default router
