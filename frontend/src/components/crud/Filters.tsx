import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { FilterConfig } from '@/api/crud.api'

interface Props {
  filters: FilterConfig[]
  values: Record<string, string>
  onChange: (values: Record<string, string>) => void
  onReset: () => void
}

export function Filters({ filters, values, onChange, onReset }: Props) {
  const [open, setOpen] = useState(false)
  if (filters.length === 0) return null

  const hasActive = Object.values(values).some(v => v !== '' && v !== undefined)

  function set(key: string, value: string) {
    onChange({ ...values, [key]: value })
  }

  const inputStyle: React.CSSProperties = {
    padding: '7px 10px', borderRadius: 4, fontSize: 13, color: 'var(--gray-900)',
    border: '1px solid var(--gray-300)', background: 'white',
    width: '100%', fontFamily: 'inherit', outline: 'none',
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button
          variant="secondary" size="sm"
          onClick={() => setOpen(o => !o)}
          style={{ position: 'relative' }}
        >
          Filtros {open ? '▲' : '▼'}
          {hasActive && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-500)',
            }} />
          )}
        </Button>
        {hasActive && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {open && (
        <div style={{
          marginTop: 8, padding: 16,
          background: 'white', borderRadius: 8, border: '1px solid var(--gray-200)',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12,
        }}>
          {filters.map(filter => (
            <div key={filter.key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 4 }}>
                {filter.label}
              </label>
              {filter.type === 'select' ? (
                <select value={values[filter.key] ?? ''} onChange={e => set(filter.key, e.target.value)} style={inputStyle}>
                  <option value="">Todos</option>
                  {filter.choices?.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              ) : filter.type === 'boolean' ? (
                <select value={values[filter.key] ?? ''} onChange={e => set(filter.key, e.target.value)} style={inputStyle}>
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              ) : (
                <input
                  type={filter.type === 'date' ? 'date' : 'text'}
                  value={values[filter.key] ?? ''}
                  onChange={e => set(filter.key, e.target.value)}
                  style={inputStyle}
                  placeholder={`Buscar ${filter.label.toLowerCase()}...`}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
