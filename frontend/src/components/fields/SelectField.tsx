import { useEffect, useState } from 'react'
import { apiClient } from '@/api/client'
import type { FieldProps } from './index'

interface Choice { value: string; label: string }

export function SelectField({ field, value, onChange, error, readOnly }: FieldProps) {
  const [choices, setChoices] = useState<Choice[]>(field.choices ?? [])
  const multiple = field.field_type === 'select_multiple'

  useEffect(() => {
    if (!field.choices_endpoint || field.choices?.length) return
    apiClient.get<Choice[]>(field.choices_endpoint)
      .then(r => setChoices(r.data))
      .catch(() => {})
  }, [field.choices_endpoint])

  const selectedValues: string[] = multiple
    ? (Array.isArray(value) ? (value as string[]) : [])
    : []

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', borderRadius: 6,
    border: `1px solid ${error ? '#f87171' : '#e8e8e8'}`,
    fontSize: 14, color: '#1a1a1a', fontFamily: 'inherit',
    backgroundColor: readOnly ? '#f9f9f9' : '#ffffff',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#3d3d3d' }}>
        {field.label}{field.required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      {multiple ? (
        <select
          multiple
          value={selectedValues}
          onChange={e => onChange(Array.from(e.target.selectedOptions, o => o.value))}
          disabled={readOnly}
          style={{ ...inputStyle, minHeight: 100 }}
        >
          {choices.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      ) : (
        <select
          value={String(value ?? '')}
          onChange={e => onChange(e.target.value || null)}
          disabled={readOnly}
          style={inputStyle}
        >
          <option value="">— Seleccionar —</option>
          {choices.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      )}
      {error && <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>}
      {field.help_text && !error && (
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{field.help_text}</span>
      )}
    </div>
  )
}
