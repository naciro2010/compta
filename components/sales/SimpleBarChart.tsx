'use client'

import { Card } from '@/components/ui/Card'

interface BarChartData {
  label: string
  value: number
  color?: string
}

interface SimpleBarChartProps {
  title: string
  data: BarChartData[]
  height?: number
  formatValue?: (value: number) => string
}

export function SimpleBarChart({
  title,
  data,
  height = 300,
  formatValue = (v) => v.toLocaleString('fr-MA')
}: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-claude-text mb-6">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100
          const barColor = item.color || 'bg-claude-accent'

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-claude-text-muted font-medium">{item.label}</span>
                <span className="text-claude-text font-semibold">{formatValue(item.value)}</span>
              </div>
              <div className="h-2 bg-claude-surface rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-500 ease-out rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
