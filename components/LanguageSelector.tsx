'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import { clsx } from 'clsx'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { Locale } from '@/lib/i18n/config'

const languages = [
  { code: 'fr' as Locale, name: 'Français', flag: '🇫🇷' },
  { code: 'ar' as Locale, name: 'العربية', flag: '🇲🇦' },
  { code: 'en' as Locale, name: 'English', flag: '🇬🇧' },
]

export function LanguageSelector() {
  const { locale: currentLocale, setLocale } = useLocale()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (locale: Locale) => {
    setLocale(locale)
    setIsOpen(false)
  }

  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-claude-text-muted hover:bg-claude-surface-hover hover:text-claude-text transition-colors w-full"
        aria-label="Changer la langue"
      >
        <Globe className="w-5 h-5" />
        <span className="flex items-center gap-2">
          <span>{currentLanguage.flag}</span>
          <span>{currentLanguage.name}</span>
        </span>
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer le dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu dropdown */}
          <div className="absolute bottom-full left-0 mb-2 w-full bg-claude-surface border border-claude-border rounded-lg shadow-lg z-20 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 text-sm w-full transition-colors',
                  lang.code === currentLocale
                    ? 'bg-claude-accent text-white'
                    : 'text-claude-text hover:bg-claude-surface-hover'
                )}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
