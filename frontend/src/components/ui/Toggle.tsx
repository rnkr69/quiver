import { type CSSProperties } from 'react'

interface ToggleProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  style?: CSSProperties
}

export function Toggle({ checked = false, onChange, disabled, label, style }: ToggleProps) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>
      <div
        onClick={() => !disabled && onChange?.(!checked)}
        style={{
          position: 'relative', width: 36, height: 20, borderRadius: 10,
          background: checked ? 'var(--brand-500)' : 'var(--gray-300)',
          transition: 'background 0.2s', flexShrink: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <div style={{
          position: 'absolute', top: 2,
          left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.2s',
        }} />
      </div>
      {label && <span style={{ fontSize: 14, color: 'var(--gray-800)' }}>{label}</span>}
    </label>
  )
}
