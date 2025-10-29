'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Banknote,
  BookOpen,
  Receipt,
  Users,
  Settings,
  Calculator,
  Menu,
  X,
  FileSpreadsheet,
  UserCheck,
  Truck,
  HelpCircle,
  FileCheck,
  AlertTriangle,
  Mail,
} from 'lucide-react'
import { LanguageSelector } from './LanguageSelector'
import { useT, TranslationKey } from '@/lib/i18n/translations'

const navigation: Array<{ nameKey: TranslationKey; href: string; icon: any }> = [
  { nameKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { nameKey: 'nav.sales', href: '/sales', icon: FileText },
  { nameKey: 'nav.invoices', href: '/invoices', icon: Receipt },
  { nameKey: 'nav.invoices.overdue', href: '/invoices/overdue', icon: AlertTriangle },
  { nameKey: 'nav.quotes', href: '/quotes', icon: FileCheck },
  { nameKey: 'nav.purchases', href: '/purchases', icon: ShoppingCart },
  { nameKey: 'nav.customers', href: '/customers', icon: UserCheck },
  { nameKey: 'nav.suppliers', href: '/suppliers', icon: Truck },
  { nameKey: 'nav.bank', href: '/bank', icon: Banknote },
  { nameKey: 'nav.ledger', href: '/ledger', icon: BookOpen },
  { nameKey: 'nav.financial-statements', href: '/financial-statements', icon: FileSpreadsheet },
  { nameKey: 'nav.tax', href: '/tax', icon: Receipt },
  { nameKey: 'nav.payroll', href: '/payroll', icon: Users },
  { nameKey: 'nav.guide', href: '/guide', icon: HelpCircle },
  { nameKey: 'nav.contact', href: '/contact', icon: Mail },
  { nameKey: 'nav.settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useT()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      {/* Bouton menu mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-claude-accent rounded-lg flex items-center justify-center text-white shadow-lg"
        aria-label="Menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Overlay mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:sticky top-0 h-screen w-64 bg-claude-surface border-r border-claude-border flex flex-col z-40 transition-transform duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-claude-border">
          <Link href="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-claude-accent rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-claude-text">MizanPro</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            // Check if pathname matches this item
            const matchesPath = pathname === item.href || pathname.startsWith(item.href + '/')

            // Check if there's a more specific menu item that should be active instead
            const hasMoreSpecificMatch = matchesPath && navigation.some(
              (navItem) =>
                navItem.href !== item.href &&
                navItem.href.startsWith(item.href + '/') &&
                (pathname === navItem.href || pathname.startsWith(navItem.href + '/'))
            )

            // Only set active if it matches and there's no more specific match
            const isActive = matchesPath && !hasMoreSpecificMatch
            const Icon = item.icon

            return (
              <Link
                key={item.nameKey}
                href={item.href}
                onClick={closeMobileMenu}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-claude-accent text-white'
                    : 'text-claude-text-muted hover:bg-claude-surface-hover hover:text-claude-text'
                )}
              >
                <Icon className="w-5 h-5" />
                {t(item.nameKey)}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-claude-border space-y-3">
          <LanguageSelector />
          <p className="text-xs text-claude-text-subtle text-center">Version 2.0.0</p>
        </div>
      </aside>
    </>
  )
}
