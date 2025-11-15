'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, defaultLocale } from './config'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Récupérer la locale du localStorage au démarrage
    const savedLocale = localStorage.getItem('locale') as Locale | null
    if (savedLocale && ['fr', 'ar', 'en'].includes(savedLocale)) {
      setLocaleState(savedLocale)
      // Appliquer la direction RTL pour l'arabe
      document.documentElement.lang = savedLocale
      document.documentElement.dir = savedLocale === 'ar' ? 'rtl' : 'ltr'
    }
    setMounted(true)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    // Mettre à jour l'attribut lang et dir du HTML
    document.documentElement.lang = newLocale
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr'
  }

  // Éviter le flash de contenu non traduit
  if (!mounted) {
    return null
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
