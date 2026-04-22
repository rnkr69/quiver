import type { FieldProps } from './index'

export function NumberField({ field, value, onChange, error, readOnly }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#3d3d3d' }}>
        {field.label}{field.required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      <input
        type="number"
        value={value === null || value === undefined ? '' : String(value)}
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
        readOnly={readOnly}
        style={{
          width: '100%', padding: '8px 10px', borderRadius: 6,
          border: `1px solid ${error ? '#f87171' : '#e8e8e8'}`,
          fontSize: 14, color: '#1a1a1a', fontFamily: 'inherit',
          backgroundColor: readOnly ? '#f9f9f9' : '#ffffff',
          boxSizing: 'border-box',
        }}
      />
      {error && <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>}
    </div>
  )
}
