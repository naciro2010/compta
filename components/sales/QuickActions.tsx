'use client'

import { Button } from '@/components/ui/Button'
import { Plus, FileText, Users, Receipt, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      label: 'Nouvelle facture',
      icon: FileText,
      color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border-blue-500/30',
      onClick: () => router.push('/invoices'),
    },
    {
      label: 'Nouveau devis',
      icon: Receipt,
      color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border-purple-500/30',
      onClick: () => router.push('/quotes'),
    },
    {
      label: 'Nouveau client',
      icon: Users,
      color: 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/30',
      onClick: () => router.push('/customers'),
    },
    {
      label: 'Voir statistiques',
      icon: TrendingUp,
      color: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border-orange-500/30',
      onClick: () => router.push('/financial-statements'),
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${action.color}`}
        >
          <div className="flex items-center gap-3">
            <action.icon className="w-5 h-5" />
            <span className="font-medium">{action.label}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
