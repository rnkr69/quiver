import type { CSSProperties, ReactNode } from 'react'

// Handoff variants
export type BadgeVariant =
  | 'active' | 'inactive' | 'success' | 'danger' | 'warning' | 'admin' | 'client'
  // Legacy color aliases kept for backwards compatibility
  | 'green' | 'red' | 'gray' | 'amber' | 'blue'

interface BadgeStyle { background: string; color: string; border: string }

const VARIANTS: Record<BadgeVariant, BadgeStyle> = {
  active:   { background: 'var(--brand-50)',   color: 'var(--brand-700)',   border: '1px solid var(--brand-100)' },
  inactive: { background: 'var(--gray-100)',   color: 'var(--gray-600)',    border: '1px solid var(--gray-200)' },
  success:  { background: 'var(--success-50)', color: 'var(--success-500)', border: '1px solid #c3e6d7' },
  danger:   { background: 'var(--danger-50)',  color: 'var(--danger-500)',  border: '1px solid #f5c6c6' },
  warning:  { background: 'var(--warning-50)', color: 'var(--warning-500)', border: '1px solid #f0d9a0' },
  admin:    { background: '#1a1a2e',           color: 'white',              border: 'none' },
  client:   { background: 'var(--brand-50)',   color: 'var(--brand-700)',   border: '1px solid var(--brand-100)' },
  // Legacy aliases
  green:    { background: 'var(--success-50)', color: 'var(--success-500)', border: '1px solid #c3e6d7' },
  red:      { background: 'var(--danger-50)',  color: 'var(--danger-500)',  border: '1px solid #f5c6c6' },
  gray:     { background: 'var(--gray-100)',   color: 'var(--gray-600)',    border: '1px solid var(--gray-200)' },
  amber:    { background: 'var(--warning-50)', color: 'var(--warning-500)', border: '1px solid #f0d9a0' },
  blue:     { background: 'var(--brand-50)',   color: 'var(--brand-700)',   border: '1px solid var(--brand-100)' },
}

const baseStyle: CSSProperties = {
  fontSize: 12, fontWeight: 500, lineHeight: 1.4,
  padding: '2px 8px', borderRadius: 4,
  whiteSpace: 'nowrap', display: 'inline-block',
}

interface BadgeProps {
  variant?: BadgeVariant
  /** Legacy prop — maps 'green'|'red'|'gray'|'amber'|'blue' to variant */
  color?: BadgeVariant
  children?: ReactNode
  /** Legacy prop */
  value?: string
}

export function Badge({ variant, color, children, value }: BadgeProps) {
  const v = variant ?? color ?? 'inactive'
  const s = VARIANTS[v] ?? VARIANTS.inactive
  return (
    <span style={{ ...baseStyle, background: s.background, color: s.color, border: s.border }}>
      {children ?? value}
    </span>
  )
}
