'use client'

import { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple'
}

const colorClasses = {
  blue: 'text-blue-500 bg-blue-500/10',
  green: 'text-green-500 bg-green-500/10',
  orange: 'text-orange-500 bg-orange-500/10',
  red: 'text-red-500 bg-red-500/10',
  purple: 'text-purple-500 bg-purple-500/10',
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <Card className="p-6 hover:bg-claude-surface-hover transition-all duration-300 border-claude-border hover:border-claude-accent/30">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-claude-text-muted mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-claude-text mb-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-claude-text-muted">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-claude-text-muted">vs mois dernier</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  )
}
