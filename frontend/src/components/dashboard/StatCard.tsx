import { TrendingUp, TrendingDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  icon?: ReactNode
  data: {
    value?: number | string
    delta?: number
    delta_label?: string
  }
}

export function StatCard({ title, icon, data }: Props) {
  const value = data.value ?? 0
  const delta = data.delta
  const positive = delta !== undefined && delta >= 0

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
          {icon}
        </div>
        <div>
          <div className="text-5xl font-semibold text-gray-900 leading-none tracking-[-0.02em]">
            {typeof value === 'number' ? value.toLocaleString('es') : String(value)}
          </div>
          <div className="text-md text-gray-600 mt-[3px]">{title}</div>
        </div>
        {delta !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs', positive ? 'text-success-500' : 'text-danger-500')}>
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(delta)}%</span>
            {data.delta_label && <span className="text-gray-500">{data.delta_label}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
