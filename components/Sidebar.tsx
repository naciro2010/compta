'use client'

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
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Ventes', href: '/sales', icon: FileText },
  { name: 'Achats', href: '/purchases', icon: ShoppingCart },
  { name: 'Banque', href: '/bank', icon: Banknote },
  { name: 'Grand livre', href: '/ledger', icon: BookOpen },
  { name: 'TVA', href: '/tax', icon: Receipt },
  { name: 'Paie', href: '/payroll', icon: Users },
  { name: 'Paramètres', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-claude-surface border-r border-claude-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-claude-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-claude-accent rounded-lg flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-claude-text">CGNC Flow</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-claude-accent text-white'
                  : 'text-claude-text-muted hover:bg-claude-surface-hover hover:text-claude-text'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-claude-border">
        <p className="text-xs text-claude-text-subtle">Version 2.0.0</p>
      </div>
    </aside>
  )
}
