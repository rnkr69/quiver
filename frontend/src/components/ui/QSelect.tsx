import { useState, type CSSProperties, type SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string | number
  label: string
}

interface QSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  required?: boolean
  error?: string
  options?: (SelectOption | string)[]
  containerStyle?: CSSProperties
}

export function QSelect({ label, required, error, options = [], containerStyle, ...props }: QSelectProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...containerStyle }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)' }}>
          {label}
          {required && <span style={{ color: 'var(--danger-500)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <select
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        style={{
          padding: '8px 12px', fontSize: 14, color: 'var(--gray-900)',
          fontFamily: 'inherit',
          border: focused ? '2px solid var(--brand-500)' : '1px solid var(--gray-300)',
          borderRadius: 4, outline: 'none', background: 'white',
          width: '100%', boxSizing: 'border-box',
          boxShadow: focused ? '0 0 0 3px rgba(0,156,166,0.12)' : 'none',
          ...props.style,
        }}
      >
        {options.map(o => {
          const val = typeof o === 'string' ? o : String(o.value)
          const lbl = typeof o === 'string' ? o : o.label
          return <option key={val} value={val}>{lbl}</option>
        })}
        {props.children}
      </select>
      {error && <span style={{ fontSize: 12, color: 'var(--danger-500)' }}>{error}</span>}
    </div>
  )
}
