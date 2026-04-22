import type { ReactNode, CSSProperties } from 'react'

interface DetailFieldProps {
  label: string
  value?: ReactNode
  style?: CSSProperties
}

export function DetailField({ label, value, style }: DetailFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, ...style }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-600)' }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--gray-900)' }}>{value ?? '—'}</span>
    </div>
  )
}
