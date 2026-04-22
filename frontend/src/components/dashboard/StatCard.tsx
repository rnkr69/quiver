import { TrendingUp, TrendingDown } from 'lucide-react'
import type { ReactNode } from 'react'

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
    <div style={{
      background: 'white', border: '1px solid var(--gray-200)',
      borderRadius: 8, padding: 20, boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'var(--brand-50)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--brand-500)',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--gray-900)', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {typeof value === 'number' ? value.toLocaleString('es') : String(value)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>{title}</div>
        </div>
        {delta !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: positive ? 'var(--success-500)' : 'var(--danger-500)' }}>
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(delta)}%</span>
            {data.delta_label && <span style={{ color: 'var(--gray-500)' }}>{data.delta_label}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
