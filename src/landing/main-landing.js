import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import intersect from '@alpinejs/intersect'
import persist from '@alpinejs/persist'
import '../styles/tailwind.css'
import '../styles/tokens.css'
import '../styles/landing.css'
import contentFr from './content-fr.json'
import contentAr from './content-ar.json'

Alpine.plugin(collapse)
Alpine.plugin(intersect)
Alpine.plugin(persist)

const STORAGE_KEYS = {
  leads: 'landing.leads',
  stats: 'landing.stats',
  lang: 'landing.lang'
}

const DICT = { fr: contentFr, ar: contentAr }

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.warn(`[landing] unable to parse ${key}`, error)
    return fallback
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`[landing] unable to persist ${key}`, error)
  }
}

function applyLangAttributes(lang) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.setAttribute('lang', lang)
  document.documentElement.setAttribute('dir', dir)
}

function updateHeadMeta(meta) {
  if (!meta) return
  document.title = meta.title
  const mappings = [
    ['meta[name="description"]', 'content', meta.description],
    ['meta[property="og:title"]', 'content', meta.title],
    ['meta[property="og:description"]', 'content', meta.description],
    ['meta[name="twitter:title"]', 'content', meta.title],
    ['meta[name="twitter:description"]', 'content', meta.description],
    ['meta[property="og:image"]', 'content', meta.ogImage],
    ['meta[name="twitter:image"]', 'content', meta.ogImage]
  ]
  mappings.forEach(([selector, attr, value]) => {
    const node = document.querySelector(selector)
    if (node && value) node.setAttribute(attr, value)
  })
}

const defaultLang = (() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.lang)
    if (stored && stored in DICT) return stored
  } catch (error) {
    console.warn('[landing] unable to read stored lang', error)
  }
  return 'fr'
})()

const landingStore = {
  lang: defaultLang,
  dictionary: DICT,
  leads: loadJson(STORAGE_KEYS.leads, []),
  stats: loadJson(STORAGE_KEYS.stats, {}),
  get isRtl() {
    return this.lang === 'ar'
  },
  get content() {
    return this.dictionary[this.lang]
  },
  setLang(lang) {
    if (!(lang in this.dictionary)) return
    this.lang = lang
    saveJson(STORAGE_KEYS.lang, lang)
    applyLangAttributes(lang)
    updateHeadMeta(this.content.meta)
  },
  toggleLang() {
    this.setLang(this.lang === 'fr' ? 'ar' : 'fr')
  },
  track(action) {
    if (!action) return
    this.stats[action] = (this.stats[action] || 0) + 1
    saveJson(STORAGE_KEYS.stats, this.stats)
  },
  addLead(lead) {
    this.leads.push(lead)
    saveJson(STORAGE_KEYS.leads, this.leads)
  }
}

function downloadCsv(leads) {
  if (!leads.length) return
  const headers = ['name', 'company', 'email', 'phone', 'message', 'lang', 'timestamp']
  const rows = [headers]
  leads.forEach((lead) => {
    rows.push(
      headers.map((key) => {
        const value = lead[key] ?? ''
        const escaped = String(value).replace(/"/g, '""')
        return '"' + escaped + '"'
      })
    )
  })
  const csv = rows.map((row) => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'landing-leads.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

applyLangAttributes(defaultLang)
updateHeadMeta(DICT[defaultLang].meta)

Alpine.store('landing', landingStore)

window.landingApp = function landingApp() {
  return {
    navOpen: false,
    scrolled: false,
    featureFocus: Alpine.store('landing').content.features.tiles?.[0]?.id ?? null,
    lead: {
      name: '',
      company: '',
      email: '',
      phone: '',
      message: ''
    },
    formFeedback: {
      type: 'info',
      message: ''
    },
    toast: {
      visible: false,
      type: 'success',
      title: '',
      message: '',
      timeout: null
    },
    init() {
      const store = Alpine.store('landing')
      if (!store) Alpine.store('landing', landingStore)
      Alpine.store('landing').setLang(landingStore.lang)
      this.handleScroll()
      this.$watch('navOpen', (open) => {
        document.documentElement.classList.toggle('overflow-hidden', Boolean(open))
        document.body.classList.toggle('overflow-hidden', Boolean(open))
      })
      this.$watch('$store.landing.lang', () => {
        const next = Alpine.store('landing').content.features.tiles?.[0]?.id ?? null
        this.featureFocus = next
      })
      window.addEventListener('scroll', () => this.handleScroll(), { passive: true })
    },
    setFeature(id) {
      this.featureFocus = id
    },
    isFeatureActive(id) {
      return this.featureFocus === id
    },
    resetForm() {
      this.lead = {
        name: '',
        company: '',
        email: '',
        phone: '',
        message: ''
      }
    },
    showFeedback(type, message) {
      this.formFeedback = { type, message }
    },
    submitLead() {
      const payload = {
        name: this.lead.name?.trim(),
        company: this.lead.company?.trim(),
        email: this.lead.email?.trim(),
        phone: this.lead.phone?.trim(),
        message: this.lead.message?.trim()
      }
      const isValid = Object.values(payload).every((value) => Boolean(value))
      if (!isValid) {
        this.showFeedback('error', Alpine.store('landing').content.contact.error)
        return
      }
      this.showFeedback('info', '')
      const leadEntry = {
        ...payload,
        lang: Alpine.store('landing').lang,
        timestamp: new Date().toISOString()
      }
      Alpine.store('landing').addLead(leadEntry)
      this.showToast('success', Alpine.store('landing').content.toast.title, Alpine.store('landing').content.toast.description)
      this.resetForm()
    },
    exportCsv() {
      const leads = Alpine.store('landing').leads
      if (!leads.length) {
        this.showFeedback('warning', Alpine.store('landing').content.contact.noLeads)
        return
      }
      downloadCsv(leads)
      this.showFeedback('info', '')
    },
    showToast(type, title, message) {
      this.toast.type = type
      this.toast.title = title
      this.toast.message = message
      this.toast.visible = true
      if (this.toast.timeout) window.clearTimeout(this.toast.timeout)
      this.toast.timeout = window.setTimeout(() => {
        this.dismissToast()
      }, 4200)
    },
    dismissToast() {
      this.toast.visible = false
      if (this.toast.timeout) window.clearTimeout(this.toast.timeout)
      this.toast.timeout = null
    },
    scrollTo(hash) {
      this.navOpen = false
      if (!hash) return
      const target = document.querySelector(hash)
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    handleScroll() {
      this.scrolled = window.scrollY > 16
    }
  }
}

Alpine.start()
