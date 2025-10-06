import Alpine from 'alpinejs'
import '../styles/tailwind.css'
import '../styles/tokens.css'
import '../styles/landing.css'
import contentFr from './content-fr.json'
import contentAr from './content-ar.json'

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
  } catch (err) {
    console.warn(`[landing] unable to parse ${key}`, err)
    return fallback
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.warn(`[landing] unable to persist ${key}`, err)
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
  const description = document.querySelector('meta[name="description"]')
  if (description) description.setAttribute('content', meta.description)
  const ogTitle = document.querySelector('meta[property="og:title"]')
  if (ogTitle) ogTitle.setAttribute('content', meta.title)
  const ogDesc = document.querySelector('meta[property="og:description"]')
  if (ogDesc) ogDesc.setAttribute('content', meta.description)
  const twitterTitle = document.querySelector('meta[name="twitter:title"]')
  if (twitterTitle) twitterTitle.setAttribute('content', meta.title)
  const twitterDesc = document.querySelector('meta[name="twitter:description"]')
  if (twitterDesc) twitterDesc.setAttribute('content', meta.description)
}

const defaultLang = (() => {
  const stored = localStorage.getItem(STORAGE_KEYS.lang)
  if (stored && stored in DICT) return stored
  return 'fr'
})()

const landingStore = {
  lang: defaultLang,
  dictionary: DICT,
  leads: loadJson(STORAGE_KEYS.leads, []),
  stats: loadJson(STORAGE_KEYS.stats, {}),
  get content() {
    return this.dictionary[this.lang]
  },
  setLang(lang) {
    if (!(lang in this.dictionary)) return
    this.lang = lang
    localStorage.setItem(STORAGE_KEYS.lang, lang)
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
    rows.push(headers.map((key) => {
      const value = lead[key] ?? ''
      const escaped = String(value).replace(/"/g, '""')
      return `"${escaped}"`
    }))
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
    lead: {
      name: '',
      company: '',
      email: '',
      phone: '',
      message: ''
    },
    formFeedback: '',
    toast: {
      visible: false,
      timeout: null
    },
    init() {
      const store = Alpine.store('landing')
      if (!store) Alpine.store('landing', landingStore)
      Alpine.store('landing').setLang(landingStore.lang)
      this.onScroll()
      this.$watch('navOpen', (open) => {
        document.documentElement.classList.toggle('overflow-hidden', Boolean(open))
        document.body.classList.toggle('overflow-hidden', Boolean(open))
      })
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
        this.formFeedback = Alpine.store('landing').content.contact.error
        return
      }
      this.formFeedback = ''
      const leadEntry = {
        ...payload,
        lang: Alpine.store('landing').lang,
        timestamp: new Date().toISOString()
      }
      Alpine.store('landing').addLead(leadEntry)
      this.showToast()
      this.resetForm()
    },
    showToast() {
      this.toast.visible = true
      if (this.toast.timeout) window.clearTimeout(this.toast.timeout)
      this.toast.timeout = window.setTimeout(() => {
        this.toast.visible = false
      }, 4000)
    },
    dismissToast() {
      this.toast.visible = false
      if (this.toast.timeout) window.clearTimeout(this.toast.timeout)
    },
    scrollToContact() {
      this.navOpen = false
      const target = this.$refs?.contactSection
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    exportCsv() {
      const leads = Alpine.store('landing').leads
      if (!leads.length) {
        this.formFeedback = Alpine.store('landing').content.contact.noLeads
        return
      }
      this.formFeedback = ''
      downloadCsv(leads)
    },
    onScroll() {
      this.scrolled = window.scrollY > 12
    }
  }
}

Alpine.directive('intersect', (el, { modifiers, expression }, { evaluateLater, cleanup }) => {
  const evaluate = evaluateLater(expression)
  const once = modifiers.includes('once')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        evaluate(() => {})
        if (once) observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.2 })
  observer.observe(el)
  cleanup(() => observer.disconnect())
})

Alpine.start()
