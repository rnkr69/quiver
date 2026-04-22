import type { FieldProps } from './index'

export function CheckboxField({ field, value, onChange, readOnly }: FieldProps) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: readOnly ? 'default' : 'pointer' }}>
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={e => onChange(e.target.checked)}
        disabled={readOnly}
        style={{ width: 16, height: 16, accentColor: '#009ca6' }}
      />
      <span style={{ fontSize: 14, color: '#1a1a1a' }}>
        {field.label}
        {field.required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </span>
    </label>
  )
}
