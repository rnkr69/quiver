import type { CSSProperties, ReactNode, ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
export type ButtonSize = 'sm' | 'md'

const base: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  fontFamily: 'inherit', fontWeight: 500, fontSize: 13,
  borderRadius: 6, cursor: 'pointer',
  transition: 'background 0.15s, opacity 0.15s',
  lineHeight: 1, whiteSpace: 'nowrap', textDecoration: 'none',
}

export const btnStyles: Record<ButtonVariant, CSSProperties> = {
  primary:   { ...base, background: 'var(--brand-500)', color: 'white',             padding: '8px 16px', border: '1px solid transparent' },
  secondary: { ...base, background: 'white',            color: 'var(--gray-800)',   padding: '8px 16px', border: '1px solid var(--gray-300)' },
  ghost:     { ...base, background: 'transparent',      color: 'var(--gray-700)',   padding: '6px 10px', border: '1px solid transparent' },
  danger:    { ...base, background: 'white',            color: 'var(--danger-500)', padding: '8px 16px', border: '1px solid var(--danger-500)' },
  link:      { ...base, background: 'transparent',      color: 'var(--brand-500)',  padding: 0,          border: 'none', fontWeight: 400 },
}

const smOverride: Record<ButtonVariant, CSSProperties> = {
  primary:   { padding: '5px 12px', fontSize: 12 },
  secondary: { padding: '5px 12px', fontSize: 12 },
  ghost:     { padding: '4px 8px',  fontSize: 12 },
  danger:    { padding: '5px 12px', fontSize: 12 },
  link:      { fontSize: 12 },
}

function Spinner() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading, disabled, children, style, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{ ...btnStyles[variant], ...(size === 'sm' ? smOverride[variant] : {}), opacity: (disabled || loading) ? 0.7 : 1, ...style }}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}
