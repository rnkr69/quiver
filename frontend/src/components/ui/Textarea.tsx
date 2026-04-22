import { useState, type CSSProperties, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  required?: boolean
  error?: string
  hint?: string
  containerStyle?: CSSProperties
}

export function Textarea({ label, required, error, hint, containerStyle, ...props }: TextareaProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...containerStyle }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', lineHeight: 1.4 }}>
          {label}
          {required && <span style={{ color: 'var(--danger-500)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <textarea
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        style={{
          padding: '8px 12px', fontSize: 14, color: 'var(--gray-900)',
          fontFamily: 'inherit',
          border: error
            ? '1px solid var(--danger-500)'
            : focused
              ? '2px solid var(--brand-500)'
              : '1px solid var(--gray-300)',
          borderRadius: 4, outline: 'none',
          background: props.disabled ? 'var(--gray-50)' : 'white',
          boxShadow: focused && !error ? '0 0 0 3px rgba(0,156,166,0.12)' : 'none',
          width: '100%', boxSizing: 'border-box',
          minHeight: 90, resize: 'vertical',
          ...props.style,
        }}
      />
      {hint && !error && <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: 'var(--danger-500)' }}>{error}</span>}
    </div>
  )
}
