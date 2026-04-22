import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  required?: boolean
  error?: string
}

export function PasswordInput({ label, required, error, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false)
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)' }}>
          {label}
          {required && <span style={{ color: 'var(--danger-500)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          {...props}
          type={show ? 'text' : 'password'}
          onFocus={e => { setFocused(true); props.onFocus?.(e) }}
          onBlur={e => { setFocused(false); props.onBlur?.(e) }}
          style={{
            padding: '8px 40px 8px 12px', fontSize: 14,
            color: 'var(--gray-900)', fontFamily: 'inherit',
            border: error
              ? '1px solid var(--danger-500)'
              : focused
                ? '2px solid var(--brand-500)'
                : '1px solid var(--gray-300)',
            borderRadius: 4, outline: 'none',
            width: '100%', boxSizing: 'border-box',
            background: 'white',
            boxShadow: focused && !error ? '0 0 0 3px rgba(0,156,166,0.12)' : 'none',
            ...props.style,
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--gray-400)', padding: 0, display: 'flex',
          }}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <span style={{ fontSize: 12, color: 'var(--danger-500)' }}>{error}</span>}
    </div>
  )
}
