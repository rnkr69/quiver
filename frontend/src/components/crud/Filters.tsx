import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { FilterConfig } from '@/api/crud.api'

interface Props {
  filters: FilterConfig[]
  values: Record<string, string>
  onChange: (values: Record<string, string>) => void
  onReset: () => void
}

const inputClass = 'w-full px-[10px] py-[7px] rounded border border-gray-300 text-md text-gray-900 font-sans outline-none bg-white focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/20 transition-shadow'

export function Filters({ filters, values, onChange, onReset }: Props) {
  const [open, setOpen] = useState(false)
  if (filters.length === 0) return null

  const hasActive = Object.values(values).some(v => v !== '' && v !== undefined)

  function set(key: string, value: string) {
    onChange({ ...values, [key]: value })
  }

  return (
    <div className="mb-3">
      <div className="flex gap-2 items-center">
        <div className="relative">
          <Button
            variant="secondary" size="sm"
            onClick={() => setOpen(o => !o)}
          >
            Filtros {open ? '▲' : '▼'}
          </Button>
          {hasActive && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-500" />
          )}
        </div>
        {hasActive && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {open && (
        <div className="mt-2 p-4 bg-white rounded-lg border border-gray-200 shadow-sm grid [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] gap-3">
          {filters.map(filter => (
            <div key={filter.key}>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {filter.label}
              </label>
              {filter.type === 'select' ? (
                <select
                  value={values[filter.key] ?? ''}
                  onChange={e => set(filter.key, e.target.value)}
                  className={cn(inputClass, 'cursor-pointer')}
                >
                  <option value="">Todos</option>
                  {filter.choices?.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              ) : filter.type === 'boolean' ? (
                <select
                  value={values[filter.key] ?? ''}
                  onChange={e => set(filter.key, e.target.value)}
                  className={cn(inputClass, 'cursor-pointer')}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              ) : (
                <input
                  type={filter.type === 'date' ? 'date' : 'text'}
                  value={values[filter.key] ?? ''}
                  onChange={e => set(filter.key, e.target.value)}
                  className={inputClass}
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
